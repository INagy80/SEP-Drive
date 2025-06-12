package com.example.SEPDrive.service;

import com.example.SEPDrive.model.account;
import com.example.SEPDrive.model.transaction;
import com.example.SEPDrive.model.transaction.type;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.repository.accountDAO;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.transactionDAO;
import com.example.SEPDrive.repository.userDAO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class accountService {

    private final accountDAO accountDao;
    private final transactionDAO transactionDao;
    private final userDAO userDao;
    private final rideRequestDAO rideRequestDao;

    @Value("${sep.website.username}")
    private String websiteUsername;

    public accountService(accountDAO accountDao, transactionDAO transactionDao, userDAO userDao, rideRequestDAO rideRequestDao) {
        this.accountDao = accountDao;
        this.transactionDao = transactionDao;
        this.userDao = userDao;
        this.rideRequestDao = rideRequestDao;
    }

    @Transactional
    public void loadMoney(Integer userId, BigDecimal amount) {
        user user = userDao.findById(userId).orElseThrow();
        account acc = user.getAccount();
        transaction tx = new transaction(acc, amount, type.DEPOSIT);
        acc.addTransaction(tx);
        accountDao.save(acc);
    }

    @Transactional
    public void transferMoney(Integer fromUserId, Integer toUserId, BigDecimal amount) {
        user fromUser = userDao.findById(fromUserId).orElseThrow();
        user toUser = userDao.findById(toUserId).orElseThrow();

        account fromAcc = fromUser.getAccount();
        account toAcc = toUser.getAccount();

        if (fromAcc.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        transaction withdrawTx = new transaction(fromAcc, amount.negate(), type.TRANSFER_OUT);
        fromAcc.addTransaction(withdrawTx);

        transaction depositTx = new transaction(toAcc, amount, type.TRANSFER_IN);
        toAcc.addTransaction(depositTx);

        accountDao.save(fromAcc);
        accountDao.save(toAcc);
    }

    public BigDecimal getBalance(Integer userId) {
        return userDao.findById(userId)
                .orElseThrow()
                .getAccount()
                .getBalance();
    }

    public List<transaction> getAllTransactions(Integer userId) {
        account acc = userDao.findById(userId)
                .orElseThrow()
                .getAccount();

        return acc.getTransactions();
    }

    @Transactional
    public void holdMoneyForRide(Integer rideRequestId) {
        rideRequest request = rideRequestDao.findById(rideRequestId)
                .orElseThrow(() -> new IllegalArgumentException("RideRequest not found"));

        user customer = request.getCustomer();
        BigDecimal amount = request.getAmount();

        user website = userDao.findByUserName(websiteUsername);
        if (website == null) {
            throw new IllegalStateException("Website account not found");
        }

        account customerAcc = customer.getAccount();
        account websiteAcc = website.getAccount();

        if (customerAcc.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance in customer's account");
        }

        transaction withdrawTx = new transaction(customerAcc, amount.negate(), type.TRANSFER_OUT);
        customerAcc.addTransaction(withdrawTx);

        transaction depositTx = new transaction(websiteAcc, amount, type.TRANSFER_IN);
        websiteAcc.addTransaction(depositTx);

        accountDao.save(customerAcc);
        accountDao.save(websiteAcc);
    }

    @Transactional
    public void releaseMoneyToDriver(Integer rideRequestId) {
        rideRequest request = rideRequestDao.findById(rideRequestId)
                .orElseThrow(() -> new IllegalArgumentException("RideRequest not found"));

        user driver = request.getDriver();
        BigDecimal amount = request.getAmount();

        user website = userDao.findByUserName(websiteUsername);
        if (website == null) {
            throw new IllegalStateException("Website account not found");
        }

        account websiteAcc = website.getAccount();
        account driverAcc = driver.getAccount();

        if (websiteAcc.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance in website account");
        }

        transaction withdrawTx = new transaction(websiteAcc, amount.negate(), type.TRANSFER_OUT);
        websiteAcc.addTransaction(withdrawTx);

        transaction depositTx = new transaction(driverAcc, amount, type.TRANSFER_IN);
        driverAcc.addTransaction(depositTx);

        accountDao.save(websiteAcc);
        accountDao.save(driverAcc);
    }

    @Transactional
    public void refundToCustomer(Integer rideRequestId) {
        rideRequest request = rideRequestDao.findById(rideRequestId)
                .orElseThrow(() -> new IllegalArgumentException("RideRequest not found"));

        user customer = request.getCustomer();
        BigDecimal amount = request.getAmount();

        user website = userDao.findByUserName(websiteUsername);
        if (website == null) {
            throw new IllegalStateException("Website account not found");
        }

        account customerAcc = customer.getAccount();
        account websiteAcc = website.getAccount();

        if (websiteAcc.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Low balance in website account");
        }

        transaction withdrawTx = new transaction(websiteAcc, amount.negate(), type.REFUND_OUT);
        websiteAcc.addTransaction(withdrawTx);

        transaction refundTx = new transaction(customerAcc, amount, type.REFUND_IN);
        customerAcc.addTransaction(refundTx);

        accountDao.save(websiteAcc);
        accountDao.save(customerAcc);
    }
}
