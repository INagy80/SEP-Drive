package com.example.SEPDrive.model;

import jakarta.persistence.*;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name="notification")
public class notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "sender_id")
    private user sender;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "reciever_id")
    private user receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private notificationStatus status = notificationStatus.UNREAD ;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    private String message;

    private String title;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "rideRequest_id" )
    private rideRequest rideRequest;


    public notification(user sender, user receiver, String message, String title, rideRequest rideRequest) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = notificationStatus.UNREAD;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.message = message;
        this.title = title;
        this.rideRequest = rideRequest;

    }
    public notification() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public user getSender() {
        return sender;
    }

    public void setSender(user sender) {
        this.sender = sender;
    }

    public user getReceiver() {
        return receiver;
    }

    public void setReceiver(user receiver) {
        this.receiver = receiver;
    }

    public notificationStatus getStatus() {
        return status;
    }

    public void setStatus(notificationStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public rideRequest getRideRequest() {
        return rideRequest;
    }

    public void setRideRequest(rideRequest rideRequest) {
        this.rideRequest = rideRequest;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
