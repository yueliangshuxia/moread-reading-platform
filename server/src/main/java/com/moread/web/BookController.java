package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.common.PageResponse;
import com.moread.domain.User;
import com.moread.dto.*;
import com.moread.security.CurrentUser;
import com.moread.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final CurrentUser currentUser;

    @GetMapping
    public ApiResponse<PageResponse<BookSummaryDto>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "recommend") String sort,
            @RequestParam(required = false) Boolean free,
            @RequestParam(required = false) String list,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ApiResponse.ok(bookService.list(q, category, sort, free, list, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<BookDetailDto> detail(@PathVariable String id) {
        return ApiResponse.ok(bookService.detail(id));
    }

    @GetMapping("/{id}/chapters")
    public ApiResponse<List<ChapterDto>> chapters(@PathVariable String id) {
        return ApiResponse.ok(bookService.chapters(id));
    }

    @GetMapping("/{id}/chapters/{orderNo}")
    public ApiResponse<ChapterContentDto> chapter(@PathVariable String id, @PathVariable Integer orderNo) {
        return ApiResponse.ok(bookService.chapter(id, orderNo, currentUser.optional().orElse(null)));
    }

    @GetMapping("/{id}/similar")
    public ApiResponse<List<BookSummaryDto>> similar(@PathVariable String id) {
        return ApiResponse.ok(bookService.similar(id));
    }

    @GetMapping("/{id}/reviews")
    public ApiResponse<List<ReviewDto>> reviews(@PathVariable String id) {
        return ApiResponse.ok(bookService.reviews(id, currentUser.optional().orElse(null)));
    }

    @PostMapping("/{id}/reviews")
    public ApiResponse<ReviewDto> addReview(@PathVariable String id,
                                            @Valid @RequestBody Requests.Review req) {
        User user = currentUser.get();
        return ApiResponse.ok(bookService.addReview(user, id, req));
    }

    @GetMapping("/{id}/factors")
    public ApiResponse<FactorDto> factors(@PathVariable String id) {
        return ApiResponse.ok(bookService.factors(id, currentUser.get()));
    }
}
