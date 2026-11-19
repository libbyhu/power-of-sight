package com.powerofsight.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email @Size(max = 254) String email,
        // BCrypt 只會使用前 72 bytes，所以設上限
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 40) String displayName) {}
