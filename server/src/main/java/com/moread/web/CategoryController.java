package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.CategoryDto;
import com.moread.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryDto>> list() {
        return ApiResponse.ok(categoryService.list());
    }
}
