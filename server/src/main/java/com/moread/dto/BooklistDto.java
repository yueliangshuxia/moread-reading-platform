package com.moread.dto;

import java.util.List;

public record BooklistDto(
        String id,
        String title,
        String description,
        String mark,
        String theme,
        int bookCount,
        List<BookSummaryDto> books
) {
}
