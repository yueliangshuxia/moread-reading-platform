package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.PublicStatsDto;
import com.moread.repository.BookRepository;
import com.moread.repository.ReadingEventRepository;
import com.moread.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class PublicStatsController {

    private final UserRepository users;
    private final BookRepository books;
    private final ReadingEventRepository events;

    @GetMapping("/public")
    public ApiResponse<PublicStatsDto> stats() {
        return ApiResponse.ok(new PublicStatsDto(
                (int) users.count(),
                (int) books.countByListedTrue(),
                (int) events.count()
        ));
    }
}
