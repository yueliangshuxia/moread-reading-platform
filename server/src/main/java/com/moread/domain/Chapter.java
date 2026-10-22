package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chapters", uniqueConstraints = @UniqueConstraint(name = "uk_chapters_book_order", columnNames = {"book_id", "order_no"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Lob
    private String content;

    private Boolean free;
}
