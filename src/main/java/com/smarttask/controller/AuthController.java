
package com.smarttask.controller;

import com.smarttask.entity.AppUser;
import com.smarttask.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record AuthResponse(
            Long id,
            String name,
            String email,
            String message
    ) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            AppUser user = authService.register(
                    request.name(),
                    request.email(),
                    request.password()
            );

            AuthResponse response = new AuthResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    "Account registered successfully."
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", ex.getMessage()));
        }
    }
}
