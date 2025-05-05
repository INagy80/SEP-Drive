package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.AuthenticatinResponse;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

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


    public AuthenticatinResponse verify(String userName, String password) {
        Authentication authentication = authManager.
                authenticate(new UsernamePasswordAuthenticationToken(userName, password));

        user user = userDao.findByUserName(userName);

        //the 2FA would be implemented later
//        Integer FA2 = new Random().nextInt(900000) + 100000;
//        emailSenderService.sendEmail(user.getEmail(), "SEPDrive Verification Code", "Your verification code is: " + FA2);

        var jwtToken = jwtService.generateToken(userName);
        return AuthenticatinResponse.builder().token(jwtToken).build();

    }
}
