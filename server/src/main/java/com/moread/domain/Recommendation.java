package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_recommendations", indexes = {
        @Index(name = "idx_rec_user_batch", columnList = "user_id,batch_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private Double score;

    @Column(length = 500)
    private String reason;

    @Column(length = 40)
    private String algorithm;

    @Column(name = "batch_date", nullable = false)
    private LocalDate batchDate;
}
