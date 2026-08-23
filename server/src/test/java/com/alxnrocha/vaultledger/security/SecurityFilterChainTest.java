package com.alxnrocha.vaultledger.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration Tests — Spring Security 6 Filter Chain & Public/Protected Endpoints")
class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public system info endpoint should be accessible without authentication")
    void testPublicSystemInfoEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/system/info")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPERATIONAL"))
                .andExpect(jsonPath("$.engine").value("Double-Entry Engine v1"));
    }

    @Test
    @DisplayName("Protected endpoint should return 401 Unauthorized when unauthenticated")
    void testProtectedEndpointRejection() throws Exception {
        mockMvc.perform(get("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
