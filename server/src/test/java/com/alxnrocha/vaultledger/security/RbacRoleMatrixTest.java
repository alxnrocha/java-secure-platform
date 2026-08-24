package com.alxnrocha.vaultledger.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("RBAC Role Matrix & Security Authorization Test Suite")
class RbacRoleMatrixTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Unauthenticated request to protected endpoints should return 401 Unauthorized")
    void unauthenticatedRequestShouldFail() throws Exception {
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/audit"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/metrics/solvency"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Admin role should have full read access across all financial modules")
    void adminShouldHaveFullAccess() throws Exception {
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/accounts/summary"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/transfers"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/audit"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/audit/verify"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/metrics/solvency"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    @DisplayName("Operator role can read accounts and transactions but cannot access audit endpoints")
    void operatorAccessControl() throws Exception {
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/transfers"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/audit"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "auditor", roles = {"AUDITOR"})
    @DisplayName("Auditor role has read-only access to audit logs and verification")
    void auditorAccessControl() throws Exception {
        mockMvc.perform(get("/api/v1/audit"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/audit/verify"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isOk());
    }
}
