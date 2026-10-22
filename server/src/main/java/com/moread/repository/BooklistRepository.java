package com.moread.repository;

import com.moread.domain.Booklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BooklistRepository extends JpaRepository<Booklist, String> {

    List<Booklist> findAllByOrderBySortAsc();
}
