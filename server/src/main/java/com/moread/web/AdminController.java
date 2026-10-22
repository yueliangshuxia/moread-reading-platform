package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.domain.ReviewStatus;
import com.moread.dto.*;
import com.moread.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/overview")
    public ApiResponse<AdminOverviewDto> overview() {
        return ApiResponse.ok(adminService.overview());
    }

    @GetMapping("/books")
    public ApiResponse<List<BookSummaryDto>> books(@RequestParam(required = false) String q,
                                                   @RequestParam(required = false) String categoryId) {
        return ApiResponse.ok(adminService.listBooks(q, categoryId));
    }

    @PostMapping("/books")
    public ApiResponse<BookSummaryDto> createBook(@Valid @RequestBody Requests.BookUpsert req) {
        return ApiResponse.ok(adminService.createBook(req));
    }

    @PutMapping("/books/{id}")
    public ApiResponse<BookSummaryDto> updateBook(@PathVariable String id,
                                                  @Valid @RequestBody Requests.BookUpsert req) {
        return ApiResponse.ok(adminService.updateBook(id, req));
    }

    @PutMapping("/books/{id}/listed")
    public ApiResponse<BookSummaryDto> setListed(@PathVariable String id,
                                                 @RequestBody Requests.Listed req) {
        return ApiResponse.ok(adminService.setListed(id, req.listed()));
    }

    @GetMapping("/users")
    public ApiResponse<List<UserDto>> users() {
        return ApiResponse.ok(adminService.listUsers());
    }

    @PutMapping("/users/{id}/status")
    public ApiResponse<UserDto> setUserStatus(@PathVariable Long id,
                                              @Valid @RequestBody Requests.UserStatusRequest req) {
        return ApiResponse.ok(adminService.setUserStatus(id, req.status()));
    }

    @GetMapping("/reviews")
    public ApiResponse<List<ReviewDto>> reviews(@RequestParam(required = false) String status) {
        return ApiResponse.ok(adminService.reviews(status));
    }

    @PostMapping("/reviews/{id}/approve")
    public ApiResponse<ReviewDto> approveReview(@PathVariable Long id) {
        return ApiResponse.ok(adminService.moderateReview(id, ReviewStatus.PASSED));
    }

    @PostMapping("/reviews/{id}/reject")
    public ApiResponse<ReviewDto> rejectReview(@PathVariable Long id) {
        return ApiResponse.ok(adminService.moderateReview(id, ReviewStatus.REJECTED));
    }

    @GetMapping("/recommendation/weights")
    public ApiResponse<WeightsDto> weights() {
        return ApiResponse.ok(adminService.weights());
    }

    @PutMapping("/recommendation/weights")
    public ApiResponse<WeightsDto> updateWeights(@Valid @RequestBody Requests.Weights req) {
        return ApiResponse.ok(adminService.updateWeights(req));
    }

    @PostMapping("/recommendations/rebuild")
    public ApiResponse<Void> rebuild() {
        adminService.rebuildRecommendations();
        return ApiResponse.ok();
    }
}
