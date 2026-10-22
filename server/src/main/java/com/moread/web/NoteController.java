package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.NoteDto;
import com.moread.dto.Requests;
import com.moread.security.CurrentUser;
import com.moread.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final CurrentUser currentUser;

    @GetMapping
    public ApiResponse<List<NoteDto>> list(@RequestParam(required = false) String bookId,
                                           @RequestParam(required = false) String type) {
        return ApiResponse.ok(noteService.list(currentUser.get(), bookId, type));
    }

    @PostMapping
    public ApiResponse<NoteDto> create(@Valid @RequestBody Requests.Note req) {
        return ApiResponse.ok(noteService.create(currentUser.get(), req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        noteService.delete(currentUser.get(), id);
        return ApiResponse.ok();
    }
}
