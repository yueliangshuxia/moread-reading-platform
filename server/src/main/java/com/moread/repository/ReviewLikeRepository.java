package com.moread.repository;

import com.moread.domain.Review;
import com.moread.domain.ReviewLike;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {

    Optional<ReviewLike> findByUserAndReview(User user, Review review);

    boolean existsByUserAndReview(User user, Review review);

    long countByReview(Review review);

    void deleteByUserAndReview(User user, Review review);
}
