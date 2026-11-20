package com.powerofsight.controller;

import com.powerofsight.dto.EntryRequest;
import com.powerofsight.dto.EntryResponse;
import com.powerofsight.dto.PageResponse;
import com.powerofsight.entity.EntryStatus;
import com.powerofsight.entity.MediaType;
import com.powerofsight.security.CurrentUser;
import com.powerofsight.service.EntryService;
import com.powerofsight.service.EntryService.ListSort;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/entries")
@Validated
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    /** 例：GET /api/me/entries?type=BOOK&status=WANT&q=村上&sort=TITLE&page=0&size=24 */
    @GetMapping
    public PageResponse<EntryResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) MediaType type,
            @RequestParam(required = false) EntryStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "RECENT") ListSort sort,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "24") @Min(1) @Max(100) int size) {
        return entryService.list(CurrentUser.id(jwt), type, status, q, sort, page, size);
    }

    @GetMapping("/{id}")
    public EntryResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return entryService.get(CurrentUser.id(jwt), id);
    }

    @PostMapping
    public ResponseEntity<EntryResponse> create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody EntryRequest request) {
        EntryResponse created = entryService.create(CurrentUser.id(jwt), request);
        return ResponseEntity.created(URI.create("/api/me/entries/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public EntryResponse update(
            @AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody EntryRequest request) {
        return entryService.update(CurrentUser.id(jwt), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        entryService.delete(CurrentUser.id(jwt), id);
        return ResponseEntity.noContent().build();
    }
}
