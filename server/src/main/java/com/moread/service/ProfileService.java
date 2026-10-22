package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.common.TimeUtils;
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
public class ProfileService {

    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final ShelfItemRepository shelves;
    private final NoteRepository notes;
    private final ReviewRepository reviews;
    private final ReadingEventRepository events;
    private final ReadingGoalRepository goals;
    private final CategoryRepository categories;

    @Transactional(readOnly = true)
    public ProfileDto get(User user) {
        UserProfile profile = profiles.findByUser(user).orElse(null);
        StatsDto stats = stats(user);
        List<String> categoryNames = new ArrayList<>();
        if (profile != null && profile.getPreferredCategories() != null) {
            Map<String, String> byId = new HashMap<>();
            for (Category c : categories.findAll()) byId.put(c.getId(), c.getName());
            for (String id : profile.getPreferredCategories().split(",")) {
                if (!id.isBlank() && byId.containsKey(id)) categoryNames.add(byId.get(id));
            }
        }
        List<String> tagNames = profile == null || profile.getPreferredTags() == null
                ? List.of()
                : Arrays.stream(profile.getPreferredTags().split(",")).filter(s -> !s.isBlank()).toList();
        return new ProfileDto(
                user.getId(),
                user.getName(),
                user.getHandle(),
                user.getAvatar() == null ? 0 : user.getAvatar(),
                user.getBio(),
                DtoMapper.joined(user),
                stats,
                stats.goal(),
                categoryNames,
                tagNames
        );
    }

    @Transactional(readOnly = true)
    public StatsDto stats(User user) {
        LocalDate today = LocalDate.now();
        LocalDateTime since = today.minusDays(83).atStartOfDay();
        List<ReadingEvent> all = events.findByUserAndCreatedAtAfterOrderByCreatedAtAsc(user, since);
        List<ReadingEvent> sessions = all.stream()
                .filter(e -> e.getEventType() == ReadingEventType.SESSION)
                .toList();

        Map<LocalDate, Integer> dailyMinutes = new HashMap<>();
        Map<String, Long> categorySeconds = new HashMap<>();
        long totalSeconds = 0;
        for (ReadingEvent e : sessions) {
            int seconds = Math.max(0, e.getDurationSeconds() == null ? 0 : e.getDurationSeconds());
            totalSeconds += seconds;
            dailyMinutes.merge(e.getCreatedAt().toLocalDate(), seconds / 60, Integer::sum);
            String category = e.getBook().getCategory().getName();
            categorySeconds.merge(category, (long) seconds, Long::sum);
        }

        List<Integer> weekly = new ArrayList<>();
        List<String> labels = new ArrayList<>();
        for (int offset = 6; offset >= 0; offset--) {
            LocalDate d = today.minusDays(offset);
            weekly.add(dailyMinutes.getOrDefault(d, 0));
            labels.add(weekday(d.getDayOfWeek()));
        }

        List<Integer> heatmap = new ArrayList<>();
        LocalDate start = today.minusDays(83);
        for (int i = 0; i < 84; i++) {
            int mins = dailyMinutes.getOrDefault(start.plusDays(i), 0);
            heatmap.add(level(mins));
        }

        Set<LocalDate> activeDays = dailyMinutes.keySet();
        int streak = 0;
        LocalDate cursor = today;
        if (!activeDays.contains(cursor)) cursor = cursor.minusDays(1);
        while (activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        int hours = (int) Math.round(totalSeconds / 3600.0);
        int finished = (int) shelves.countByUserAndStatus(user, ShelfStatus.FINISHED);
        int notesCount = (int) notes.countByUser(user);

        return new StatsDto(
                hours,
                finished,
                notesCount,
                streak,
                weekly,
                labels,
                heatmap,
                categoryShares(categorySeconds),
                goalFor(user)
        );
    }

    @Transactional
    public void refresh(User user) {
        List<ShelfItem> shelfItems = shelves.findByUserOrderByUpdatedAtDesc(user);
        List<Note> userNotes = notes.findByUserOrderByCreatedAtDesc(user);
        List<Review> userReviews = reviews.findByUserIdOrderByCreatedAtDesc(user.getId());

        Map<String, Integer> categoryCounts = new HashMap<>();
        Map<String, Integer> tagCounts = new HashMap<>();
        for (ShelfItem item : shelfItems) {
            collect(item.getBook(), categoryCounts, tagCounts);
        }
        for (Note note : userNotes) {
            collect(note.getBook(), categoryCounts, tagCounts);
        }
        for (Review review : userReviews) {
            collect(review.getBook(), categoryCounts, tagCounts);
        }

        String preferredCategories = top(categoryCounts, 3);
        String preferredTags = top(tagCounts, 5);

        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<ReadingEvent> recent = events.findByUserAndCreatedAtAfterOrderByCreatedAtAsc(user, since);
        double avgMinutes = recent.stream()
                .filter(e -> e.getEventType() == ReadingEventType.SESSION)
                .mapToInt(e -> Math.max(0, e.getDurationSeconds() == null ? 0 : e.getDurationSeconds()))
                .average()
                .orElse(0.0) / 60.0;

        long reading = shelves.countByUserAndStatus(user, ShelfStatus.READING);
        long finished = shelves.countByUserAndStatus(user, ShelfStatus.FINISHED);
        long active = reading + finished;
        double completionRate = active == 0 ? 0.0 : (double) finished / active;

        UserProfile profile = profiles.findByUser(user).orElseGet(() -> UserProfile.builder().user(user).build());
        profile.setPreferredCategories(preferredCategories);
        profile.setPreferredTags(preferredTags);
        profile.setAvgSessionMinutes(Math.round(avgMinutes * 10.0) / 10.0);
        profile.setCompletionRate(Math.round(completionRate * 1000.0) / 1000.0);
        profiles.save(profile);
    }

    @Transactional
    public void refreshAll() {
        users.findAllByRole(Role.READER).forEach(this::refresh);
    }

    @Transactional
    public ProfileDto update(User user, Requests.ProfileUpdate req) {
        if (req.name() != null && !req.name().isBlank()) user.setName(req.name().trim());
        if (req.bio() != null) user.setBio(req.bio());
        if (req.avatar() != null) user.setAvatar(req.avatar());
        users.save(user);
        return get(user);
    }

    @Transactional(readOnly = true)
    public GoalDto getGoal(User user) {
        return goalFor(user);
    }

    @Transactional
    public GoalDto updateGoal(User user, Requests.Goal req) {
        int year = req.year();
        ReadingGoal goal = goals.findByUserAndYear(user, year)
                .orElseGet(() -> ReadingGoal.builder().user(user).year(year).build());
        goal.setTarget(req.target());
        goals.save(goal);
        return goalFor(user);
    }

    private GoalDto goalFor(User user) {
        int year = LocalDate.now().getYear();
        ReadingGoal goal = goals.findByUserAndYear(user, year).orElse(null);
        int target = goal == null ? 24 : goal.getTarget();
        long finished = shelves.findByUserAndStatus(user, ShelfStatus.FINISHED).stream()
                .filter(s -> s.getUpdatedAt() == null || s.getUpdatedAt().getYear() == year)
                .count();
        int percent = target <= 0 ? 0 : (int) Math.min(100, Math.round(finished * 100.0 / target));
        return new GoalDto(year, target, (int) finished, percent);
    }

    private void collect(Book book, Map<String, Integer> categoryCounts, Map<String, Integer> tagCounts) {
        if (book == null) return;
        categoryCounts.merge(book.getCategory().getId(), 1, Integer::sum);
        for (String tag : book.getTags()) tagCounts.merge(tag, 1, Integer::sum);
    }

    private String top(Map<String, Integer> counts, int n) {
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(n)
                .map(Map.Entry::getKey)
                .reduce((a, b) -> a + "," + b)
                .orElse("");
    }

    private List<CategoryShareDto> categoryShares(Map<String, Long> categorySeconds) {
        long total = categorySeconds.values().stream().mapToLong(Long::longValue).sum();
        if (total <= 0) return List.of();
        List<CategoryShareDto> result = new ArrayList<>();
        List<Map.Entry<String, Long>> sorted = categorySeconds.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .toList();
        long used = 0;
        for (int i = 0; i < sorted.size() && i < 5; i++) {
            Map.Entry<String, Long> e = sorted.get(i);
            result.add(new CategoryShareDto(e.getKey(), Math.round(e.getValue() * 1000.0 / total) / 10.0));
            used += e.getValue();
        }
        if (sorted.size() > 5 && used < total) {
            result.add(new CategoryShareDto("其他", Math.round((total - used) * 1000.0 / total) / 10.0));
        }
        return result;
    }

    private int level(int minutes) {
        if (minutes <= 0) return 0;
        if (minutes <= 20) return 1;
        if (minutes <= 40) return 2;
        if (minutes <= 70) return 3;
        return 4;
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
