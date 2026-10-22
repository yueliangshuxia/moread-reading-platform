package com.moread.dto;

public record ProgressDto(String bookId, Integer chapterNo, double percent, String lastReadAt) {
}
