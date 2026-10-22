package com.moread.dto;

public record UserDto(Long id, String name, String email, String role, String status, int avatar, String joinedAt) {
}
