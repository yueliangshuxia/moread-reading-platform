package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.*;
import com.moread.dto.*;
import com.moread.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository users;
    private final BookRepository books;
    private final CategoryRepository categories;
    private final ReadingEventRepository events;
    private final ReviewService reviewService;
    private final RecommendationService recommendationService;

    @Transactional(readOnly = true)
    public AdminOverviewDto overview() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime weekStart = today.minusDays(6).atStartOfDay();
        LocalDateTime monthStart = today.minusDays(29).atStartOfDay();

        long todayMinutes = events.sumDurationByTypeAfter(ReadingEventType.SESSION, todayStart) / 60;
        long weeklyActive = events.countDistinctUsersByTypeAfter(ReadingEventType.SESSION, weekStart);

        List<ReadingEvent> weekEvents = events.findByCreatedAtAfter(weekStart);
        Map<LocalDate, Set<Long>> usersByDay = new HashMap<>();
        for (ReadingEvent e : weekEvents) {
            if (e.getEventType() != ReadingEventType.SESSION) continue;
            usersByDay.computeIfAbsent(e.getCreatedAt().toLocalDate(), k -> new HashSet<>())
                    .add(e.getUser().getId());
        }
        List<ChartPointDto> weeklySeries = new ArrayList<>();
        for (int offset = 6; offset >= 0; offset--) {
            LocalDate d = today.minusDays(offset);
            weeklySeries.add(new ChartPointDto("周" + weekday(d.getDayOfWeek()),
                    usersByDay.getOrDefault(d, Set.of()).size()));
        }

        List<ReadingEvent> monthEvents = events.findByCreatedAtAfter(monthStart);
        Map<String, Long> secondsByCategory = new HashMap<>();
        for (ReadingEvent e : monthEvents) {
            if (e.getEventType() != ReadingEventType.SESSION) continue;
            secondsByCategory.merge(e.getBook().getCategory().getName(),
                    (long) Math.max(0, e.getDurationSeconds() == null ? 0 : e.getDurationSeconds()), Long::sum);
        }
        long total = secondsByCategory.values().stream().mapToLong(Long::longValue).sum();
        List<CategoryShareDto> shares = new ArrayList<>();
        if (total > 0) {
            secondsByCategory.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(7)
                    .forEach(e -> shares.add(new CategoryShareDto(
                            e.getKey(), Math.round(e.getValue() * 1000.0 / total) / 10.0)));
        }

        return new AdminOverviewDto(
                users.count(),
                books.countByListedTrue(),
                todayMinutes,
                reviewService.pendingCount(),
                weeklyActive,
                weeklySeries,
                shares,
                reviewService.recentPending()
        );
    }

    @Transactional(readOnly = true)
    public List<BookSummaryDto> listBooks(String q, String categoryId) {
        String needle = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return books.findAll().stream()
                .filter(b -> categoryId == null || categoryId.isBlank() || "all".equals(categoryId)
                        || categoryId.equals(b.getCategory().getId()))
                .filter(b -> needle.isEmpty()
                        || (b.getTitle() + " " + b.getAuthor()).toLowerCase(Locale.ROOT).contains(needle))
                .sorted(Comparator.comparing(Book::getCreatedAt).reversed())
                .map(DtoMapper::toSummary)
                .toList();
    }

    @Transactional
    public BookSummaryDto createBook(Requests.BookUpsert req) {
        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> BusinessException.notFound("分类不存在"));
        ScoresDto scores = req.scores() == null ? new ScoresDto(0.3, 0.2, 0.1, 0.4) : req.scores();
        Book book = Book.builder()
                .id("book-" + System.currentTimeMillis())
                .title(req.title().trim())
                .author(req.author().trim())
                .category(category)
                .tags(req.tags() == null || req.tags().isEmpty()
                        ? new LinkedHashSet<>(List.of(category.getName()))
                        : new LinkedHashSet<>(req.tags()))
                .rating(req.rating() == null ? 8.0 : req.rating())
                .readers(0)
                .words(req.words() == null ? "10 万" : req.words())
                .publishedYear(req.publishedYear() == null ? LocalDate.now().getYear() : req.publishedYear())
                .status(req.status() == null ? "连载" : req.status())
                .free(req.free() == null || req.free())
                .original(req.original() == null || req.original())
                .featured(Boolean.TRUE.equals(req.featured()))
                .listed(true)
                .coverTheme(req.coverTheme() == null ? "bottle" : req.coverTheme())
                .coverPattern(req.coverPattern() == null ? "letter" : req.coverPattern())
                .blurb(req.blurb() == null ? "新上架图书。" : req.blurb())
                .intro(req.intro() == null ? "这本新书刚刚放进书房。" : req.intro())
                .authorBio(req.authorBio() == null ? "作者信息待补充。" : req.authorBio())
                .reason(req.reason() == null ? "新书上架，给新声音一个位置" : req.reason())
                .contentScore(scores.content())
                .cfScore(scores.cf())
                .popularityScore(scores.popularity())
                .freshnessScore(scores.freshness())
                .createdAt(LocalDateTime.now())
                .build();
        books.save(book);
        recommendationService.clearAll();
        return DtoMapper.toSummary(book);
    }

    @Transactional
    public BookSummaryDto updateBook(String id, Requests.BookUpsert req) {
        Book book = books.findById(id).orElseThrow(() -> BusinessException.notFound("图书不存在"));
        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> BusinessException.notFound("分类不存在"));
        book.setTitle(req.title().trim());
        book.setAuthor(req.author().trim());
        book.setCategory(category);
        if (req.tags() != null) book.setTags(new LinkedHashSet<>(req.tags()));
        if (req.rating() != null) book.setRating(req.rating());
        if (req.words() != null) book.setWords(req.words());
        if (req.publishedYear() != null) book.setPublishedYear(req.publishedYear());
        if (req.status() != null) book.setStatus(req.status());
        if (req.free() != null) book.setFree(req.free());
        if (req.original() != null) book.setOriginal(req.original());
        if (req.featured() != null) book.setFeatured(req.featured());
        if (req.coverTheme() != null) book.setCoverTheme(req.coverTheme());
        if (req.coverPattern() != null) book.setCoverPattern(req.coverPattern());
        if (req.blurb() != null) book.setBlurb(req.blurb());
        if (req.intro() != null) book.setIntro(req.intro());
        if (req.authorBio() != null) book.setAuthorBio(req.authorBio());
        if (req.reason() != null) book.setReason(req.reason());
        if (req.scores() != null) {
            book.setContentScore(req.scores().content());
            book.setCfScore(req.scores().cf());
            book.setPopularityScore(req.scores().popularity());
            book.setFreshnessScore(req.scores().freshness());
        }
        books.save(book);
        recommendationService.clearAll();
        return DtoMapper.toSummary(book);
    }

    @Transactional
    public BookSummaryDto setListed(String id, boolean listed) {
        Book book = books.findById(id).orElseThrow(() -> BusinessException.notFound("图书不存在"));
        book.setListed(listed);
        books.save(book);
        recommendationService.clearAll();
        return DtoMapper.toSummary(book);
    }

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return users.findAll().stream().map(DtoMapper::toUser).toList();
    }

    @Transactional
    public UserDto setUserStatus(Long id, UserStatus status) {
        User user = users.findById(id).orElseThrow(() -> BusinessException.notFound("用户不存在"));
        user.setStatus(status);
        users.save(user);
        return DtoMapper.toUser(user);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> reviews(String status) {
        return reviewService.listAll(status);
    }

    @Transactional
    public ReviewDto moderateReview(Long id, ReviewStatus status) {
        return reviewService.moderate(id, status);
    }

    @Transactional(readOnly = true)
    public WeightsDto weights() {
        return recommendationService.weightsDto();
    }

    @Transactional
    public WeightsDto updateWeights(Requests.Weights req) {
        return recommendationService.updateWeights(req);
    }

    @Transactional
    public void rebuildRecommendations() {
        recommendationService.rebuildAll();
    }

    private String weekday(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "一";
            case TUESDAY -> "二";
            case WEDNESDAY -> "三";
            case THURSDAY -> "四";
            case FRIDAY -> "五";
            case SATURDAY -> "六";
            case SUNDAY -> "日";
        };
    }
}
