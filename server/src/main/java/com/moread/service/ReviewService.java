package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.*;
import com.moread.dto.ReviewDto;
import com.moread.dto.Requests;
import com.moread.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviews;
    private final ReviewLikeRepository likes;
    private final BookRepository books;
    private final ReadingEventRepository events;
    private final ProfileService profileService;
    private final RecommendationService recommendationService;

    @Transactional(readOnly = true)
    public List<ReviewDto> bookReviews(String bookId, User currentUser) {
        books.findByIdAndListedTrue(bookId).orElseThrow(() -> BusinessException.notFound("图书不存在"));
        return reviews.findByBookIdAndStatusOrderByCreatedAtDesc(bookId, ReviewStatus.PASSED).stream()
                .map(r -> DtoMapper.toReview(r, currentUser != null && likes.existsByUserAndReview(currentUser, r)))
                .toList();
    }

    @Transactional
    public ReviewDto create(User user, String bookId, Requests.Review req) {
        Book book = books.findByIdAndListedTrue(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        Review review = Review.builder()
                .user(user)
                .book(book)
                .rating(req.rating())
                .content(req.content().trim())
                .status(ReviewStatus.PENDING)
                .likes(0)
                .createdAt(LocalDateTime.now())
                .build();
        reviews.save(review);
        events.save(ReadingEvent.builder()
                .user(user)
                .book(book)
                .eventType(ReadingEventType.REVIEW)
                .durationSeconds(0)
                .createdAt(LocalDateTime.now())
                .build());
        profileService.refresh(user);
        recommendationService.clearCache(user.getId());
        return DtoMapper.toReview(review, false);
    }

    @Transactional
    public int toggleLike(User user, Long reviewId) {
        Review review = reviews.findById(reviewId)
                .orElseThrow(() -> BusinessException.notFound("书评不存在"));
        ReviewLike like = likes.findByUserAndReview(user, review).orElse(null);
        int current = review.getLikes() == null ? 0 : review.getLikes();
        if (like == null) {
            likes.save(ReviewLike.builder().user(user).review(review).createdAt(LocalDateTime.now()).build());
            review.setLikes(current + 1);
        } else {
            likes.delete(like);
            review.setLikes(Math.max(0, current - 1));
        }
        reviews.save(review);
        return review.getLikes();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listByUser(User user) {
        return reviews.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> DtoMapper.toReview(r, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listAll(String status) {
        ReviewStatus parsed = parseStatus(status);
        List<Review> list = parsed == null
                ? reviews.findAllByOrderByCreatedAtDesc()
                : reviews.findByStatusOrderByCreatedAtDesc(parsed);
        return list.stream().map(r -> DtoMapper.toReview(r, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> recentPending() {
        return reviews.findTop5ByStatusOrderByCreatedAtDesc(ReviewStatus.PENDING).stream()
                .map(r -> DtoMapper.toReview(r, false))
                .toList();
    }

    @Transactional
    public ReviewDto moderate(Long id, ReviewStatus status) {
        Review review = reviews.findById(id)
                .orElseThrow(() -> BusinessException.notFound("书评不存在"));
        review.setStatus(status);
        reviews.save(review);
        return DtoMapper.toReview(review, false);
    }

    @Transactional(readOnly = true)
    public long pendingCount() {
        return reviews.countByStatus(ReviewStatus.PENDING);
    }

    private ReviewStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return null;
        try {
            return ReviewStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("未知的书评状态：" + status);
        }
    }
}
