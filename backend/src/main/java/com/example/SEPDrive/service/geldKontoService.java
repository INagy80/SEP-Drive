package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.notificationDTO;
import com.example.SEPDrive.controller.notificationpersonDTO;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.geldKontoDAO;
import com.example.SEPDrive.repository.notificationDAO;
import com.example.SEPDrive.repository.transactionDAO;
import com.example.SEPDrive.repository.userDAO;
import jakarta.transaction.Transactional;
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

    @Autowired
    private notificationDAO notificationDAO;

    @Autowired
    private notificationService notificationService;



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


    @Transactional
    public void sendMony(geldKonto reciever , Double amount , rideRequest request ){


        user currentUser = userDao.findUserById(httpInterpreter.Interpreter().getId());
        transactions transactions = currentUser.getGeldKonto().SendMony(reciever, amount, request);
        if(transactions != null){
            currentUser.getGeldKonto().addSentTransaction(transactions);
            transactionDAO.save(transactions);
            geldKontoDAO.save(currentUser.getGeldKonto());
        }

        String amountformated = String.format("%.2f", amount);


        var note = new notification(
                null,
                currentUser,
                "your payment was successful. you have paid " + amountformated + "€  to " + reciever.getOwner().getFirstName()+" "+reciever.getOwner().getLastName()+ " for the successfully Completed ride with rideId: " + request.getId()+ " your current balance is " + currentUser.getGeldKonto().getBalance()+". \n   Thank you for Using SEPDrive. ",
                "Payment successful!!",
                request
        );
        notificationDAO.save(note);


        notificationDTO senderDTO = new notificationDTO(
                note.getId(),
                null,
                new notificationpersonDTO(currentUser.getId(), currentUser.getUserName(), currentUser.getEmail(), currentUser.getFirstName(), currentUser.getLastName(), currentUser.getRating(), currentUser.getTotalRides()),
                note.getStatus(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getMessage(),
                note.getTitle(),
                null,
                0,
                request.getId(),
                0.0,
                null


        );




        var note2 = new notification(
                null,
                reciever.getOwner(),
                "you have just recieved: "+ amountformated+"€  from Customer: "+currentUser.getFirstName()+" "+currentUser.getLastName()+" for the Last Completed ride with rideId: "+ request.getId()+". \n    Thank you for Using SEPDrive. ",
                "Payment successful!!",
                request
        );
        notificationDAO.save(note2);


        notificationDTO recieverDTO = new notificationDTO(
                note2.getId(),
                null,
                new notificationpersonDTO(reciever.getOwner().getId(), reciever.getOwner().getUserName(), reciever.getOwner().getEmail(), reciever.getOwner().getFirstName(), reciever.getOwner().getLastName(), reciever.getOwner().getRating(), reciever.getOwner().getTotalRides()),
                note2.getStatus(),
                note2.getCreatedAt(),
                note2.getUpdatedAt(),
                note2.getMessage(),
                note2.getTitle(),
                null,
                0,
                request.getId(),
                0.0,
                null


        );




        notificationService.sendNotification(currentUser.getUserName(), senderDTO);
        notificationService.sendNotification(reciever.getOwner().getUserName(), recieverDTO);



    }

}
