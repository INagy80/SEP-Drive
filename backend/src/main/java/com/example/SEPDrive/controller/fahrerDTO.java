package com.example.SEPDrive.controller;

import java.time.LocalDate;
import com.example.SEPDrive.model.carClass;

public record fahrerDTO(

        Integer id,
        String userName,
        String email,
        String fistName,
        String lastName,
        LocalDate dateOfBirth,
        byte[] profilePhoto,
        carClass carClass
) {}
