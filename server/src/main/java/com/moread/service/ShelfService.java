package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.common.TimeUtils;
import com.moread.domain.*;
import com.moread.dto.ShelfBookDto;
import com.moread.dto.ShelfResponse;
import com.moread.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShelfService {

    private final ShelfItemRepository shelves;
    private final ReadingProgressRepository progressRepository;
    private final ReadingEventRepository events;
    private final BookRepository books;
    private final ProfileService profileService;
    private final RecommendationService recommendationService;

    @Transactional(readOnly = true)
    public ShelfResponse get(User user) {
        Map<ShelfStatus, List<ShelfBookDto>> grouped = new EnumMap<>(ShelfStatus.class);
        for (ShelfStatus status : ShelfStatus.values()) grouped.put(status, new ArrayList<>());
        for (ShelfItem item : shelves.findByUserOrderByUpdatedAtDesc(user)) {
            grouped.get(item.getStatus()).add(toDto(user, item));
        }
        return new ShelfResponse(
                grouped.get(ShelfStatus.READING),
                grouped.get(ShelfStatus.WANT),
                grouped.get(ShelfStatus.FINISHED),
                grouped.get(ShelfStatus.PAUSED)
        );
    }

    @Transactional
    public ShelfBookDto upsert(User user, String bookId, ShelfStatus status) {
        Book book = books.findByIdAndListedTrue(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        ShelfItem item = shelves.findByUserAndBook(user, book).orElseGet(() ->
                ShelfItem.builder().user(user).book(book).build());
        item.setStatus(status);
        item.setUpdatedAt(LocalDateTime.now());
        shelves.save(item);

        ShelfStatus previous = item.getId() == null ? null : status; // 新建时没有上一个状态
        record(user, book, ReadingEventType.SHELF, 0, null);
        if (status == ShelfStatus.FINISHED) {
            upsertProgress(user, book, 100.0, 1);
            record(user, book, ReadingEventType.FINISH, 0, 100.0);
        } else if (status == ShelfStatus.READING) {
            record(user, book, ReadingEventType.START_READ, 0, null);
        }
        profileService.refresh(user);
        recommendationService.clearCache(user.getId());
        return toDto(user, item);
    }

    @Transactional
    public void remove(User user, String bookId) {
        Book book = books.findById(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        ShelfItem item = shelves.findByUserAndBook(user, book)
                .orElseThrow(() -> BusinessException.notFound("这本书不在你的书架上"));
        shelves.delete(item);
        record(user, book, ReadingEventType.ABANDON, 0, null);
        profileService.refresh(user);
        recommendationService.clearCache(user.getId());
    }

    @Transactional(readOnly = true)
    public ShelfBookDto one(User user, String bookId) {
        Book book = books.findById(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        ShelfItem item = shelves.findByUserAndBook(user, book)
                .orElseThrow(() -> BusinessException.notFound("这本书不在你的书架上"));
        return toDto(user, item);
    }

    private ShelfBookDto toDto(User user, ShelfItem item) {
        ReadingProgress progress = progressRepository.findByUserAndBook(user, item.getBook()).orElse(null);
        double percent = progress == null ? 0.0 : (progress.getPercent() == null ? 0.0 : progress.getPercent());
        if (item.getStatus() == ShelfStatus.FINISHED) percent = 100.0;
        return new ShelfBookDto(
                DtoMapper.toSummary(item.getBook()),
                item.getStatus().name(),
                percent,
                progress == null ? null : progress.getChapterNo(),
                progress == null || progress.getLastReadAt() == null ? "" : TimeUtils.relative(progress.getLastReadAt())
        );
    }

    private void upsertProgress(User user, Book book, double percent, int chapterNo) {
        ReadingProgress progress = progressRepository.findByUserAndBook(user, book)
                .orElseGet(() -> ReadingProgress.builder().user(user).book(book).build());
        progress.setPercent(percent);
        progress.setChapterNo(chapterNo);
        progress.setLastReadAt(LocalDateTime.now());
        progressRepository.save(progress);
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
}
