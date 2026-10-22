package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.*;
import com.moread.dto.CommentDto;
import com.moread.dto.PostDetailDto;
import com.moread.dto.PostDto;
import com.moread.dto.Requests;
import com.moread.repository.BookRepository;
import com.moread.repository.PostCommentRepository;
import com.moread.repository.PostLikeRepository;
import com.moread.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostRepository posts;
    private final PostCommentRepository comments;
    private final PostLikeRepository likes;
    private final BookRepository books;

    @Transactional(readOnly = true)
    public List<PostDto> list(String topic, User currentUser) {
        List<Post> list = topic == null || topic.isBlank() || "全部".equals(topic)
                ? posts.findAllByOrderByCreatedAtDesc()
                : posts.findByTopicOrderByCreatedAtDesc(topic);
        return list.stream().map(p -> toDto(p, currentUser)).toList();
    }

    @Transactional(readOnly = true)
    public PostDetailDto detail(String postId, User currentUser) {
        Post post = post(postId);
        return new PostDetailDto(toDto(post, currentUser), comments(postId));
    }

    @Transactional(readOnly = true)
    public List<CommentDto> comments(String postId) {
        Post post = post(postId);
        return comments.findByPostOrderByCreatedAtAsc(post).stream().map(DtoMapper::toComment).toList();
    }

    @Transactional
    public PostDto create(User user, Requests.Post req) {
        Book book = null;
        if (req.bookId() != null && !req.bookId().isBlank()) {
            book = books.findByIdAndListedTrue(req.bookId())
                    .orElseThrow(() -> BusinessException.notFound("关联的书不存在"));
        }
        Post post = Post.builder()
                .id("p-" + System.currentTimeMillis())
                .user(user)
                .topic(req.topic().trim())
                .content(req.content().trim())
                .book(book)
                .image("")
                .likes(0)
                .commentCount(0)
                .createdAt(LocalDateTime.now())
                .build();
        posts.save(post);
        return toDto(post, user);
    }

    @Transactional
    public CommentDto addComment(User user, String postId, Requests.Comment req) {
        Post post = post(postId);
        PostComment comment = PostComment.builder()
                .post(post)
                .user(user)
                .content(req.content().trim())
                .createdAt(LocalDateTime.now())
                .build();
        comments.save(comment);
        post.setCommentCount((post.getCommentCount() == null ? 0 : post.getCommentCount()) + 1);
        posts.save(post);
        return DtoMapper.toComment(comment);
    }

    @Transactional
    public int toggleLike(User user, String postId) {
        Post post = post(postId);
        PostLike like = likes.findByUserAndPost(user, post).orElse(null);
        int current = post.getLikes() == null ? 0 : post.getLikes();
        if (like == null) {
            likes.save(PostLike.builder().user(user).post(post).createdAt(LocalDateTime.now()).build());
            post.setLikes(current + 1);
        } else {
            likes.delete(like);
            post.setLikes(Math.max(0, current - 1));
        }
        posts.save(post);
        return post.getLikes();
    }

    private Post post(String postId) {
        return posts.findById(postId).orElseThrow(() -> BusinessException.notFound("讨论不存在"));
    }

    private PostDto toDto(Post post, User user) {
        boolean liked = user != null && likes.existsByUserAndPost(user, post);
        return DtoMapper.toPost(post, liked);
    }
}
