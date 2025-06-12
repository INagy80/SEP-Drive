package com.example.SEPDrive.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.micrometer.observation.transport.SenderContext;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Entity
@Table(name="geldKonto")
public class geldKonto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique=true)
    private String kontoNummer;

    @Column(nullable = false)
    private Double balance ;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonManagedReference
    private user owner;

    @OneToMany(
            mappedBy = "receiverAccount",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<transactions> receivedTransactions = new ArrayList<>();


    @OneToMany(
            mappedBy = "senderAccount",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<transactions> sentTransactions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public geldKonto(){}

    public geldKonto(user owner) {
        this.owner = owner;
        this.createdAt = LocalDateTime.now();
        this.balance = 0.0;
    }


    public void loadBalance(Double amount) {
        this.balance += amount;
    }


    public transactions SendMony(geldKonto reciever , Double amount , rideRequest rideRequest ) {
        if(amount > this.balance) {
            throw new IllegalArgumentException("you do not have enough  balance");
        }
        if(reciever != null && rideRequest != null) {
            this.balance -= amount;

           return new transactions(reciever, owner.getGeldKonto(), amount, rideRequest );

        }

        return null;
    }


    public void drawMoney(Double amount) {
        this.balance -= amount;
    }



    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public user getOwner() {
        return owner;
    }

    public void setOwner(user owner) {
        this.owner = owner;
    }

    public List<transactions> getReceivedTransactions() {
        return receivedTransactions;
    }

    public void setReceivedTransactions(List<transactions> receivedTransactions) {
        this.receivedTransactions = receivedTransactions;
    }

    public List<transactions> getSentTransactions() {
        return sentTransactions;
    }

    public void setSentTransactions(List<transactions> sentTransactions) {
        this.sentTransactions = sentTransactions;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PostPersist
    protected void afterPersist() {
        this.kontoNummer =  "SEP "+id+ " " + (new Random().nextInt(9000) + 1000) + " " + (new Random().nextInt(9000) + 1000) ;

    }


    public void addSentTransaction(transactions tx) {
        tx.setSenderAccount(this);
        this.sentTransactions.add(tx);
    }


    public void addReceivedTransaction(transactions tx) {
        tx.setReceiverAccount(this);
        this.receivedTransactions.add(tx);
    }


}
