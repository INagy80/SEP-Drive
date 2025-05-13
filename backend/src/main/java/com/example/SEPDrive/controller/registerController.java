package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.Kunde;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.service.registerService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class registerController {

    @Autowired
    private registerService registerService;





    @PostMapping(
            "v1/auth/register/kunde"
    )
    public ResponseEntity<Boolean> registerKunde(@RequestBody Kunde user) {
       return ResponseEntity.ok(registerService.register(user));
    }

    @PostMapping(
             "v1/auth/register/fahrer"
    )

    public  ResponseEntity<Boolean> registerFahrer(@RequestBody Fahrer user) {
        return ResponseEntity.ok(registerService.register(user));
    }




}
