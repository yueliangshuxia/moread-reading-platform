package com.moread.repository;

import com.moread.domain.Post;
import com.moread.domain.PostLike;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByUserAndPost(User user, Post post);

    boolean existsByUserAndPost(User user, Post post);

    long countByPost(Post post);

    void deleteByUserAndPost(User user, Post post);
}
