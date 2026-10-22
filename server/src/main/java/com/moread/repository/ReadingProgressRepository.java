package com.moread.repository;

import com.moread.domain.Book;
import com.moread.domain.ReadingProgress;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {

    Optional<ReadingProgress> findByUserAndBook(User user, Book book);

    List<ReadingProgress> findByUser(User user);

    List<ReadingProgress> findAll();
}
