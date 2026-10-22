package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booklist_items", uniqueConstraints = @UniqueConstraint(name = "uk_booklist_item", columnNames = {"booklist_id", "book_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BooklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booklist_id", nullable = false)
    private Booklist booklist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private Integer sort;
}
