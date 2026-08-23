package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.AuthResponseDTO;
import com.alxnrocha.vaultledger.dto.LoginRequestDTO;
import com.alxnrocha.vaultledger.dto.LogoutRequestDTO;
import com.alxnrocha.vaultledger.dto.RefreshTokenRequestDTO;
import com.alxnrocha.vaultledger.dto.UserProfileDTO;
import com.alxnrocha.vaultledger.security.CustomUserDetails;
import com.alxnrocha.vaultledger.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Stateless RSA-256 JWT, Redis token rotation & session management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Verifies username/password and issues RSA-256 signed access token and refresh token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful, token pair returned"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials supplied")
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token", description = "Exchanges active refresh token for a newly signed access token and rotated refresh token in the same family.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token rotation successful"),
            @ApiResponse(responseCode = "401", description = "Revoked, reused, or expired refresh token")
    })
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        AuthResponseDTO response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(
            summary = "Get current authenticated user profile",
            description = "Returns active user profile and RBAC role based on validated JWT token.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile retrieved"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid bearer token")
    })
    public ResponseEntity<UserProfileDTO> getCurrentUser(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UserProfileDTO profile = authService.getCurrentUserProfile(userDetails);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Terminate session & blacklist token",
            description = "Blacklists current access token in Redis cache and revokes refresh token family.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logout successful, tokens invalidated")
    })
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) LogoutRequestDTO logoutRequest
    ) {
        authService.logout(authHeader, logoutRequest);
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Session successfully terminated and access token blacklisted"
        ));
    }
}
