package com.example.SEPDrive.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class transactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "receiver_account_id", nullable = false)
    private geldKonto receiverAccount;


    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "sender_account_id", nullable = false)
    private geldKonto senderAccount;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ride_request_id")
    private rideRequest rideRequest;

    public transactions( geldKonto receiverAccount, geldKonto senderAccount, Double amount, rideRequest rideRequest) {
        this.receiverAccount = receiverAccount;
        this.senderAccount = senderAccount;
        this.rideRequest = rideRequest;
        this.amount = amount;
        this.createdAt = LocalDateTime.now();;
    }

    public transactions(){}


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public geldKonto getReceiverAccount() {
        return receiverAccount;
    }

    public void setReceiverAccount(geldKonto receiverAccount) {
        this.receiverAccount = receiverAccount;
    }

    public geldKonto getSenderAccount() {
        return senderAccount;
    }

    public void setSenderAccount(geldKonto senderAccount) {
        this.senderAccount = senderAccount;
    }

    public rideRequest getRideRequest() {
        return rideRequest;
    }

    public void setRideRequest(rideRequest rideRequest) {
        this.rideRequest = rideRequest;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }



}
