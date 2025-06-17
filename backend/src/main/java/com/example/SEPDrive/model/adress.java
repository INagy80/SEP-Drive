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
    private String houseNumberAndStreet;




    private String city;

    private String state;

    private String zip;

    private String country;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal Lat;

    @Column(name = "longtude", precision = 10, scale = 7)
    private BigDecimal Lng;



    //constructor
    public adress(  String houseNumber, String city, String state, String zip, String country) {
        this.houseNumberAndStreet = houseNumber;

        this.city = city;
        this.state = state;
        this.zip = zip;
        this.country = country;
    }

    public adress(BigDecimal lat, BigDecimal lng) {
        Lng = lng;
        Lat = lat;
    }

    public adress(String houseNumber, String city, String zip, String country) {
        this.houseNumberAndStreet = houseNumber;

        this.zip = zip;
        this.city = city;
        this.country = country;
    }

    public adress() {

    }


    //Getters and Setters


    public String getHouseNumberAndStreet() {
        return houseNumberAndStreet;
    }

    public void setHouseNumberAndStreet(String houseNumberAndStreet) {
        this.houseNumberAndStreet = houseNumberAndStreet;
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
        return Objects.hash(houseNumberAndStreet, city, state, zip, country);
    }

    @Override
    public String toString() {
        return "address{" +
                "houseNumber='" + houseNumberAndStreet + '\'' +

                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zip='" + zip + '\'' +
                ", country='" + country + '\'' +
                '}';
    }


}


