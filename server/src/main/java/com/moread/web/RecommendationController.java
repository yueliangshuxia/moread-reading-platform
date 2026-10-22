package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.BookSummaryDto;
import com.moread.dto.FactorDto;
import com.moread.dto.RecommendationDto;
import com.moread.security.CurrentUser;
import com.moread.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CurrentUser currentUser;

    @GetMapping("/home")
    public ApiResponse<List<RecommendationDto>> home(@RequestParam(defaultValue = "6") int limit) {
        return ApiResponse.ok(recommendationService.getHome(currentUser.get(), Math.max(1, Math.min(limit, 20))));
    }

    @GetMapping("/similar/{bookId}")
    public ApiResponse<List<BookSummaryDto>> similar(@PathVariable String bookId,
                                                     @RequestParam(defaultValue = "6") int limit) {
        return ApiResponse.ok(recommendationService.similar(bookId, Math.max(1, Math.min(limit, 12))));
    }

    @GetMapping("/factors/{bookId}")
    public ApiResponse<FactorDto> factors(@PathVariable String bookId) {
        return ApiResponse.ok(recommendationService.factorsFor(bookId, currentUser.get()));
    }
}
