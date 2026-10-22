package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.Requests;
import com.moread.dto.ShelfBookDto;
import com.moread.dto.ShelfResponse;
import com.moread.security.CurrentUser;
import com.moread.service.ShelfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shelf")
@RequiredArgsConstructor
public class ShelfController {

    private final ShelfService shelfService;
    private final CurrentUser currentUser;

    @GetMapping
    public ApiResponse<ShelfResponse> get() {
        return ApiResponse.ok(shelfService.get(currentUser.get()));
    }

    @GetMapping("/{bookId}")
    public ApiResponse<ShelfBookDto> one(@PathVariable String bookId) {
        return ApiResponse.ok(shelfService.one(currentUser.get(), bookId));
    }

    @PutMapping("/{bookId}")
    public ApiResponse<ShelfBookDto> upsert(@PathVariable String bookId,
                                            @Valid @RequestBody Requests.Shelf req) {
        return ApiResponse.ok(shelfService.upsert(currentUser.get(), bookId, req.status()));
    }

    @DeleteMapping("/{bookId}")
    public ApiResponse<Void> remove(@PathVariable String bookId) {
        shelfService.remove(currentUser.get(), bookId);
        return ApiResponse.ok();
    }
}
