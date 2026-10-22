package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress", uniqueConstraints = @UniqueConstraint(name = "uk_progress_user_book", columnNames = {"user_id", "book_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private Integer chapterNo;

    private Double percent;

    private LocalDateTime lastReadAt;

    @PrePersist
    @PreUpdate
    void touch() {
        lastReadAt = LocalDateTime.now();
    }
}
