package com.moread.service.seed;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moread.domain.*;
import com.moread.repository.*;
import com.moread.service.ProfileService;
import com.moread.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final CategoryRepository categories;
    private final BookRepository books;
    private final ChapterRepository chapters;
    private final BooklistRepository booklists;
    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final ShelfItemRepository shelves;
    private final ReadingProgressRepository progresses;
    private final NoteRepository notes;
    private final ReviewRepository reviews;
    private final PostRepository posts;
    private final PostCommentRepository comments;
    private final ReadingEventRepository events;
    private final ReadingGoalRepository goals;
    private final RecommendationConfigRepository configs;
    private final PasswordEncoder passwordEncoder;
    private final ProfileService profileService;
    private final RecommendationService recommendationService;
    private final ObjectMapper objectMapper;

    @Value("${moread.seed.enabled:true}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) return;
        if (users.count() > 0) {
            log.info("数据库已有数据，跳过种子数据导入");
            return;
        }
        ObjectMapper mapper = objectMapper.copy()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        SeedData data;
        try (InputStream in = new ClassPathResource("seed/data.json").getInputStream()) {
            data = mapper.readValue(in, SeedData.class);
        }
        if (data == null) {
            log.warn("seed/data.json 为空，跳过");
            return;
        }

        Map<String, Category> categoryMap = new HashMap<>();
        for (SeedData.CategorySeed c : safe(data.categories())) {
            categoryMap.put(c.id(), categories.save(Category.builder()
                    .id(c.id()).name(c.name()).mark(c.mark())
                    .description(c.description()).sort(c.sort())
                    .build()));
        }

        Map<String, Book> bookMap = new HashMap<>();
        for (SeedData.BookSeed b : safe(data.books())) {
            Category category = categoryMap.get(b.categoryId());
            if (category == null) continue;
            SeedData.ScoresSeed s = b.scores() == null ? new SeedData.ScoresSeed(0.3, 0.2, 0.1, 0.4) : b.scores();
            Book book = Book.builder()
                    .id(b.id())
                    .title(b.title())
                    .author(b.author())
                    .category(category)
                    .tags(b.tags() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(b.tags()))
                    .rating(b.rating() == null ? 0.0 : b.rating())
                    .readers(b.readers() == null ? 0 : b.readers())
                    .words(b.words())
                    .publishedYear(b.publishedYear())
                    .status(b.status())
                    .free(Boolean.TRUE.equals(b.free()))
                    .original(Boolean.TRUE.equals(b.original()))
                    .featured(Boolean.TRUE.equals(b.featured()))
                    .listed(b.listed() == null || b.listed())
                    .coverTheme(b.coverTheme())
                    .coverPattern(b.coverPattern())
                    .blurb(b.blurb())
                    .intro(b.intro())
                    .authorBio(b.authorBio())
                    .reason(b.reason())
                    .contentScore(s.content())
                    .cfScore(s.cf())
                    .popularityScore(s.popularity())
                    .freshnessScore(s.freshness())
                    .createdAt(LocalDateTime.now())
                    .build();
            bookMap.put(book.getId(), books.save(book));
        }

        for (SeedData.ChapterSeed c : safe(data.chapters())) {
            Book book = bookMap.get(c.bookId());
            if (book == null) continue;
            chapters.save(Chapter.builder()
                    .book(book)
                    .title(c.title())
                    .orderNo(c.orderNo() == null ? 1 : c.orderNo())
                    .content(c.content())
                    .free(Boolean.TRUE.equals(c.free()))
                    .build());
        }

        for (SeedData.BooklistSeed l : safe(data.booklists())) {
            Booklist list = Booklist.builder()
                    .id(l.id()).title(l.title()).description(l.description())
                    .mark(l.mark()).theme(l.theme()).sort(l.sort())
                    .build();
            int order = 1;
            for (String bookId : safe(l.bookIds())) {
                Book book = bookMap.get(bookId);
                if (book == null) continue;
                list.getItems().add(BooklistItem.builder()
                        .booklist(list).book(book).sort(order++)
                        .build());
            }
            booklists.save(list);
        }

        Map<String, User> userMap = new HashMap<>();
        for (SeedData.UserSeed u : safe(data.users())) {
            User user = User.builder()
                    .email(u.email())
                    .passwordHash(passwordEncoder.encode(u.password() == null ? "123456" : u.password()))
                    .name(u.name())
                    .handle(u.handle())
                    .avatar(u.avatar() == null ? 0 : u.avatar())
                    .bio(u.bio())
                    .role(parseRole(u.role()))
                    .status(parseUserStatus(u.status()))
                    .createdAt(parseTime(u.joinedAt(), LocalDateTime.now()))
                    .build();
            userMap.put(user.getEmail(), users.save(user));
            profiles.save(UserProfile.builder().user(user).build());
        }

        for (SeedData.ShelfSeed s : safe(data.shelves())) {
            User user = userMap.get(s.email());
            Book book = bookMap.get(s.bookId());
            if (user == null || book == null) continue;
            shelves.save(ShelfItem.builder()
                    .user(user).book(book)
                    .status(parseShelfStatus(s.status()))
                    .createdAt(parseTime(s.createdAt(), LocalDateTime.now()))
                    .build());
        }

        for (SeedData.ProgressSeed p : safe(data.progress())) {
            User user = userMap.get(p.email());
            Book book = bookMap.get(p.bookId());
            if (user == null || book == null) continue;
            progresses.save(ReadingProgress.builder()
                    .user(user).book(book)
                    .chapterNo(p.chapterNo())
                    .percent(p.percent())
                    .lastReadAt(parseTime(p.lastReadAt(), LocalDateTime.now()))
                    .build());
        }

        for (SeedData.NoteSeed n : safe(data.notes())) {
            User user = userMap.get(n.email());
            Book book = bookMap.get(n.bookId());
            if (user == null || book == null) continue;
            notes.save(Note.builder()
                    .user(user).book(book)
                    .chapterNo(n.chapterNo())
                    .quote(n.quote())
                    .content(n.content())
                    .type(parseNoteType(n.type()))
                    .page(n.page())
                    .createdAt(parseTime(n.createdAt(), LocalDateTime.now()))
                    .build());
        }

        for (SeedData.ReviewSeed r : safe(data.reviews())) {
            User user = userMap.get(r.email());
            Book book = bookMap.get(r.bookId());
            if (user == null || book == null) continue;
            reviews.save(Review.builder()
                    .user(user).book(book)
                    .rating(r.rating() == null ? 5 : r.rating())
                    .content(r.content())
                    .status(parseReviewStatus(r.status()))
                    .likes(r.likes() == null ? 0 : r.likes())
                    .createdAt(parseTime(r.createdAt(), LocalDateTime.now()))
                    .build());
        }

        Map<String, Post> postMap = new HashMap<>();
        for (SeedData.PostSeed p : safe(data.posts())) {
            User user = userMap.get(p.email());
            if (user == null) continue;
            Book book = p.bookId() == null || p.bookId().isBlank() ? null : bookMap.get(p.bookId());
            Post post = posts.save(Post.builder()
                    .id(p.id())
                    .user(user)
                    .topic(p.topic())
                    .content(p.content())
                    .book(book)
                    .image(p.image())
                    .likes(p.likes() == null ? 0 : p.likes())
                    .commentCount(p.commentCount() == null ? 0 : p.commentCount())
                    .createdAt(parseTime(p.createdAt(), LocalDateTime.now()))
                    .build());
            postMap.put(post.getId(), post);
        }

        for (SeedData.CommentSeed c : safe(data.comments())) {
            User user = userMap.get(c.email());
            Post post = postMap.get(c.postId());
            if (user == null || post == null) continue;
            comments.save(PostComment.builder()
                    .post(post).user(user)
                    .content(c.content())
                    .createdAt(parseTime(c.createdAt(), LocalDateTime.now()))
                    .build());
        }

        for (SeedData.EventSeed e : safe(data.events())) {
            User user = userMap.get(e.email());
            Book book = bookMap.get(e.bookId());
            if (user == null || book == null) continue;
            events.save(ReadingEvent.builder()
                    .user(user).book(book)
                    .eventType(parseEventType(e.eventType()))
                    .durationSeconds(e.durationSeconds() == null ? 0 : e.durationSeconds())
                    .percent(e.percent())
                    .createdAt(parseTime(e.createdAt(), LocalDateTime.now()))
                    .build());
        }

        for (SeedData.GoalSeed g : safe(data.goals())) {
            User user = userMap.get(g.email());
            if (user == null) continue;
            goals.save(ReadingGoal.builder()
                    .user(user)
                    .year(g.year() == null ? LocalDateTime.now().getYear() : g.year())
                    .target(g.target() == null ? 24 : g.target())
                    .build());
        }

        SeedData.WeightSeed w = data.weights() == null
                ? new SeedData.WeightSeed(0.35, 0.30, 0.20, 0.15) : data.weights();
        configs.save(RecommendationConfig.builder()
                .id(1L)
                .contentWeight(w.content())
                .cfWeight(w.cf())
                .popularityWeight(w.popularity())
                .freshnessWeight(w.freshness())
                .build());

        profileService.refreshAll();
        recommendationService.rebuildAll();
        log.info("种子数据导入完成：{} 分类，{} 本书，{} 用户，{} 事件",
                categoryMap.size(), bookMap.size(), userMap.size(), safe(data.events()).size());
    }

    private <T> List<T> safe(List<T> list) {
        return list == null ? List.of() : list;
    }

    private Role parseRole(String value) {
        try { return Role.valueOf(value == null ? "READER" : value.toUpperCase()); }
        catch (Exception e) { return Role.READER; }
    }

    private UserStatus parseUserStatus(String value) {
        try { return UserStatus.valueOf(value == null ? "ACTIVE" : value.toUpperCase()); }
        catch (Exception e) { return UserStatus.ACTIVE; }
    }

    private ShelfStatus parseShelfStatus(String value) {
        try { return ShelfStatus.valueOf(value == null ? "WANT" : value.toUpperCase()); }
        catch (Exception e) { return ShelfStatus.WANT; }
    }

    private NoteType parseNoteType(String value) {
        try { return NoteType.valueOf(value == null ? "NOTE" : value.toUpperCase()); }
        catch (Exception e) { return NoteType.NOTE; }
    }

    private ReviewStatus parseReviewStatus(String value) {
        try { return ReviewStatus.valueOf(value == null ? "PENDING" : value.toUpperCase()); }
        catch (Exception e) { return ReviewStatus.PENDING; }
    }

    private ReadingEventType parseEventType(String value) {
        try { return ReadingEventType.valueOf(value == null ? "SESSION" : value.toUpperCase()); }
        catch (Exception e) { return ReadingEventType.SESSION; }
    }

    private LocalDateTime parseTime(String value, LocalDateTime fallback) {
        if (value == null || value.isBlank()) return fallback;
        try { return LocalDateTime.parse(value); }
        catch (Exception e) { return fallback; }
    }
}
