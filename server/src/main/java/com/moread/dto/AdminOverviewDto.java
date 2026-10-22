package com.moread.dto;

import java.util.List;

public record AdminOverviewDto(
        long users,
        long books,
        long todayMinutes,
        long pendingReviews,
        long weeklyActive,
        List<ChartPointDto> weeklyActiveSeries,
        List<CategoryShareDto> categories,
        List<ReviewDto> recentReviews
) {
}
