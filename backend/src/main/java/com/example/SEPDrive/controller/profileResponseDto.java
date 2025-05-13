package com.example.SEPDrive.controller;

public class profileResponseDto {
    private String userName;
    private String firstName;
    private String lastName;
    private String email;
    private Double rating;
    private String role;
    private boolean isOnline;
    private int totalRides;

    // Constructor
    public profileResponseDto(String userName, String firstName, String lastName, String email,
                              Double rating, String role, boolean isOnline, int totalRides) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.rating = rating;
        this.role = role;
        this.isOnline = isOnline;
        this.totalRides = totalRides;
    }

    // Getters
    public String getUserName() { return userName; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public Double getRating() { return rating; }
    public String getRole() { return role; }
    public boolean isOnline() { return isOnline; }
    public int getTotalRides() { return totalRides; }
}
