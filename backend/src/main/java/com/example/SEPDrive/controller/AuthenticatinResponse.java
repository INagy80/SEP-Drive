package com.example.SEPDrive.controller;


public class AuthenticatinResponse {
    private String token;

    private AuthenticatinResponse(Builder builder) {
        this.token = builder.token;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public AuthenticatinResponse build() {
            return new AuthenticatinResponse(this);
        }
    }

    // Getter for token
    public String getToken() {
        return token;
    }
}