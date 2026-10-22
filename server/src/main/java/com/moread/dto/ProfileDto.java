package com.moread.dto;

import java.util.List;

public record ProfileDto(
        Long id,
        String name,
        String handle,
        int avatar,
        String bio,
        String joined,
        StatsDto stats,
        GoalDto goal,
        List<String> preferredCategories,
        List<String> preferredTags
) {
}
