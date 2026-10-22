package com.moread.repository;

import com.moread.domain.Review;
import com.moread.domain.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBookIdAndStatusOrderByCreatedAtDesc(String bookId, ReviewStatus status);

    List<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status);

    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findTop5ByStatusOrderByCreatedAtDesc(ReviewStatus status);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(ReviewStatus status);

    Optional<Review> findById(Long id);
}
