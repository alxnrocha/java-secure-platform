package com.alxnrocha.vaultledger.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class SecurityAnomalyException extends RuntimeException {

    public SecurityAnomalyException(String message) {
        super(message);
    }
}
