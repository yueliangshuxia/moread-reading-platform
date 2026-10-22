package com.moread.dto;

public record CommentDto(Long id, String postId, String user, int avatar, String time, String text) {
}
