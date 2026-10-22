package com.moread.dto;

import java.util.List;

public record ShelfResponse(
        List<ShelfBookDto> reading,
        List<ShelfBookDto> want,
        List<ShelfBookDto> finished,
        List<ShelfBookDto> paused
) {
}
