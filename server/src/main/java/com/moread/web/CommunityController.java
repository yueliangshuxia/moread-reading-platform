package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.*;
import com.moread.security.CurrentUser;
import com.moread.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final CurrentUser currentUser;

    @GetMapping
    public ApiResponse<List<PostDto>> list(@RequestParam(required = false) String topic) {
        return ApiResponse.ok(communityService.list(topic, currentUser.optional().orElse(null)));
    }

    @PostMapping
    public ApiResponse<PostDto> create(@Valid @RequestBody Requests.Post req) {
        return ApiResponse.ok(communityService.create(currentUser.get(), req));
    }

    @GetMapping("/{id}")
    public ApiResponse<PostDetailDto> detail(@PathVariable String id) {
        return ApiResponse.ok(communityService.detail(id, currentUser.optional().orElse(null)));
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<CommentDto>> comments(@PathVariable String id) {
        return ApiResponse.ok(communityService.comments(id));
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<CommentDto> comment(@PathVariable String id,
                                           @Valid @RequestBody Requests.Comment req) {
        return ApiResponse.ok(communityService.addComment(currentUser.get(), id, req));
    }

    @PostMapping("/{id}/like")
    public ApiResponse<Map<String, Integer>> like(@PathVariable String id) {
        int likes = communityService.toggleLike(currentUser.get(), id);
        return ApiResponse.ok(Map.of("likes", likes));
    }
}
