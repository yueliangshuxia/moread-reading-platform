package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 40)
    private String name;

    @Column(length = 8)
    private String mark;

    @Column(length = 300)
    private String description;

    private Integer sort;
}
