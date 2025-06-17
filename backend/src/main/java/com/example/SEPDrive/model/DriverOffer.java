package com.example.SEPDrive.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_offers")
public class DriverOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ride_request_id")
    private rideRequest rideRequest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "driver_id")
    private Fahrer driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OfferStatus status = OfferStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DriverOffer() {}

    public DriverOffer(rideRequest rideRequest, Fahrer driver) {
        this.rideRequest = rideRequest;
        this.driver      = driver;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }


    public rideRequest getRideRequest() {
        return rideRequest;
    }

    public void setRideRequest(rideRequest rideRequest) {
        this.rideRequest = rideRequest;
    }

    public Fahrer getDriver() {
        return driver;
    }

    public void setDriver(Fahrer driver) {
        this.driver = driver;
    }

    public OfferStatus getStatus() {
        return status;
    }

    public void setStatus(OfferStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
