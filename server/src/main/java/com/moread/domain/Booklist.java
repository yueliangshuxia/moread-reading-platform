package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "booklists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booklist {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(length = 8)
    private String mark;

    @Column(length = 20)
    private String theme;

    private Integer sort;

    @OneToMany(mappedBy = "booklist", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sort ASC")
    @Builder.Default
    private List<BooklistItem> items = new ArrayList<>();
}
