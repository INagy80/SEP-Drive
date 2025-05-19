package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.loginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("v1/auth")
public class loginController {

    @Autowired
    private loginService loginService;


    public record loginRequest(String userName, String password){
    }
    public record twoFARequest(String  code,String userName, String password){
    }


    @PostMapping("login")
    public ResponseEntity<Boolean> login(@RequestBody loginRequest request ) {
        Boolean response = loginService.login(request.userName(), request.password());
       return ResponseEntity.ok()
               .body(response);
    }

    @PostMapping("2fa")
    public ResponseEntity<AuthenticatinResponse> twoFactorAuthentication(@RequestBody twoFARequest request) {
        AuthenticatinResponse response = loginService.authenticate(request.code , request.userName, request.password);
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, response.getToken())
                .body(response);

    }

    @PostMapping("login/resetPassword")
    public ResponseEntity<Boolean> resetPassword(@RequestBody String email){
        return new ResponseEntity<>(loginService.resetpassword(email), HttpStatus.OK);
    }





}
