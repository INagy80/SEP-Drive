package com.example.SEPDrive.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class requestValidationException extends RuntimeException {

        public requestValidationException(String message) {
            super(message);
        }
}

