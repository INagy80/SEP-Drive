package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.AuthenticatinResponse;
import com.example.SEPDrive.controller.kundeDTO;
import com.example.SEPDrive.exceptions.requestValidationException;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class loginService {

    @Autowired
    private  userDAO userDao;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private emailSenderService emailSenderService;


    public boolean login(String userName, String password ){
        Authentication authentication = authManager.
                authenticate(new UsernamePasswordAuthenticationToken(userName, password));

        user user = userDao.findByUserName(userName);

        emailSenderService.sendEmail(user.getEmail(), "SEPDrive Verification Code",
                "Hello "+ user.getFirstName()+" "+user.getLastName()+", \n \n" +"Your verification code is:  " + user.getTwoFA() + ". \n \n \n Best regards,\n SEPDrive ");


        return true;
    }


    public AuthenticatinResponse authenticate(String code ,String userName, String password  ){
        Authentication authentication = authManager.
                authenticate(new UsernamePasswordAuthenticationToken(userName, password));

        user user = userDao.findByUserName(userName);

        if(user.getTwoFA() != Integer.parseInt(code)){
            throw new requestValidationException("Wrong verification code");
        }
        user.setTwoFA(new Random().nextInt(900000) + 100000);
        user.setIsemailVerified(true);
        userDao.save(user);
        emailSenderService.sendEmail(user.getEmail(), "SEPDrive", "Hello "+
                user.getFirstName()+" "+
                user.getLastName()+
                ", \n \n" +" successful login at " + DateFormat.getInstance().format(System.currentTimeMillis()) + ". \n \n was it you? if not please please change your password. \n \n \n Best regards,\n SEPDrive ");




        var jwtToken = jwtService.generateToken(userName);
        return AuthenticatinResponse.builder().token(jwtToken).kundeDTO(new kundeDTO(
                user.getId(),
                user.getUserName(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getProfilePhoto()

        )).build();


    }



}
