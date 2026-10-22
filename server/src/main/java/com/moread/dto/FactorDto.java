package com.moread.dto;

/** 推荐因子，百分制，便于直接展示。 */
public record FactorDto(int content, int cf, int popularity, int freshness, String reason) {
}
