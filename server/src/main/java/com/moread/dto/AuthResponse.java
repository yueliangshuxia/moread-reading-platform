package com.moread.dto;

public record AuthResponse(String token, AuthUserDto user) {
}
