package com.example.SEPDrive.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;

@Entity
public class Fahrer extends user{

    @Enumerated(EnumType.STRING)
    @Column( length = 20)
    private carClass carClass;


    public Fahrer() {

    }

    public Fahrer(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password) {
        super(userName, firstName, lastName, email, dateOfBirth, password);
        this.carClass = null;

    }
    public Fahrer(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password, com.example.SEPDrive.model.carClass carClass) {
        super(userName, firstName, lastName, email, dateOfBirth, password);
        this.carClass = carClass;

    }

    public Fahrer(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password, byte[] profilePhoto) {
        super(userName, firstName, lastName, email, dateOfBirth, password, profilePhoto);
        this.carClass = null;

    }

    public Fahrer(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password, byte[] profilePhoto, com.example.SEPDrive.model.carClass carClass) {
        super(userName, firstName, lastName, email, dateOfBirth, password, profilePhoto);
        this.carClass = carClass;

    }




}

