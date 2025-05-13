package com.example.SEPDrive.controller;


public class AuthenticatinResponse {
    private String token;

    private kundeDTO kundeDTO;

    private AuthenticatinResponse(Builder builder) {
        this.token = builder.token;
        this.kundeDTO = builder.kundeDTO;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private kundeDTO kundeDTO;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder kundeDTO(kundeDTO kundeDTO) {
            this.kundeDTO = kundeDTO;
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

    public kundeDTO getKundeDTO() {
        return kundeDTO;
    }


}