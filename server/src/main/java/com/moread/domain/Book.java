package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @Column(length = 60)
    private String id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 80)
    private String author;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "book_tags", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "tag", length = 40)
    @Builder.Default
    private Set<String> tags = new LinkedHashSet<>();

    private Double rating;

    private Integer readers;

    @Column(length = 30)
    private String words;

    private Integer publishedYear;

    /** 连载 / 完结 */
    @Column(length = 20)
    private String status;

    private Boolean free;

    private Boolean original;

    private Boolean featured;

    /** 是否在架 */
    @Column(nullable = false)
    @Builder.Default
    private Boolean listed = true;

    @Column(length = 30)
    private String coverTheme;

    @Column(length = 30)
    private String coverPattern;

    @Column(length = 1000)
    private String blurb;

    @Column(length = 4000)
    private String intro;

    @Column(length = 2000)
    private String authorBio;

    @Column(length = 500)
    private String reason;

    @Builder.Default
    private Double contentScore = 0.0;
    @Builder.Default
    private Double cfScore = 0.0;
    @Builder.Default
    private Double popularityScore = 0.0;
    @Builder.Default
    private Double freshnessScore = 0.0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (listed == null) listed = true;
    }
}
