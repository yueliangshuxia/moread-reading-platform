package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.GoalDto;
import com.moread.dto.ProfileDto;
import com.moread.dto.Requests;
import com.moread.dto.StatsDto;
import com.moread.security.CurrentUser;
import com.moread.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final com.moread.service.ReviewService reviewService;
    private final CurrentUser currentUser;

    @GetMapping
    public ApiResponse<ProfileDto> get() {
        return ApiResponse.ok(profileService.get(currentUser.get()));
    }

    @PutMapping
    public ApiResponse<ProfileDto> update(@Valid @RequestBody Requests.ProfileUpdate req) {
        return ApiResponse.ok(profileService.update(currentUser.get(), req));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.ok(profileService.stats(currentUser.get()));
    }

    @GetMapping("/reviews")
    public ApiResponse<java.util.List<com.moread.dto.ReviewDto>> reviews() {
        return ApiResponse.ok(reviewService.listByUser(currentUser.get()));
    }

    @GetMapping("/goal")
    public ApiResponse<GoalDto> goal() {
        return ApiResponse.ok(profileService.getGoal(currentUser.get()));
    }

    @PutMapping("/goal")
    public ApiResponse<GoalDto> updateGoal(@Valid @RequestBody Requests.Goal req) {
        return ApiResponse.ok(profileService.updateGoal(currentUser.get(), req));
    }
}
