package com.moread.repository;

import com.moread.domain.Recommendation;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByUserAndBatchDateOrderByScoreDesc(User user, LocalDate batchDate);

    void deleteByUserAndBatchDate(User user, LocalDate batchDate);

    void deleteByBatchDate(LocalDate batchDate);

    long countByUserAndBatchDate(User user, LocalDate batchDate);
}
