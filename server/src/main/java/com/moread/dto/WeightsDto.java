package com.moread.dto;

/** 百分制权重，例如 35 / 30 / 20 / 15。 */
public record WeightsDto(double content, double cf, double popularity, double freshness) {
}
