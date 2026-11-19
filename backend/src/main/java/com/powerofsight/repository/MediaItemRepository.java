package com.powerofsight.repository;

import com.powerofsight.entity.MediaItem;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaItemRepository extends JpaRepository<MediaItem, UUID> {}
