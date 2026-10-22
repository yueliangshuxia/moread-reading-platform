package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.BooklistDto;
import com.moread.service.BooklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booklists")
@RequiredArgsConstructor
public class BooklistController {

    private final BooklistService booklistService;

    @GetMapping
    public ApiResponse<List<BooklistDto>> list() {
        return ApiResponse.ok(booklistService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<BooklistDto> detail(@PathVariable String id) {
        return ApiResponse.ok(booklistService.detail(id));
    }
}
