package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.geldKontoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/geldKonto")
@RequiredArgsConstructor
public class geldKontoController {

    @Autowired
    private geldKontoService service;

    @GetMapping("/getMyBalance")
    public ResponseEntity<Double> getMyBalance() {
        return new ResponseEntity<Double>(service.getMyBalance(), HttpStatus.OK);
    }

    @PutMapping("/addBalance/{amount}")
    public ResponseEntity<Double> addBalance(@PathVariable double amount) {
        return new ResponseEntity<Double>(service.addBalance(amount),HttpStatus.OK);
    }
}
