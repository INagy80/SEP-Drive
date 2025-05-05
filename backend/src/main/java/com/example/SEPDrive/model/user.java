package com.example.SEPDrive.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Objects;


@Entity
@Table(name="users")
public abstract class user {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Column(name = "username", nullable = false, unique = true, length = 50)
    @NotBlank
    private String userName;


    @Column(name = "first_name", nullable = false, length = 50)
    @NotBlank
    private String  firstName;


    @Column(name = "last_name", nullable = false, length = 50)
    @NotBlank
    private String lastName;


    @Column(nullable = false, unique = true, length = 100)
    @Email
    private String email;


    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false, length = 20)
//    private role role;

    @Column(nullable = false)
    @Size(min = 8)
    private String Password;


    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "profile_photo")
    private byte[] profilePhoto;


    @Min(0)
    @Max(5)
    private Double Rating;


    private int numberOfRates;


    private int totalRides;



    //constructor
    public user (){}

    public user(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        Password = password;
        Rating = 0.0;
        numberOfRates = 0;
        totalRides = 0;
    }

    public user(String userName, String firstName, String lastName, String email, LocalDate dateOfBirth, String password, byte[] profilePhoto) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        Password = password;
        this.profilePhoto = profilePhoto;
        Rating = 0.0;
        numberOfRates = 0;
        totalRides = 0;
    }


    //getters and setters


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
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



    public String getPassword() {
        return Password;
    }

    public void setPassword(String password) {
        Password = password;
    }

    public byte[] getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(byte[] profilePhoto) {
        this.profilePhoto = profilePhoto;
    }


    public Double getRating() {
        return Rating;
    }

    public void setRating(Double rating) {
        numberOfRates += 1 ;
        Rating = (Rating + rating) / numberOfRates;

    }

    public int getTotalRides() {
        return totalRides;
    }

    public void setTotalRides() {
        this.totalRides += 1 ;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        user user = (user) o;
        return Objects.equals(id, user.id) && Objects.equals(userName, user.userName) && Objects.equals(firstName, user.firstName) && Objects.equals(lastName, user.lastName) && Objects.equals(email, user.email) && Objects.equals(dateOfBirth, user.dateOfBirth) && Objects.equals(Password, user.Password) && Objects.deepEquals(profilePhoto, user.profilePhoto);
    }



    @Override
    public int hashCode() {
        return Objects.hash(id, userName, firstName, lastName, email, dateOfBirth, Password, Arrays.hashCode(profilePhoto));
    }



    @Override
    public String toString() {
        return "user{" +
                "id=" + id +
                ", userName='" + userName + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", Password='" + Password + '\'' +
                ", profilePhoto=" + Arrays.toString(profilePhoto) +
                '}';
    }
}
