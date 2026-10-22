package com.moread.dto;

public record AuthUserDto(Long id, String name, String email, String handle, int avatar, String bio, String role) {
}
