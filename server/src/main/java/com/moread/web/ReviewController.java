package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.security.CurrentUser;
import com.moread.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    @PostMapping("/{id}/like")
    public ApiResponse<Map<String, Integer>> like(@PathVariable Long id) {
        int likes = reviewService.toggleLike(currentUser.get(), id);
        return ApiResponse.ok(Map.of("likes", likes));
    }
}
