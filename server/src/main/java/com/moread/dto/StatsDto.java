package com.moread.dto;

import java.util.List;

public record StatsDto(
        int hours,
        int finished,
        int notes,
        int streak,
        List<Integer> weeklyMinutes,
        List<String> weeklyLabels,
        List<Integer> heatmap,
        List<CategoryShareDto> categories,
        GoalDto goal
) {
}
