package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.service.loginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class loginController {

    @Autowired
    private loginService loginService;


    public record loginRequest(String userName, String password){
    }


    @PostMapping("v1/auth/login")
    public ResponseEntity<AuthenticatinResponse> login(@RequestBody loginRequest request ) {
       return ResponseEntity.ok(loginService.verify(request.userName(), request.password()));
    }



}
