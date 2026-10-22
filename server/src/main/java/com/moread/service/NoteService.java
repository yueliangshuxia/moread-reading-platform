package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.*;
import com.moread.dto.NoteDto;
import com.moread.dto.Requests;
import com.moread.repository.BookRepository;
import com.moread.repository.NoteRepository;
import com.moread.repository.ReadingEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository notes;
    private final BookRepository books;
    private final ReadingEventRepository events;
    private final ProfileService profileService;
    private final RecommendationService recommendationService;

    @Transactional(readOnly = true)
    public List<NoteDto> list(User user, String bookId, String type) {
        NoteType noteType = parseType(type);
        List<Note> result;
        if (bookId != null && !bookId.isBlank()) {
            Book book = books.findByIdAndListedTrue(bookId)
                    .orElseThrow(() -> BusinessException.notFound("图书不存在"));
            result = noteType == null
                    ? notes.findByUserAndBookOrderByCreatedAtDesc(user, book)
                    : notes.findByUserAndBookAndTypeOrderByCreatedAtDesc(user, book, noteType);
        } else {
            result = noteType == null
                    ? notes.findByUserOrderByCreatedAtDesc(user)
                    : notes.findByUserAndTypeOrderByCreatedAtDesc(user, noteType);
        }
        return result.stream().map(DtoMapper::toNote).toList();
    }

    @Transactional
    public NoteDto create(User user, Requests.Note req) {
        Book book = books.findByIdAndListedTrue(req.bookId())
                .orElseThrow(() -> BusinessException.notFound("图书不存在"));
        if ((req.quote() == null || req.quote().isBlank()) && (req.content() == null || req.content().isBlank())) {
            throw new BusinessException("划线和笔记内容不能同时为空");
        }
        NoteType type = parseType(req.type());
        if (type == null) type = NoteType.NOTE;
        Note note = Note.builder()
                .user(user)
                .book(book)
                .chapterNo(req.chapterNo())
                .quote(req.quote())
                .content(req.content())
                .type(type)
                .page(req.page())
                .createdAt(LocalDateTime.now())
                .build();
        notes.save(note);
        events.save(ReadingEvent.builder()
                .user(user)
                .book(book)
                .eventType(type == NoteType.HIGHLIGHT ? ReadingEventType.HIGHLIGHT : ReadingEventType.NOTE)
                .durationSeconds(0)
                .createdAt(LocalDateTime.now())
                .build());
        profileService.refresh(user);
        recommendationService.clearCache(user.getId());
        return DtoMapper.toNote(note);
    }

    @Transactional
    public void delete(User user, Long id) {
        Note note = notes.findByIdAndUser(id, user)
                .orElseThrow(() -> BusinessException.notFound("笔记不存在"));
        notes.delete(note);
        profileService.refresh(user);
        recommendationService.clearCache(user.getId());
    }

    private NoteType parseType(String type) {
        if (type == null || type.isBlank()) return null;
        try {
            return NoteType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
