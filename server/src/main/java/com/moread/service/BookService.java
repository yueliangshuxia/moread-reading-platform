package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.common.PageResponse;
import com.moread.domain.*;
import com.moread.dto.*;
import com.moread.repository.BookRepository;
import com.moread.repository.BooklistRepository;
import com.moread.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository books;
    private final ChapterRepository chapters;
    private final BooklistRepository booklists;
    private final ReviewService reviewService;
    private final RecommendationService recommendationService;

    @Transactional(readOnly = true)
    public PageResponse<BookSummaryDto> list(String q, String categoryId, String sort, Boolean free,
                                             String listId, int page, int size) {
        List<Book> pool = books.findAllByListedTrue();

        if (listId != null && !listId.isBlank()) {
            Booklist list = booklists.findById(listId)
                    .orElseThrow(() -> BusinessException.notFound("书单不存在"));
            Set<String> ids = list.getItems().stream()
                    .map(i -> i.getBook().getId())
                    .collect(Collectors.toSet());
            pool = pool.stream().filter(b -> ids.contains(b.getId())).toList();
        }
        if (categoryId != null && !categoryId.isBlank() && !"all".equals(categoryId)) {
            pool = pool.stream().filter(b -> categoryId.equals(b.getCategory().getId())).toList();
        }
        if (Boolean.TRUE.equals(free)) {
            pool = pool.stream().filter(b -> Boolean.TRUE.equals(b.getFree())).toList();
        }
        if (q != null && !q.isBlank()) {
            String needle = q.trim().toLowerCase(Locale.ROOT);
            pool = pool.stream().filter(b -> searchText(b).contains(needle)).toList();
        }

        Comparator<Book> comparator = switch (sort == null ? "recommend" : sort) {
            case "rating" -> Comparator.comparingDouble((Book b) -> nz(b.getRating())).reversed();
            case "readers" -> Comparator.comparingInt((Book b) -> nz(b.getReaders())).reversed();
            case "year" -> Comparator.comparingInt((Book b) -> nz(b.getPublishedYear())).reversed();
            default -> Comparator
                    .comparing((Book b) -> Boolean.TRUE.equals(b.getFeatured()) ? 1 : 0).reversed()
                    .thenComparing(Comparator.comparingDouble((Book b) -> nz(b.getRating())).reversed());
        };
        List<Book> sorted = pool.stream().sorted(comparator).toList();

        int safePage = Math.max(1, page);
        int safeSize = size <= 0 ? 50 : Math.min(size, 100);
        int from = Math.min((safePage - 1) * safeSize, sorted.size());
        int to = Math.min(from + safeSize, sorted.size());
        List<BookSummaryDto> content = sorted.subList(from, to).stream().map(DtoMapper::toSummary).toList();
        return PageResponse.of(content, safePage, safeSize, sorted.size());
    }

    @Transactional(readOnly = true)
    public BookDetailDto detail(String id) {
        Book book = listed(id);
        return DtoMapper.toDetail(book, chapters.findByBookIdOrderByOrderNoAsc(id));
    }

    @Transactional(readOnly = true)
    public List<ChapterDto> chapters(String id) {
        listed(id);
        return chapters.findByBookIdOrderByOrderNoAsc(id).stream().map(DtoMapper::toChapter).toList();
    }

    @Transactional(readOnly = true)
    public ChapterContentDto chapter(String id, Integer orderNo, User user) {
        listed(id);
        Chapter chapter = chapters.findByBookIdAndOrderNo(id, orderNo)
                .orElseThrow(() -> BusinessException.notFound("章节不存在"));
        if (!Boolean.TRUE.equals(chapter.getFree()) && user == null) {
            throw new AccessDeniedException("该章节需要登录后阅读");
        }
        return DtoMapper.toChapterContent(chapter);
    }

    @Transactional(readOnly = true)
    public List<BookSummaryDto> similar(String id) {
        return recommendationService.similar(id, 6);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> reviews(String id, User user) {
        return reviewService.bookReviews(id, user);
    }

    @Transactional
    public ReviewDto addReview(User user, String id, Requests.Review req) {
        return reviewService.create(user, id, req);
    }

    @Transactional(readOnly = true)
    public FactorDto factors(String id, User user) {
        return recommendationService.factorsFor(id, user);
    }

    private Book listed(String id) {
        return books.findByIdAndListedTrue(id)
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
    }

    private String searchText(Book b) {
        return (b.getTitle() + " " + b.getAuthor() + " " + b.getCategory().getName() + " "
                + String.join(" ", b.getTags()) + " " + (b.getBlurb() == null ? "" : b.getBlurb()))
                .toLowerCase(Locale.ROOT);
    }

    private double nz(Double v) { return v == null ? 0.0 : v; }
    private int nz(Integer v) { return v == null ? 0 : v; }
}
