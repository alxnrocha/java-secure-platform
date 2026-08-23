package com.alxnrocha.vaultledger.dto;

import java.time.Instant;
import java.util.UUID;

public record TokenPair(
        String accessToken,
        String refreshToken,
        UUID familyId,
        Instant expiresAt
) {}
