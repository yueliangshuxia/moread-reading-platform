package com.moread.dto;

public record RecommendationDto(
        BookSummaryDto book,
        double score,
        String reason,
        FactorDto factors
) {
}
