package com.example.SEPDrive.controller;

import java.math.BigDecimal;

public class LatLng {
    private BigDecimal lat;
    private BigDecimal lng;
    // getters & setters


    public LatLng(BigDecimal lat, BigDecimal lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public BigDecimal getLat() {
        return lat;
    }

    public void setLat(BigDecimal lat) {
        this.lat = lat;
    }

    public BigDecimal getLng() {
        return lng;
    }

    public void setLng(BigDecimal lng) {
        this.lng = lng;
    }
}