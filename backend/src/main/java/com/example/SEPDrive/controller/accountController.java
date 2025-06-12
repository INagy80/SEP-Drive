package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.transaction;
import com.example.SEPDrive.service.accountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final accountService accountService;

    public AccountController(accountService accountService) {
        this.accountService = accountService;
    }

    // Load money into user account
    @PostMapping("/load")
    public ResponseEntity<String> loadMoney(@RequestBody LoadRequest request) {
        accountService.loadMoney(request.getUserId(), request.getAmount());
        return ResponseEntity.ok("Money loaded successfully");
    }

    // Transfer money between two users
    @PostMapping("/transfer")
    public ResponseEntity<String> transferMoney(@RequestBody TransferRequest request) {
        accountService.transferMoney(request.getFromUserId(), request.getToUserId(), request.getAmount());
        return ResponseEntity.ok("Transfer completed successfully");
    }

    // Get user account balance
    @GetMapping("/balance/{userId}")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable Integer userId) {
        return ResponseEntity.ok(accountService.getBalance(userId));
    }

    // Get all transactions for a user
    @GetMapping("/transactions/{userId}")
    public ResponseEntity<List<transaction>> getTransactions(@PathVariable Integer userId) {
        return ResponseEntity.ok(accountService.getAllTransactions(userId));
    }

    // Hold money from customer to website (ride start)
    @PostMapping("/hold")
    public ResponseEntity<String> holdMoney(@RequestBody RideRequestId request) {
        accountService.holdMoneyForRide(request.getRideRequestId());
        return ResponseEntity.ok("Money held in website account");
    }

    // Transfer held money to driver (ride completed)
    @PostMapping("/release")
    public ResponseEntity<String> releaseMoney(@RequestBody RideRequestId request) {
        accountService.releaseMoneyToDriver(request.getRideRequestId());
        return ResponseEntity.ok("Money transferred to driver");
    }

    // Refund held money to customer (ride cancelled)
    @PostMapping("/refund")
    public ResponseEntity<String> refundMoney(@RequestBody RideRequestId request) {
        accountService.refundToCustomer(request.getRideRequestId());
        return ResponseEntity.ok("Money refunded to customer");
    }

    // --- DTOs ---
    public static class LoadRequest {
        private Integer userId;
        private BigDecimal amount;

        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    public static class TransferRequest {
        private Integer fromUserId;
        private Integer toUserId;
        private BigDecimal amount;

        public Integer getFromUserId() { return fromUserId; }
        public void setFromUserId(Integer fromUserId) { this.fromUserId = fromUserId; }

        public Integer getToUserId() { return toUserId; }
        public void setToUserId(Integer toUserId) { this.toUserId = toUserId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    public static class RideRequestId {
        private Integer rideRequestId;

        public Integer getRideRequestId() { return rideRequestId; }
        public void setRideRequestId(Integer rideRequestId) { this.rideRequestId = rideRequestId; }
    }
}
