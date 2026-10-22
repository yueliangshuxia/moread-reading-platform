package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.ProgressDto;
import com.moread.dto.Requests;
import com.moread.dto.StatsDto;
import com.moread.security.CurrentUser;
import com.moread.service.ReadingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reading")
@RequiredArgsConstructor
public class ReadingController {

    private final ReadingService readingService;
    private final CurrentUser currentUser;

    @GetMapping("/progress/{bookId}")
    public ApiResponse<ProgressDto> progress(@PathVariable String bookId) {
        return ApiResponse.ok(readingService.getProgress(currentUser.get(), bookId));
    }

    @PutMapping("/progress/{bookId}")
    public ApiResponse<ProgressDto> saveProgress(@PathVariable String bookId,
                                                 @Valid @RequestBody Requests.Progress req) {
        return ApiResponse.ok(readingService.saveProgress(currentUser.get(), bookId, req));
    }

    @PostMapping("/events")
    public ApiResponse<Void> event(@Valid @RequestBody Requests.ReadingEvent req) {
        readingService.recordEvent(currentUser.get(), req);
        return ApiResponse.ok();
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.ok(readingService.stats(currentUser.get()));
    }
}
