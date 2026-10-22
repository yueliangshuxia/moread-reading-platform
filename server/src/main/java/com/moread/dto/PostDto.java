package com.moread.dto;

public record PostDto(
        String id,
        String user,
        int avatar,
        String time,
        String topic,
        String bookId,
        String bookTitle,
        String bookAuthor,
        String text,
        String image,
        int likes,
        int comments,
        boolean liked
) {
}
