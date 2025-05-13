package com.example.SEPDrive.controller;

import java.time.LocalDate;

public record kundeDTO(
            Integer id,
            String userName,
            String email,
            String firstName,
            String lastName,
            LocalDate dateOfBirth,
            byte[] profilePhoto
)
{ }
