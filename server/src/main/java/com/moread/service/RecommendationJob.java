package com.moread.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationJob {

    private final RecommendationService recommendationService;

    /** 每天 03:00 重算全量推荐，结果写入 user_recommendations。 */
    @Scheduled(cron = "0 0 3 * * *")
    public void run() {
        log.info("开始离线重算推荐");
        recommendationService.rebuildAll();
        log.info("离线推荐重算完成");
    }
}
