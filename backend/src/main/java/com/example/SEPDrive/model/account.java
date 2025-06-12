package com.example.SEPDrive.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
public class account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(mappedBy = "account")
    private user user;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<transaction> transactions = new ArrayList<>();


    @Column(nullable = false, unique = true)
    @Enumerated(EnumType.STRING)
    private AccountType type;

    public void setType(AccountType type) {
        this.type = type;
    }

    public AccountType getType() {
        return type;
    }

    public enum AccountType { USER,SEP_WALLET }


    public void addTransaction(transaction tx) {
        transactions.add(tx);
        tx.setAccount(this);
    }

    public BigDecimal getBalance() {
        return transactions.stream()
                .map(transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<transaction> getTransactions() {
        return transactions;
    }

    public Integer getId() {
        return id;
    }

    public user getUser() {
        return user;
    }

    public void setUser(user user) {
        this.user = user;
    }
}