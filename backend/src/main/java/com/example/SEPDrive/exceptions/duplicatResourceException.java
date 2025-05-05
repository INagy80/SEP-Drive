package com.example.SEPDrive.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class duplicatResourceException extends RuntimeException {

    public duplicatResourceException(String message) {
        super(message);
    }
}
