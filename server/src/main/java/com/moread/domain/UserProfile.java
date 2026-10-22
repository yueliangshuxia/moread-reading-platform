package com.moread.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles", uniqueConstraints = @UniqueConstraint(name = "uk_profiles_user", columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 逗号分隔的分类 id，按偏好从高到低 */
    @Column(length = 500)
    private String preferredCategories;

    /** 逗号分隔的标签 */
    @Column(length = 1000)
    private String preferredTags;

    private Double avgSessionMinutes;

    private Double completionRate;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = LocalDateTime.now();
    }
}
