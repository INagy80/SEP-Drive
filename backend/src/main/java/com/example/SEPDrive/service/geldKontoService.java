package com.example.SEPDrive.service;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.geldKontoDAO;
import com.example.SEPDrive.repository.transactionDAO;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class geldKontoService {

    @Autowired
    private userDAO userDao;

    @Autowired
    private HttpInterpreter httpInterpreter;

    @Autowired
    private geldKontoDAO geldKontoDAO;

    @Autowired
    private transactionDAO transactionDAO;



    public Double getMyBalance() {
        user currentUser = userDao.findUserById(httpInterpreter.Interpreter().getId());
        return currentUser.getGeldKonto().getBalance();

    }


    public Double addBalance(double amount) {
        user currentUser = userDao.findUserById(httpInterpreter.Interpreter().getId());
        currentUser.getGeldKonto().loadBalance(amount);
        userDao.save(currentUser);
        geldKontoDAO.save(currentUser.getGeldKonto());
        return currentUser.getGeldKonto().getBalance();
    }
}
