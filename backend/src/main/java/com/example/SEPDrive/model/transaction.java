package com.example.SEPDrive.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
public class transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private account account;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private type type;

    public transaction() {}

    public transaction(account acc, BigDecimal amount, type type) {
        this.account = acc;
        this.amount = amount;
        this.type = type;
    }

    public Integer getId() {
        return id;
    }

    public account getAccount() {
        return account;
    }

    public void setAccount(account account) {
        this.account = account;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public type getType() {
        return type;
    }

    public void setType(type type) {
        this.type = type;
    }

    public enum type {
        DEPOSIT,
        TRANSFER_OUT,
        TRANSFER_IN,
        REFUND_OUT,
        REFUND_IN
    }
}
