package com.moread.repository;

import com.moread.domain.ReadingEvent;
import com.moread.domain.ReadingEventType;
import com.moread.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReadingEventRepository extends JpaRepository<ReadingEvent, Long> {

    List<ReadingEvent> findByUserAndCreatedAtAfterOrderByCreatedAtAsc(User user, LocalDateTime after);

    List<ReadingEvent> findByCreatedAtAfter(LocalDateTime after);

    long countByUserAndCreatedAtAfter(User user, LocalDateTime after);

    long countByUserAndEventType(User user, ReadingEventType eventType);

    @Query("select coalesce(sum(e.durationSeconds), 0) from ReadingEvent e where e.eventType = :type and e.createdAt >= :from")
    long sumDurationByTypeAfter(@Param("type") ReadingEventType type, @Param("from") LocalDateTime from);

    @Query("select count(distinct e.user.id) from ReadingEvent e where e.eventType = :type and e.createdAt >= :from")
    long countDistinctUsersByTypeAfter(@Param("type") ReadingEventType type, @Param("from") LocalDateTime from);
}
