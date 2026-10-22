package com.moread.repository;

import com.moread.domain.Post;
import com.moread.domain.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPostOrderByCreatedAtAsc(Post post);

    long countByPost(Post post);
}
