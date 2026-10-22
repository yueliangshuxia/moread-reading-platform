package com.moread.dto;

import java.util.List;

public record BookDetailDto(
        String id,
        String title,
        String author,
        String category,
        String categoryId,
        List<String> tags,
        double rating,
        int readers,
        String words,
        int year,
        String status,
        boolean free,
        boolean original,
        boolean featured,
        boolean listed,
        CoverDto cover,
        String blurb,
        String intro,
        String authorBio,
        ScoresDto scores,
        String reason,
        List<ChapterDto> chapters
) {
}
