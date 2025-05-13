package com.example.SEPDrive.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Kunde extends user {



    @OneToMany(cascade = {CascadeType.DETACH})
    @JoinColumn(name = "fav_Driver_Id")
    private List<Fahrer> favDrrivers;

    public Kunde(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password) {
        super(userName, firstName, lastName, email, dateOfBirth, password);
    }

    public Kunde(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password, byte[] profilePhoto) {
        super(userName, firstName, lastName, email, dateOfBirth, password, profilePhoto);
    }

    public Kunde() {

    }


    public List<Fahrer> getFavDrrivers() {
        return favDrrivers;
    }

    public void setFavDrrivers(List<Fahrer> favDrrivers) {
        this.favDrrivers = favDrrivers;
    }
}
