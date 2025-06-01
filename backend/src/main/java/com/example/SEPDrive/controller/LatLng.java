package com.example.SEPDrive.controller;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Embeddable
public class LatLng implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal lng;
    // getters & setters


    public LatLng(BigDecimal lat, BigDecimal lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public LatLng() {
        // no‐arg for Hibernate/JPA
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        LatLng other = (LatLng) o;
        return Objects.equals(lat, other.lat) && Objects.equals(lng, other.lng);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lng);
    }

    @Override
    public String toString() {
        return "LatLng{" +
                "lat=" + lat +
                ", lng=" + lng +
                '}';
    }
}
