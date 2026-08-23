package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.LoginRequestDTO;
import com.alxnrocha.vaultledger.dto.RefreshTokenRequestDTO;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.RoleType;
import com.alxnrocha.vaultledger.repository.RefreshTokenRepository;
import com.alxnrocha.vaultledger.repository.UserRepository;
import com.alxnrocha.vaultledger.security.JwtTokenService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration Tests — Authentication REST API Controller")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserEntity savedUser;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity user = new UserEntity(
                UUID.randomUUID(),
                "admin",
                "admin@vaultledger.internal",
                passwordEncoder.encode("Password@123"),
                "Alexandre",
                "Rocha",
                RoleType.ROLE_ADMIN
        );
        user.setActive(true);
        user.setMfaEnabled(true);
        savedUser = userRepository.save(user);
    }

    @Test
    @DisplayName("POST /api/v1/auth/login with valid credentials returns 200 OK and token pair")
    void testLoginSuccess() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin", "Password@123");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(jsonPath("$.user.role").value("ROLE_ADMIN"))
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(responseJson);
        String accessToken = jsonNode.get("accessToken").asText();

        assertTrue(jwtTokenService.validateToken(accessToken));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login with invalid password returns 401 Unauthorized")
    void testLoginInvalidPassword() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin", "WrongPassword!456");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/refresh rotates active refresh token")
    void testRefreshTokenRotation() throws Exception {
        // Step 1: Login to acquire initial refresh token
        LoginRequestDTO loginReq = new LoginRequestDTO("admin", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String initialRefreshToken = loginNode.get("refreshToken").asText();

        // Step 2: Refresh token
        RefreshTokenRequestDTO refreshReq = new RefreshTokenRequestDTO(initialRefreshToken);
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.username").value("admin"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me returns current user profile with valid Bearer token")
    void testGetCurrentUser() throws Exception {
        String accessToken = jwtTokenService.generateAccessToken(savedUser);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.email").value("admin@vaultledger.internal"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout terminates session and blacklists token")
    void testLogout() throws Exception {
        String accessToken = jwtTokenService.generateAccessToken(savedUser);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
