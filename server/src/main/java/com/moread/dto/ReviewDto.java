package com.moread.dto;

public record ReviewDto(
        Long id,
        String bookId,
        String bookTitle,
        String user,
        int avatar,
        String date,
        int rating,
        int likes,
        String text,
        String status,
        boolean liked
) {
}
