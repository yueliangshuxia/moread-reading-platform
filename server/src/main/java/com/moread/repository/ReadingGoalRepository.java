package com.moread.repository;

import com.moread.domain.ReadingGoal;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReadingGoalRepository extends JpaRepository<ReadingGoal, Long> {

    Optional<ReadingGoal> findByUserAndYear(User user, Integer year);

    List<ReadingGoal> findByUser(User user);
}
