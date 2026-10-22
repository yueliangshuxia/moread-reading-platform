package com.moread.repository;

import com.moread.domain.Book;
import com.moread.domain.ShelfItem;
import com.moread.domain.ShelfStatus;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShelfItemRepository extends JpaRepository<ShelfItem, Long> {

    List<ShelfItem> findByUserOrderByUpdatedAtDesc(User user);

    Optional<ShelfItem> findByUserAndBook(User user, Book book);

    List<ShelfItem> findByUserAndStatus(User user, ShelfStatus status);

    long countByUserAndStatus(User user, ShelfStatus status);

    long countByUser(User user);

    boolean existsByUserAndBook(User user, Book book);

    void deleteByUserAndBook(User user, Book book);
}
