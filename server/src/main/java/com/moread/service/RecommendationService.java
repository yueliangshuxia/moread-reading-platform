package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.*;
import com.moread.dto.*;
import com.moread.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final double[] DEFAULT_WEIGHTS = {0.35, 0.30, 0.20, 0.15};
    private static final double MMR_LAMBDA = 0.7;
    private static final long CACHE_SECONDS = 300;

    private final BookRepository books;
    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final ShelfItemRepository shelves;
    private final NoteRepository notes;
    private final ReviewRepository reviews;
    private final ReadingEventRepository events;
    private final RecommendationRepository recommendations;
    private final RecommendationConfigRepository configs;

    private final Map<Long, CachedRecommendations> cache = new ConcurrentHashMap<>();

    private record CachedRecommendations(List<RecommendationDto> items, Instant createdAt) {
        boolean fresh() {
            return createdAt.plusSeconds(CACHE_SECONDS).isAfter(Instant.now());
        }
    }

    /* ------------------------------------------------------------
       public API
       ------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public List<RecommendationDto> getHome(User user, int limit) {
        long key = user.getId();
        CachedRecommendations cached = cache.get(key);
        if (cached != null && cached.fresh() && cached.items().size() >= limit) {
            return cached.items().subList(0, limit);
        }
        List<RecommendationDto> computed = compute(user, Math.max(limit, 12));
        cache.put(key, new CachedRecommendations(computed, Instant.now()));
        return computed.subList(0, Math.min(limit, computed.size()));
    }

    @Transactional(readOnly = true)
    public FactorDto factorsFor(String bookId, User user) {
        Book book = books.findByIdAndListedTrue(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        UserProfile profile = profiles.findByUser(user).orElse(null);
        Set<String> preferredCategories = parse(profile == null ? null : profile.getPreferredCategories());
        Set<String> preferredTags = parse(profile == null ? null : profile.getPreferredTags());
        Set<String> interacted = interactedBookIds(user);

        double content = contentScore(book, preferredCategories, preferredTags);
        double cf = cfScore(book, interacted);
        double popularity = popularityScore(book, maxReaders());
        double freshness = freshnessScore(book);
        double[] raw = {content, cf, popularity, freshness};
        String reason = reasonFor(book, user, raw, weights(), interacted);
        return new FactorDto(
                (int) Math.round(content * 100),
                (int) Math.round(cf * 100),
                (int) Math.round(popularity * 100),
                (int) Math.round(freshness * 100),
                reason
        );
    }

    @Transactional(readOnly = true)
    public List<BookSummaryDto> similar(String bookId, int limit) {
        Book origin = books.findByIdAndListedTrue(bookId)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        return books.findAllByListedTrue().stream()
                .filter(b -> !b.getId().equals(bookId))
                .sorted(Comparator.comparingDouble((Book b) -> similarity(origin, b)).reversed())
                .limit(limit)
                .map(DtoMapper::toSummary)
                .toList();
    }

    public void clearCache(Long userId) {
        if (userId == null) cache.clear();
        else cache.remove(userId);
    }

    public void clearAll() {
        cache.clear();
    }

    @Transactional
    public void rebuildAll() {
        LocalDate today = LocalDate.now();
        recommendations.deleteByBatchDate(today);
        for (User user : users.findAllByRole(Role.READER)) {
            try {
                List<RecommendationDto> list = compute(user, 20);
                for (RecommendationDto dto : list) {
                    Book book = books.findById(dto.book().id()).orElse(null);
                    if (book == null) continue;
                    recommendations.save(Recommendation.builder()
                            .user(user)
                            .book(book)
                            .score(dto.score())
                            .reason(dto.reason())
                            .algorithm("hybrid-cb-itemcf-ahp-topsis-mmr")
                            .batchDate(today)
                            .build());
                }
                cache.put(user.getId(), new CachedRecommendations(list, Instant.now()));
            } catch (Exception ignored) {
                // 单个用户失败不应该影响整批任务
            }
        }
    }

    @Transactional(readOnly = true)
    public WeightsDto weightsDto() {
        double[] w = weights();
        return new WeightsDto(round(w[0] * 100), round(w[1] * 100), round(w[2] * 100), round(w[3] * 100));
    }

    @Transactional
    public WeightsDto updateWeights(Requests.Weights req) {
        double[] raw = {req.content(), req.cf(), req.popularity(), req.freshness()};
        double[] normalized = RecommendationMath.normalizeWeights(raw, 4);
        RecommendationConfig config = config();
        config.setContentWeight(normalized[0]);
        config.setCfWeight(normalized[1]);
        config.setPopularityWeight(normalized[2]);
        config.setFreshnessWeight(normalized[3]);
        configs.save(config);
        cache.clear();
        return weightsDto();
    }

    /* ------------------------------------------------------------
       scoring
       ------------------------------------------------------------ */

    @Transactional(readOnly = true)
    protected List<RecommendationDto> compute(User user, int limit) {
        List<Book> all = books.findAllByListedTrue();
        if (all.isEmpty()) return List.of();

        Set<String> interacted = interactedBookIds(user);
        Set<String> finished = shelves.findByUserAndStatus(user, ShelfStatus.FINISHED).stream()
                .map(s -> s.getBook().getId()).collect(Collectors.toSet());

        List<Book> candidates = all.stream()
                .filter(b -> !finished.contains(b.getId()) && !interacted.contains(b.getId()))
                .toList();
        // 新用户或交互很少时放宽候选集，避免首页空掉
        if (candidates.size() < Math.min(12, all.size())) {
            candidates = all.stream().filter(b -> !finished.contains(b.getId())).toList();
        }
        if (candidates.isEmpty()) return List.of();

        UserProfile profile = profiles.findByUser(user).orElse(null);
        Set<String> preferredCategories = parse(profile == null ? null : profile.getPreferredCategories());
        Set<String> preferredTags = parse(profile == null ? null : profile.getPreferredTags());
        Map<String, Set<Long>> bookUsers = bookUsers();
        int maxReaders = maxReaders();
        double[] weights = weights();

        int n = candidates.size();
        double[][] raw = new double[n][4];
        for (int i = 0; i < n; i++) {
            Book b = candidates.get(i);
            raw[i][0] = contentScore(b, preferredCategories, preferredTags);
            raw[i][1] = cfScore(b, interacted, bookUsers);
            raw[i][2] = popularityScore(b, maxReaders);
            raw[i][3] = freshnessScore(b);
        }
        double[] closeness = RecommendationMath.topsis(raw, weights);

        double[][] similarity = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double sim = similarity(candidates.get(i), candidates.get(j));
                similarity[i][j] = sim;
                similarity[j][i] = sim;
            }
        }
        List<Integer> selected = RecommendationMath.mmr(closeness, similarity, limit, MMR_LAMBDA);

        List<RecommendationDto> result = new ArrayList<>();
        for (int idx : selected) {
            Book b = candidates.get(idx);
            String reason = reasonFor(b, user, raw[idx], weights, interacted);
            result.add(new RecommendationDto(
                    DtoMapper.toSummary(b),
                    round(closeness[idx]),
                    reason,
                    new FactorDto(
                            (int) Math.round(raw[idx][0] * 100),
                            (int) Math.round(raw[idx][1] * 100),
                            (int) Math.round(raw[idx][2] * 100),
                            (int) Math.round(raw[idx][3] * 100),
                            reason
                    )
            ));
        }
        return result;
    }

    private double contentScore(Book book, Set<String> preferredCategories, Set<String> preferredTags) {
        if (preferredCategories.isEmpty() && preferredTags.isEmpty()) return 0.4;
        double category = preferredCategories.contains(book.getCategory().getId()) ? 1.0 : 0.15;
        double tags = RecommendationMath.jaccard(book.getTags(), preferredTags);
        return 0.6 * category + 0.4 * tags;
    }

    private double cfScore(Book book, Set<String> interacted) {
        return cfScore(book, interacted, bookUsers());
    }

    private double cfScore(Book book, Set<String> interacted, Map<String, Set<Long>> bookUsers) {
        if (interacted.isEmpty()) return 0.0;
        Set<Long> targetUsers = bookUsers.getOrDefault(book.getId(), Set.of());
        if (targetUsers.isEmpty()) return 0.0;
        double sum = 0.0;
        for (String id : interacted) {
            Set<Long> other = bookUsers.getOrDefault(id, Set.of());
            if (other.isEmpty()) continue;
            long inter = targetUsers.stream().filter(other::contains).count();
            double denom = Math.sqrt((double) targetUsers.size() * other.size());
            if (denom > 0) sum += inter / denom;
        }
        return Math.min(1.0, sum / Math.sqrt(interacted.size()));
    }

    private double popularityScore(Book book, int maxReaders) {
        if (maxReaders <= 0) return 0.0;
        int readers = book.getReaders() == null ? 0 : book.getReaders();
        return Math.min(1.0, Math.log1p(readers) / Math.log1p(maxReaders));
    }

    private double freshnessScore(Book book) {
        if (book.getPublishedYear() == null) return 0.5;
        int age = Math.max(0, LocalDate.now().getYear() - book.getPublishedYear());
        return 1.0 / (1.0 + age / 8.0);
    }

    private double similarity(Book a, Book b) {
        double tags = RecommendationMath.jaccard(a.getTags(), b.getTags());
        double category = a.getCategory().getId().equals(b.getCategory().getId()) ? 0.3 : 0.0;
        double author = a.getAuthor().equals(b.getAuthor()) ? 0.1 : 0.0;
        return Math.min(1.0, tags * 0.6 + category + author);
    }

    private String reasonFor(Book book, User user, double[] raw, double[] weights, Set<String> interacted) {
        double[] contribution = new double[4];
        for (int i = 0; i < 4; i++) contribution[i] = raw[i] * weights[i];
        int dominant = 0;
        for (int i = 1; i < 4; i++) {
            if (contribution[i] > contribution[dominant]) dominant = i;
        }
        return switch (dominant) {
            case 0 -> "与你偏爱的「" + book.getCategory().getName() + "」相近，标签也有重合";
            case 1 -> {
                Book closest = closestInteracted(book, user, interacted);
                yield closest == null
                        ? "和与你口味相近的读者读过同一批书"
                        : "和你在读的《" + closest.getTitle() + "》相似";
            }
            case 2 -> "站内热门，已有 " + (book.getReaders() == null ? 0 : book.getReaders()) + " 人读过";
            default -> "新书上架，给新声音一个位置";
        };
    }

    private Book closestInteracted(Book book, User user, Set<String> interacted) {
        if (interacted.isEmpty()) return null;
        Book best = null;
        double bestSim = -1;
        for (Book b : books.findAllById(interacted)) {
            double sim = similarity(book, b);
            if (sim > bestSim) {
                bestSim = sim;
                best = b;
            }
        }
        return best;
    }

    /* ------------------------------------------------------------
       data helpers
       ------------------------------------------------------------ */

    private Set<String> interactedBookIds(User user) {
        Set<String> ids = new HashSet<>();
        shelves.findByUserOrderByUpdatedAtDesc(user).forEach(s -> ids.add(s.getBook().getId()));
        notes.findByUserOrderByCreatedAtDesc(user).forEach(n -> ids.add(n.getBook().getId()));
        reviews.findByUserIdOrderByCreatedAtDesc(user.getId()).forEach(r -> ids.add(r.getBook().getId()));
        return ids;
    }

    private Map<String, Set<Long>> bookUsers() {
        Map<String, Set<Long>> map = new HashMap<>();
        shelves.findAll().forEach(s -> map.computeIfAbsent(s.getBook().getId(), k -> new HashSet<>()).add(s.getUser().getId()));
        notes.findAll().forEach(n -> map.computeIfAbsent(n.getBook().getId(), k -> new HashSet<>()).add(n.getUser().getId()));
        reviews.findAll().forEach(r -> map.computeIfAbsent(r.getBook().getId(), k -> new HashSet<>()).add(r.getUser().getId()));
        return map;
    }

    private int maxReaders() {
        return books.findAllByListedTrue().stream()
                .mapToInt(b -> b.getReaders() == null ? 0 : b.getReaders())
                .max().orElse(0);
    }

    private RecommendationConfig config() {
        return configs.findById(1L).orElseGet(() -> configs.save(RecommendationConfig.builder()
                .id(1L)
                .contentWeight(DEFAULT_WEIGHTS[0])
                .cfWeight(DEFAULT_WEIGHTS[1])
                .popularityWeight(DEFAULT_WEIGHTS[2])
                .freshnessWeight(DEFAULT_WEIGHTS[3])
                .build()));
    }

    private double[] weights() {
        RecommendationConfig c = config();
        return RecommendationMath.normalizeWeights(new double[]{
                c.getContentWeight() == null ? DEFAULT_WEIGHTS[0] : c.getContentWeight(),
                c.getCfWeight() == null ? DEFAULT_WEIGHTS[1] : c.getCfWeight(),
                c.getPopularityWeight() == null ? DEFAULT_WEIGHTS[2] : c.getPopularityWeight(),
                c.getFreshnessWeight() == null ? DEFAULT_WEIGHTS[3] : c.getFreshnessWeight()
        }, 4);
    }

    private Set<String> parse(String csv) {
        if (csv == null || csv.isBlank()) return Set.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private double round(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }
}
