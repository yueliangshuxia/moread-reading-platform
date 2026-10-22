package com.moread.repository;

import com.moread.domain.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByBookIdOrderByOrderNoAsc(String bookId);

    Optional<Chapter> findByBookIdAndOrderNo(String bookId, Integer orderNo);

    long countByBookId(String bookId);
}
