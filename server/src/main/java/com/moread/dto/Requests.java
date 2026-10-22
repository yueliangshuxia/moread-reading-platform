package com.moread.dto;

import com.moread.domain.ReadingEventType;
import com.moread.domain.ShelfStatus;
import com.moread.domain.UserStatus;
import jakarta.validation.constraints.*;

import java.util.List;

public final class Requests {

    private Requests() {
    }

    public record Register(
            @NotBlank @Size(max = 60) String name,
            @NotBlank @Email @Size(max = 120) String email,
            @NotBlank @Size(min = 6, max = 64) String password
    ) {
    }

    public record Login(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record Review(
            @Min(1) @Max(5) int rating,
            @NotBlank @Size(max = 3000) String content
    ) {
    }

    public record Note(
            @NotBlank String bookId,
            Integer chapterNo,
            @Size(max = 1000) String quote,
            @Size(max = 4000) String content,
            String type,
            @Size(max = 60) String page
    ) {
    }

    public record Shelf(@NotNull ShelfStatus status) {
    }

    public record Post(
            @NotBlank @Size(max = 40) String topic,
            String bookId,
            @NotBlank @Size(max = 4000) String content
    ) {
    }

    public record Comment(@NotBlank @Size(max = 1000) String content) {
    }

    public record Goal(@NotNull Integer year, @Min(1) @Max(999) Integer target) {
    }

    public record Progress(@Min(0) @Max(100) double percent, Integer chapterNo) {
    }

    public record ReadingEvent(
            @NotBlank String bookId,
            @NotNull ReadingEventType eventType,
            Integer durationSeconds,
            Double percent,
            Integer chapterNo
    ) {
    }

    public record BookUpsert(
            @NotBlank @Size(max = 120) String title,
            @NotBlank @Size(max = 80) String author,
            @NotBlank String categoryId,
            List<String> tags,
            Double rating,
            String words,
            Integer publishedYear,
            String status,
            Boolean free,
            Boolean original,
            Boolean featured,
            String coverTheme,
            String coverPattern,
            @Size(max = 1000) String blurb,
            @Size(max = 4000) String intro,
            @Size(max = 2000) String authorBio,
            ScoresDto scores,
            @Size(max = 500) String reason
    ) {
    }

    public record UserStatusRequest(@NotNull UserStatus status) {
    }

    public record Listed(boolean listed) {
    }

    public record Weights(
            @PositiveOrZero double content,
            @PositiveOrZero double cf,
            @PositiveOrZero double popularity,
            @PositiveOrZero double freshness
    ) {
    }

    public record ProfileUpdate(
            @Size(min = 1, max = 60) String name,
            @Size(max = 500) String bio,
            Integer avatar
    ) {
    }
}
