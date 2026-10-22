package com.moread.dto;

import java.util.List;

public record PostDetailDto(PostDto post, List<CommentDto> comments) {
}
