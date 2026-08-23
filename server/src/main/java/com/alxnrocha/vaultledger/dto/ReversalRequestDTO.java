package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request to trigger an accounting reversal of an existing posted transaction")
public record ReversalRequestDTO(
        @NotBlank(message = "Reversal reason is mandatory for regulatory audit compliance")
        @Size(min = 5, max = 255, message = "Reason must be between 5 and 255 characters")
        @Schema(description = "Forensic justification for transaction rollback", example = "Erroneous duplicate payment batch settlement")
        String reason
) {}
