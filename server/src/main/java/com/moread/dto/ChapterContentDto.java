package com.moread.dto;

public record ChapterContentDto(Long id, String bookId, String bookTitle, String title, int orderNo, boolean free, String content) {
}
