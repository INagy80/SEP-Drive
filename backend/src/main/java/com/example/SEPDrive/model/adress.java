package com.example.SEPDrive.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
public class adress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    //Attributes
    private String houseNumber;

    private String street;

    private String zip;

    private String city;

    private String state;


    private String country;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal Lat;

    @Column(name = "longtude", precision = 10, scale = 7)
    private BigDecimal Lng;



    //constructor
    public adress( String street, String houseNumber,String zip, String city, String state,  String country) {
        this.houseNumber = houseNumber;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.country = country;
    }

    public adress(BigDecimal lng, BigDecimal lat) {
        Lng = lng;
        Lat = lat;
    }

    public adress(String houseNumber, String street, String zip, String city, String country) {
        this.houseNumber = houseNumber;
        this.street = street;
        this.zip = zip;
        this.city = city;
        this.country = country;
    }

    public adress() {

    }


    //Getters and Setters

    public String getHouseNumber() {
        return houseNumber;
    }

    public void setHouseNumber(String houseNumber) {
        this.houseNumber = houseNumber;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public BigDecimal getLat() {
        return Lat;
    }

    public void setLat(BigDecimal lat) {
        Lat = lat;
    }

    public BigDecimal getLng() {
        return Lng;
    }

    public void setLng(BigDecimal lng) {
        Lng = lng;
    }

    @Override
    public int hashCode() {
        return Objects.hash(houseNumber, street, city, state, zip, country);
    }

    @Override
    public String toString() {
        return "address{" +
                "houseNumber='" + houseNumber + '\'' +
                ", street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zip='" + zip + '\'' +
                ", country='" + country + '\'' +
                '}';
    }


}


