package com.moread.web;

import com.moread.common.ApiResponse;
import com.moread.dto.AuthResponse;
import com.moread.dto.AuthUserDto;
import com.moread.dto.Requests;
import com.moread.security.CurrentUser;
import com.moread.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUser currentUser;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody Requests.Register req) {
        return ApiResponse.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody Requests.Login req) {
        return ApiResponse.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserDto> me() {
        return ApiResponse.ok(authService.me(currentUser.get()));
    }
}
