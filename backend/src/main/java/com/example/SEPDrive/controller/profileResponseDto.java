package com.example.SEPDrive.controller;

import java.time.LocalDate;
import java.util.Date;
import com.example.SEPDrive.model.carClass;

public class profileResponseDto {
    private String userName;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate dateOfBirth;
    private Double rating;
    private String role;
    private int totalRides;
    private carClass carClass;
    private byte[] profilePhoto;

    // Constructor

    public profileResponseDto(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, Double rating, String role, int totalRides, com.example.SEPDrive.model.carClass carClass, byte[] profilePhoto) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.rating = rating;
        this.role = role;
        this.totalRides = totalRides;
        this.carClass = carClass;
        this.profilePhoto = profilePhoto;
    }

    public profileResponseDto(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, Double rating, String role, int totalRides, byte[] profilePhoto) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.rating = rating;
        this.role = role;
        this.totalRides = totalRides;
        this.profilePhoto = profilePhoto;
    }

    public profileResponseDto(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, Double rating, String role, int totalRides, com.example.SEPDrive.model.carClass carClass) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.rating = rating;
        this.role = role;
        this.totalRides = totalRides;
        this.carClass = carClass;
    }

    public profileResponseDto(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, Double rating, String role, int totalRides) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.rating = rating;
        this.role = role;
        this.totalRides = totalRides;
    }

    public profileResponseDto() {}

    // Getters
    public String getUserName() { return userName; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public Double getRating() { return rating; }
    public String getRole() { return role; }
    public int getTotalRides() { return totalRides; }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setTotalRides(int totalRides) {
        this.totalRides = totalRides;
    }

    public carClass getCarClass() {
        return carClass;
    }

    public void setCarClass(carClass carClass) {
        this.carClass = carClass;
    }

    public byte[] getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(byte[] profilePhoto) {
        this.profilePhoto = profilePhoto;
    }
}
