package com.moread.repository;

import com.moread.domain.Book;
import com.moread.domain.Note;
import com.moread.domain.NoteType;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserOrderByCreatedAtDesc(User user);

    List<Note> findByUserAndBookOrderByCreatedAtDesc(User user, Book book);

    List<Note> findByUserAndBookAndTypeOrderByCreatedAtDesc(User user, Book book, NoteType type);

    List<Note> findByUserAndTypeOrderByCreatedAtDesc(User user, NoteType type);

    Optional<Note> findByIdAndUser(Long id, User user);

    long countByUser(User user);
}
