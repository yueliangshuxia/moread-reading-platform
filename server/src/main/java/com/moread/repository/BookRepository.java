package com.moread.repository;

import com.moread.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, String> {

    List<Book> findAllByListedTrue();

    Optional<Book> findByIdAndListedTrue(String id);

    List<Book> findAllByListedTrueOrderByCreatedAtDesc();

    List<Book> findAllByFeaturedTrueAndListedTrue();

    List<Book> findAllByCategoryIdAndListedTrue(String categoryId);

    List<Book> findTop10ByListedTrueOrderByReadersDesc();

    long countByListedTrue();
}
