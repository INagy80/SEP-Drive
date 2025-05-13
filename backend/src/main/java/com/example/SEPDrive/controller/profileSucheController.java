package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.service.profileSucheService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/profilesuche")
@RequiredArgsConstructor
public class profileSucheController {

    @Autowired
    private  profileSucheService profileSucheService;

    @GetMapping("/username")
    public ResponseEntity<List<user>> searchByUsername(@RequestParam String userName) {
        return ResponseEntity.ok(profileSucheService.searchByUsername(userName));
    }
}
