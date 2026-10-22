package com.moread.repository;

import com.moread.domain.Post;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, String> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByTopicOrderByCreatedAtDesc(String topic);

    Optional<Post> findById(String id);

    long countByUser(User user);
}
