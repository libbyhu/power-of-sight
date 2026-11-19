package com.powerofsight.controller;

import com.powerofsight.dto.RoomResponse;
import com.powerofsight.dto.RoomStatsResponse;
import com.powerofsight.dto.UpdateLayoutRequest;
import com.powerofsight.dto.UpdateRoomRequest;
import com.powerofsight.security.CurrentUser;
import com.powerofsight.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/room")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public RoomResponse get(@AuthenticationPrincipal Jwt jwt) {
        return roomService.get(CurrentUser.id(jwt));
    }

    @PutMapping
    public RoomResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateRoomRequest request) {
        return roomService.update(CurrentUser.id(jwt), request);
    }

    @PutMapping("/layout")
    public RoomResponse updateLayout(@AuthenticationPrincipal Jwt jwt,
                                     @Valid @RequestBody UpdateLayoutRequest request) {
        return roomService.updateLayout(CurrentUser.id(jwt), request);
    }

    @GetMapping("/stats")
    public RoomStatsResponse stats(@AuthenticationPrincipal Jwt jwt) {
        return roomService.stats(CurrentUser.id(jwt));
    }
}
