package com.example.SEPDrive.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;

@Entity
public class Kunde extends user {




    public Kunde(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password) {
        super(userName, firstName, lastName, email, dateOfBirth, password);
    }

    public Kunde(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password, byte[] profilePhoto) {
        super(userName, firstName, lastName, email, dateOfBirth, password, profilePhoto);
    }

    public Kunde() {

    }





}
