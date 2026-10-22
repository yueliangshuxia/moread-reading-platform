package com.moread.service.seed;

import java.util.List;

public record SeedData(
        List<CategorySeed> categories,
        List<BookSeed> books,
        List<ChapterSeed> chapters,
        List<BooklistSeed> booklists,
        List<UserSeed> users,
        List<ShelfSeed> shelves,
        List<ProgressSeed> progress,
        List<NoteSeed> notes,
        List<ReviewSeed> reviews,
        List<PostSeed> posts,
        List<CommentSeed> comments,
        List<EventSeed> events,
        List<GoalSeed> goals,
        WeightSeed weights
) {

    public record CategorySeed(String id, String name, String mark, String description, Integer sort) {
    }

    public record ScoresSeed(double content, double cf, double popularity, double freshness) {
    }

    public record BookSeed(
            String id, String title, String author, String categoryId, List<String> tags,
            Double rating, Integer readers, String words, Integer publishedYear, String status,
            Boolean free, Boolean original, Boolean featured, Boolean listed,
            String coverTheme, String coverPattern, String blurb, String intro, String authorBio,
            String reason, ScoresSeed scores
    ) {
    }

    public record ChapterSeed(String bookId, String title, Integer orderNo, String content, Boolean free) {
    }

    public record BooklistSeed(String id, String title, String description, String mark,
                               String theme, Integer sort, List<String> bookIds) {
    }

    public record UserSeed(String email, String password, String name, String handle, Integer avatar,
                           String bio, String role, String status, String joinedAt) {
    }

    public record ShelfSeed(String email, String bookId, String status, String createdAt) {
    }

    public record ProgressSeed(String email, String bookId, Integer chapterNo, Double percent, String lastReadAt) {
    }

    public record NoteSeed(String email, String bookId, Integer chapterNo, String quote, String content,
                           String type, String page, String createdAt) {
    }

    public record ReviewSeed(String email, String bookId, Integer rating, String content, String status,
                             Integer likes, String createdAt) {
    }

    public record PostSeed(String id, String email, String topic, String content, String bookId,
                           String image, Integer likes, Integer commentCount, String createdAt) {
    }

    public record CommentSeed(String postId, String email, String content, String createdAt) {
    }

    public record EventSeed(String email, String bookId, String eventType, Integer durationSeconds,
                            Double percent, String createdAt) {
    }

    public record GoalSeed(String email, Integer year, Integer target) {
    }

    public record WeightSeed(double content, double cf, double popularity, double freshness) {
    }
}
