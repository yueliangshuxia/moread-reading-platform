package com.moread.dto;

import java.util.List;

public record BookSummaryDto(
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
        ScoresDto scores,
        String reason
) {
}
