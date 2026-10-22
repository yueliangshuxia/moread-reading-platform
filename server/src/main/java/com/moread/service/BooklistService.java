package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.Book;
import com.moread.domain.Booklist;
import com.moread.domain.BooklistItem;
import com.moread.dto.BookSummaryDto;
import com.moread.dto.BooklistDto;
import com.moread.repository.BooklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BooklistService {

    private final BooklistRepository booklists;

    @Transactional(readOnly = true)
    public List<BooklistDto> list() {
        return booklists.findAllByOrderBySortAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public BooklistDto detail(String id) {
        Booklist list = booklists.findById(id)
                .orElseThrow(() -> BusinessException.notFound("书单不存在"));
        return toDto(list);
    }

    private BooklistDto toDto(Booklist list) {
        List<BookSummaryDto> items = list.getItems().stream()
                .map(BooklistItem::getBook)
                .filter(b -> Boolean.TRUE.equals(b.getListed()))
                .map(DtoMapper::toSummary)
                .toList();
        return DtoMapper.toBooklist(list, items);
    }
}
