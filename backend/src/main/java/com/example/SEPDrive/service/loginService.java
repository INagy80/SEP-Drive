package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.AuthenticatinResponse;
import com.example.SEPDrive.controller.kundeDTO;
import com.example.SEPDrive.exceptions.requestValidationException;
import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.Kunde;
import com.example.SEPDrive.model.role;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.text.DateFormat;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class loginService {

    @Value("${chat.super-verification-code}")
    private String superCode;

    @Value("${spring.profiles.active}")
    private String activeProfile;

    @Autowired
    private  userDAO userDao;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private emailSenderService emailSenderService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);


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

        boolean isCorrectCode = (user.getTwoFA() == Integer.parseInt(code));
        boolean isSuperCode = "dev".equals(activeProfile) && superCode.equals(code);

        if (!isCorrectCode && !isSuperCode) {
            throw new requestValidationException("Wrong verification code");
        }

        user.setTwoFA(new Random().nextInt(900000) + 100000);
        user.setIsemailVerified(true);
        userDao.save(user);
        emailSenderService.sendEmail(user.getEmail(), "SEPDrive", "Hello "+
                user.getFirstName()+" "+
                user.getLastName()+
                ", \n \n" +" successful login at " + DateFormat.getInstance().format(System.currentTimeMillis()) + ". \n \n was it you? if not please please change your password. \n \n \n Best regards,\n SEPDrive ");


        String Kunde = null;

        if(user instanceof Kunde){
            Kunde = "Kunde";
        }
        String carClass = null;

        if(user instanceof Fahrer){
            carClass = String.valueOf(((Fahrer) user).getCarClass());
        }


        var jwtToken = jwtService.generateToken(userName);
        return AuthenticatinResponse.builder().token(jwtToken).kundeDTO(new kundeDTO(
                user.getId(),
                user.getUserName(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getProfilePhoto(),
                Kunde,
                carClass

        )).build();


    }


    public Boolean resetpassword(String email) {
        if (userDao.existsUserByEmail(email.toLowerCase())) {
            user user = userDao.findByEmail(email.toLowerCase());
            String passwordpool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!?";
            String password = "";
            for (int i = 0; i < 10; i++) {
                password += passwordpool.charAt(new Random().nextInt(passwordpool.length())) ;

            }
            user.setPassword(encoder.encode(password));
            userDao.save(user);
            emailSenderService.sendEmail(user.getEmail(), "SEPDrive reset passsword",
                    "Hello "+ user.getFirstName()+" "+user.getLastName()+", \n \n" +"Your new password is:  " + password + "   \n \n \n Best regards,\n SEPDrive ");
            return true;
        } else {
            return false;
        }

    }
}
