package com.moread.service;

import com.moread.domain.Book;
import com.moread.domain.Category;
import com.moread.dto.CategoryDto;
import com.moread.repository.BookRepository;
import com.moread.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categories;
    private final BookRepository books;

    @Transactional(readOnly = true)
    public List<CategoryDto> list() {
        Map<String, Long> counts = new HashMap<>();
        for (Book b : books.findAllByListedTrue()) {
            counts.merge(b.getCategory().getId(), 1L, Long::sum);
        }
        return categories.findAllByOrderBySortAsc().stream()
                .map(c -> toDto(c, counts.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    private CategoryDto toDto(Category c, long count) {
        return new CategoryDto(c.getId(), c.getName(), c.getMark(), c.getDescription(), count);
    }
}
