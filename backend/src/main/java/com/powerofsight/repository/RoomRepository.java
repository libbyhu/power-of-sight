package com.powerofsight.repository;

import com.powerofsight.entity.Room;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByOwnerId(UUID ownerId);

    /**
     * 鎖住這間書房的資料列，直到交易結束。
     * 新增收藏時使用，避免同時送出兩筆時拿到相同的排序號碼。
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Room r where r.ownerId = :ownerId")
    Optional<Room> lockByOwnerId(@Param("ownerId") UUID ownerId);
}
