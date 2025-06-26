package com.example.SEPDrive.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Builder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;


@Entity
@Table(name="users")
public abstract class user {

    private static final int LAST_ACTIVATE_INTERVAL = 5;

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
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false, length = 20)
//    private role role;

    @Column(nullable = false)
    @Size(min = 8)
    private String Password;


    @Lob
    @Basic(fetch = FetchType.EAGER)
    @Column(name = "profile_photo", columnDefinition = "BYTEA")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] profilePhoto;

    private String imageName;

    @Column(name = "TwoFA", length = 6 )
    private Integer TwoFA;


    @Min(0)
    @Max(5)
    private Double Rating;


    private int numberOfRates;


    private int totalRides;



    @Column(name = "is_email_verified", nullable = false)
    private Boolean isemailVerified;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "bank_account_id" )
    @JsonBackReference
    private geldKonto geldKonto ;

    @OneToMany(mappedBy = "sender")
    private List<Chat> chatsAsSender;

    @OneToMany(mappedBy = "recipient")
    private List<Chat> chatsAsRecipient;

    private LocalDateTime lastSeen;



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
        isemailVerified= false;
        geldKonto = new geldKonto(this);

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
        isemailVerified= false;
        geldKonto = new geldKonto(this);
    }


    //getters and setters


    public List<Chat> getChatsAsSender() {
        return chatsAsSender;
    }

    public void setChatsAsSender(List<Chat> chatsAsSender) {
        this.chatsAsSender = chatsAsSender;
    }

    public List<Chat> getChatsAsRecipient() {
        return chatsAsRecipient;
    }

    public void setChatsAsRecipient(List<Chat> chatsAsRecipient) {
        this.chatsAsRecipient = chatsAsRecipient;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public boolean isIsemailVerified() {
        return isemailVerified;
    }

    public void setIsemailVerified(boolean isemailVerified) {
        this.isemailVerified = isemailVerified;
    }

    public Integer getTwoFA() {
        return TwoFA;
    }

    public void setTwoFA(Integer twoFA) {
        TwoFA = twoFA;
    }

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

    public geldKonto getGeldKonto() {
        return geldKonto;
    }

    public void setGeldKonto(geldKonto geldKonto) {
        this.geldKonto = geldKonto;
    }

//    public void setRating(Double rating) {
//        numberOfRates += 1 ;
//        Rating = (Rating + rating) / numberOfRates;
//
//    }



    public void setNumberOfRates(int numberOfRates) {
        this.numberOfRates = numberOfRates;
    }

    public void setRating(Double rating) {
        Rating = rating;
    }

    public void setIsemailVerified(Boolean isemailVerified) {
        this.isemailVerified = isemailVerified;
    }

    public int getNumberOfRates() {
        return numberOfRates;
    }

    public Boolean getIsemailVerified() {
        return isemailVerified;
    }

    public void setTotalRides(int totalRides) {
        this.totalRides = totalRides;
    }






    public int getTotalRides() {
        return totalRides;
    }

    public void setTotalRides() {
        this.totalRides += 1 ;
    }



    @Transient
    public boolean isUserOnline() {
        return lastSeen != null && lastSeen.isAfter(LocalDateTime.now().minusMinutes(LAST_ACTIVATE_INTERVAL));
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
