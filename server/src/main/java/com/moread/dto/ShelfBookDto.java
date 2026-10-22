package com.moread.dto;

public record ShelfBookDto(
        BookSummaryDto book,
        String status,
        double percent,
        Integer chapterNo,
        String lastReadAt
) {
}
