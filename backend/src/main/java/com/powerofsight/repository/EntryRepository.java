package com.powerofsight.repository;

import com.powerofsight.entity.Entry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntryRepository extends JpaRepository<Entry, UUID>, JpaSpecificationExecutor<Entry> {

    /** 一次把作品資料一起撈出來，避免列表每一筆都再查一次（N+1 問題）。 */
    @Override
    @EntityGraph(attributePaths = "media")
    Page<Entry> findAll(Specification<Entry> spec, Pageable pageable);

    /** 查詢時同時比對 id 和擁有者：別人的收藏一律當作「找不到」。 */
    @EntityGraph(attributePaths = "media")
    Optional<Entry> findByIdAndOwnerId(UUID id, UUID ownerId);

    long countByMediaId(UUID mediaId);

    @Query("select coalesce(max(e.displayOrder), 0) from Entry e where e.ownerId = :ownerId")
    long findMaxDisplayOrder(@Param("ownerId") UUID ownerId);

    @Query("select e.media.type, count(e) from Entry e where e.ownerId = :ownerId group by e.media.type")
    List<Object[]> countByType(@Param("ownerId") UUID ownerId);

    @Query("select e.status, count(e) from Entry e where e.ownerId = :ownerId group by e.status")
    List<Object[]> countByStatus(@Param("ownerId") UUID ownerId);
}
