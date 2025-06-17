package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.carClass;
import com.example.SEPDrive.model.role;
import jakarta.annotation.Nullable;

import java.time.LocalDate;

public record kundeDTO(
            Integer id,
            String userName,
            String email,
            String firstName,
            String lastName,
            LocalDate dateOfBirth,
            byte[] profilePhoto,
            String dtype,
            String carClass
)
{ }
