package com.moread.dto;

public record NoteDto(
        Long id,
        String bookId,
        String bookTitle,
        String user,
        int avatar,
        String date,
        String page,
        String quote,
        String note,
        String type
) {
}
