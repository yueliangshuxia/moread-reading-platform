package com.moread.service;

import com.moread.common.TimeUtils;
import com.moread.domain.*;
import com.moread.dto.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public final class DtoMapper {

    private DtoMapper() {
    }

    public static BookSummaryDto toSummary(Book b) {
        return new BookSummaryDto(
                b.getId(),
                b.getTitle(),
                b.getAuthor(),
                b.getCategory().getName(),
                b.getCategory().getId(),
                new ArrayList<>(b.getTags()),
                nz(b.getRating()),
                nz(b.getReaders()),
                b.getWords(),
                nz(b.getPublishedYear()),
                b.getStatus(),
                Boolean.TRUE.equals(b.getFree()),
                Boolean.TRUE.equals(b.getOriginal()),
                Boolean.TRUE.equals(b.getFeatured()),
                Boolean.TRUE.equals(b.getListed()),
                new CoverDto(b.getCoverTheme(), b.getCoverPattern()),
                b.getBlurb(),
                new ScoresDto(nz(b.getContentScore()), nz(b.getCfScore()), nz(b.getPopularityScore()), nz(b.getFreshnessScore())),
                b.getReason()
        );
    }

    public static BookDetailDto toDetail(Book b, List<Chapter> chapters) {
        return new BookDetailDto(
                b.getId(),
                b.getTitle(),
                b.getAuthor(),
                b.getCategory().getName(),
                b.getCategory().getId(),
                new ArrayList<>(b.getTags()),
                nz(b.getRating()),
                nz(b.getReaders()),
                b.getWords(),
                nz(b.getPublishedYear()),
                b.getStatus(),
                Boolean.TRUE.equals(b.getFree()),
                Boolean.TRUE.equals(b.getOriginal()),
                Boolean.TRUE.equals(b.getFeatured()),
                Boolean.TRUE.equals(b.getListed()),
                new CoverDto(b.getCoverTheme(), b.getCoverPattern()),
                b.getBlurb(),
                b.getIntro(),
                b.getAuthorBio(),
                new ScoresDto(nz(b.getContentScore()), nz(b.getCfScore()), nz(b.getPopularityScore()), nz(b.getFreshnessScore())),
                b.getReason(),
                chapters.stream().map(DtoMapper::toChapter).toList()
        );
    }

    public static ChapterDto toChapter(Chapter c) {
        return new ChapterDto(c.getId(), c.getTitle(), nz(c.getOrderNo()), Boolean.TRUE.equals(c.getFree()));
    }

    public static ChapterContentDto toChapterContent(Chapter c) {
        return new ChapterContentDto(
                c.getId(),
                c.getBook().getId(),
                c.getBook().getTitle(),
                c.getTitle(),
                nz(c.getOrderNo()),
                Boolean.TRUE.equals(c.getFree()),
                c.getContent()
        );
    }

    public static ReviewDto toReview(Review r, boolean liked) {
        return new ReviewDto(
                r.getId(),
                r.getBook().getId(),
                r.getBook().getTitle(),
                r.getUser().getName(),
                nz(r.getUser().getAvatar()),
                TimeUtils.relative(r.getCreatedAt()),
                nz(r.getRating()),
                nz(r.getLikes()),
                r.getContent(),
                r.getStatus().name(),
                liked
        );
    }

    public static NoteDto toNote(Note n) {
        return new NoteDto(
                n.getId(),
                n.getBook().getId(),
                n.getBook().getTitle(),
                n.getUser().getName(),
                nz(n.getUser().getAvatar()),
                TimeUtils.relative(n.getCreatedAt()),
                n.getPage(),
                n.getQuote(),
                n.getContent(),
                n.getType().name()
        );
    }

    public static PostDto toPost(Post p, boolean liked) {
        Book book = p.getBook();
        return new PostDto(
                p.getId(),
                p.getUser().getName(),
                nz(p.getUser().getAvatar()),
                TimeUtils.relative(p.getCreatedAt()),
                p.getTopic(),
                book == null ? null : book.getId(),
                book == null ? null : book.getTitle(),
                book == null ? null : book.getAuthor(),
                p.getContent(),
                p.getImage(),
                nz(p.getLikes()),
                nz(p.getCommentCount()),
                liked
        );
    }

    public static CommentDto toComment(PostComment c) {
        return new CommentDto(
                c.getId(),
                c.getPost().getId(),
                c.getUser().getName(),
                nz(c.getUser().getAvatar()),
                TimeUtils.relative(c.getCreatedAt()),
                c.getContent()
        );
    }

    public static BooklistDto toBooklist(Booklist l, List<BookSummaryDto> books) {
        return new BooklistDto(
                l.getId(),
                l.getTitle(),
                l.getDescription(),
                l.getMark(),
                l.getTheme(),
                books.size(),
                books
        );
    }

    public static AuthUserDto toAuthUser(User u) {
        return new AuthUserDto(
                u.getId(), u.getName(), u.getEmail(), u.getHandle(),
                nz(u.getAvatar()), u.getBio(), u.getRole().name()
        );
    }

    public static UserDto toUser(User u) {
        return new UserDto(
                u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getStatus().name(),
                nz(u.getAvatar()),
                u.getCreatedAt() == null ? "" : u.getCreatedAt().toLocalDate().toString()
        );
    }

    public static String joined(User u) {
        if (u.getCreatedAt() == null) return "";
        return u.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy 年 M 月"));
    }

    private static int nz(Integer v) { return v == null ? 0 : v; }
    private static double nz(Double v) { return v == null ? 0.0 : v; }
}
