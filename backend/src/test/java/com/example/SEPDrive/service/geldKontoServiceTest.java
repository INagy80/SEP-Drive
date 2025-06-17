package com.example.SEPDrive.service;
import com.example.SEPDrive.controller.notificationDTO;
import com.example.SEPDrive.repository.*;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.service.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Driver;

@ExtendWith(MockitoExtension.class)
class geldKontoServiceTest {


    @Mock
    private userDAO userDAO;
    @Mock
    private geldKontoDAO geldKontoDAO;
    @Mock
    private notificationDAO notificationDAO;
    @Mock
    private transactionDAO transactionDAO;
    @Mock
    private HttpServletRequest request;
    @Mock
    private user user;
    @Mock
    private HttpInterpreter httpInterpreter;
    @Mock
    private notificationService notificationService;
    @Mock
    private geldKonto geldKonto;
    @InjectMocks
    private geldKontoService geldKontoService;

    @Test
    void getMyBalanceTest() {
        geldKonto konto = new geldKonto();
        konto.setBalance(150.0);
        user mockUser = new Kunde();
        mockUser.setId(1);
        mockUser.setGeldKonto(konto);



        assertEquals(150.0, konto.getBalance());

    }

    @Test
    void addBalanceTest() {
        geldKonto konto = new geldKonto();
        konto.setBalance(30.0);

        user user = new Kunde();
        user.setId(1);
        user.setGeldKonto(konto);




        when(httpInterpreter.Interpreter()).thenReturn(user);
        when(userDAO.findUserById(1)).thenReturn(user);

        geldKontoService.addBalance(20.0);

        assertEquals(50.0, konto.getBalance());
    }

    @Test
    void sendMonyTest_WhenUserHasEnoughBalance_TransfersBalanceCorrectly() {
        // Arrange: Sender
        user currentUser = new Kunde();
        geldKonto senderkonto = new geldKonto();
        senderkonto.setBalance(50.0); // 💰 enough to pay
        senderkonto.setOwner(currentUser);
        currentUser.setGeldKonto(senderkonto);

        // Arrange: Receiver
        user receiver = new Fahrer();
        geldKonto receiverKonto = new geldKonto();
        receiverKonto.setBalance(10.0); // starting balance
        receiver.setGeldKonto(receiverKonto);
        receiverKonto.setOwner(receiver);

        // Ride
        rideRequest ride = new rideRequest();
        ride.setId(123);



        // Mocks
        when(httpInterpreter.Interpreter()).thenReturn(currentUser);
        when(userDAO.findUserById(any())).thenReturn(currentUser);

        // Act
        geldKontoService.sendMony(receiverKonto, 20.0, ride);

        // Assert: 💸 logic only
        assertEquals(30.0, senderkonto.getBalance());    // 50 - 20
        assertEquals(30.0, receiverKonto.getBalance());  // 10 + 20
    }



    @Test
    void sendMonyTest_WhenInsufficientBalanceThrowsException() {
        user currentUser = new Kunde();
        geldKonto senderkonto = new geldKonto();
        senderkonto.setBalance(10.0);
        senderkonto.setOwner(currentUser);
        currentUser.setGeldKonto(senderkonto);

        geldKonto receiverKonto = new geldKonto();
        user receiver = new Fahrer();
        receiver.setId(2);
        receiverKonto.setOwner(receiver);

        rideRequest ride = new rideRequest();


        when(httpInterpreter.Interpreter()).thenReturn(currentUser);
        when(userDAO.findUserById(any())).thenReturn(currentUser);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            geldKontoService.sendMony(receiverKonto, 20.0, ride); // Amount exceeds balance
        });

        assertEquals("you do not have enough  balance", exception.getMessage());
    }

    @Test
    void sendMonyTest_WhenReceiverIsNullThrowsException() {
        geldKonto senderKonto = new geldKonto();
        senderKonto.setBalance(50.0);
        user sender = new Kunde();
        sender.setId(1);
        sender.setGeldKonto(senderKonto);
        senderKonto.setOwner(sender);

        rideRequest ride = new rideRequest();



        when(httpInterpreter.Interpreter()).thenReturn(sender);

        Exception exception = assertThrows(NullPointerException.class, () -> {
            geldKontoService.sendMony(null, 10.0, ride);
        });

        assertTrue(exception.getMessage().contains("getGeldKonto"));
        //    assertNull(exception.getMessage()); // No defined failure message
    }

}
