package com.powerofsight.dto;

import com.powerofsight.entity.LayoutStyle;
import jakarta.validation.constraints.NotNull;

public record UpdateLayoutRequest(@NotNull LayoutStyle layoutStyle) {
}
