package com.moread.common;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class TimeUtils {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");

    private TimeUtils() {
    }

    public static String relative(LocalDateTime time) {
        if (time == null) return "";
        Duration d = Duration.between(time, LocalDateTime.now());
        long minutes = d.toMinutes();
        if (minutes < 1) return "刚刚";
        if (minutes < 60) return minutes + " 分钟前";
        long hours = d.toHours();
        if (hours < 24) return hours + " 小时前";
        long days = d.toDays();
        if (days == 1) return "昨天";
        if (days < 7) return days + " 天前";
        if (days < 30) return (days / 7) + " 周前";
        return time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    public static String dateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME);
    }

    public static String time(LocalDateTime time) {
        return time == null ? "" : time.format(TIME);
    }
}
