package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.common.TimeUtils;
import com.moread.domain.*;
import com.moread.dto.ProgressDto;
import com.moread.dto.Requests;
import com.moread.dto.StatsDto;
import com.moread.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReadingService {

    private final BookRepository books;
    private final ReadingProgressRepository progresses;
    private final ReadingEventRepository events;
    private final ShelfItemRepository shelves;
    private final ProfileService profileService;
    private final RecommendationService recommendationService;

    @Transactional(readOnly = true)
    public ProgressDto getProgress(User user, String bookId) {
        Book book = books.findByIdAndListedTrue(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        ReadingProgress progress = progresses.findByUserAndBook(user, book).orElse(null);
        if (progress == null) {
            return new ProgressDto(bookId, 1, 0.0, "");
        }
        return new ProgressDto(
                bookId,
                progress.getChapterNo(),
                progress.getPercent() == null ? 0.0 : progress.getPercent(),
                progress.getLastReadAt() == null ? "" : TimeUtils.relative(progress.getLastReadAt())
        );
    }

    @Transactional
    public ProgressDto saveProgress(User user, String bookId, Requests.Progress req) {
        Book book = books.findByIdAndListedTrue(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        double percent = clamp(req.percent());
        ReadingProgress progress = upsertProgress(user, book, percent, req.chapterNo());
        record(user, book, ReadingEventType.PROGRESS, 0, percent);
        if (percent >= 99.0) {
            markFinished(user, book, percent);
        }
        profileService.refresh(user);
        recommendationService.clearCache(user.getId());
        return new ProgressDto(bookId, progress.getChapterNo(), percent,
                progress.getLastReadAt() == null ? "" : TimeUtils.relative(progress.getLastReadAt()));
    }

    @Transactional
    public void recordEvent(User user, Requests.ReadingEvent req) {
        Book book = books.findByIdAndListedTrue(req.bookId())
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        int seconds = req.durationSeconds() == null ? 0 : Math.max(0, Math.min(86400, req.durationSeconds()));
        Double percent = req.percent() == null ? null : clamp(req.percent());

        events.save(ReadingEvent.builder()
                .user(user)
                .book(book)
                .eventType(req.eventType())
                .durationSeconds(seconds)
                .percent(percent)
                .createdAt(LocalDateTime.now())
                .build());

        if (percent != null && req.eventType() == ReadingEventType.PROGRESS) {
            upsertProgress(user, book, percent, req.chapterNo());
            if (percent >= 99.0) markFinished(user, book, percent);
        }
        if (req.eventType() == ReadingEventType.START_READ) {
            setShelfStatus(user, book, ShelfStatus.READING);
        }
        if (req.eventType() == ReadingEventType.FINISH) {
            upsertProgress(user, book, 100.0, req.chapterNo());
            setShelfStatus(user, book, ShelfStatus.FINISHED);
        }

        if (req.eventType() != ReadingEventType.EXPOSE && req.eventType() != ReadingEventType.CLICK) {
            profileService.refresh(user);
            recommendationService.clearCache(user.getId());
        }
    }

    @Transactional(readOnly = true)
    public StatsDto stats(User user) {
        return profileService.stats(user);
    }

    private ReadingProgress upsertProgress(User user, Book book, double percent, Integer chapterNo) {
        ReadingProgress progress = progresses.findByUserAndBook(user, book)
                .orElseGet(() -> ReadingProgress.builder().user(user).book(book).build());
        progress.setPercent(percent);
        progress.setChapterNo(chapterNo == null ? 1 : chapterNo);
        progress.setLastReadAt(LocalDateTime.now());
        return progresses.save(progress);
    }

    private void markFinished(User user, Book book, Double percent) {
        ShelfItem item = shelves.findByUserAndBook(user, book)
                .orElseGet(() -> ShelfItem.builder().user(user).book(book).build());
        if (item.getStatus() != ShelfStatus.FINISHED) {
            item.setStatus(ShelfStatus.FINISHED);
            shelves.save(item);
            record(user, book, ReadingEventType.FINISH, 0, percent == null ? 100.0 : percent);
        }
    }

    private void setShelfStatus(User user, Book book, ShelfStatus status) {
        ShelfItem item = shelves.findByUserAndBook(user, book)
                .orElseGet(() -> ShelfItem.builder().user(user).book(book).build());
        item.setStatus(status);
        shelves.save(item);
    }

    private void record(User user, Book book, ReadingEventType type, int seconds, Double percent) {
        events.save(ReadingEvent.builder()
                .user(user)
                .book(book)
                .eventType(type)
                .durationSeconds(seconds)
                .percent(percent)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private double clamp(double value) {
        return Math.max(0.0, Math.min(100.0, value));
    }
}
