package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.Kunde;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.service.registerService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/auth")
public class registerController {

    @Autowired
    private registerService registerService;





    @PostMapping("/register/kunde")
    public ResponseEntity<Boolean> registerKunde(@RequestBody Kunde user) {
       return ResponseEntity.ok(registerService.register(user));
    }



    @PostMapping("/register/fahrer")
    public  ResponseEntity<Boolean> registerFahrer(@RequestBody Fahrer user) {
        return ResponseEntity.ok(registerService.register(user));
    }







    @PostMapping(
            path     = "/register/kundeWithImage",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?>  addKundeWithImage(@RequestPart("kunde") Kunde kunde, @RequestPart("image") MultipartFile image, @RequestPart("filename") String filename){
        try{
            boolean ok = registerService.addWithImage(kunde, image,filename);
            return new ResponseEntity<>(ok, HttpStatus.CREATED);

        }catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    @PostMapping(
            path     = "/register/fahrerWithImage",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?>  addfahrerWithImage(@RequestPart("fahrer") Fahrer fahrer, @RequestPart("image") MultipartFile image, @RequestPart("filename") String filename){
        try{
            boolean ok = registerService.addWithImage(fahrer, image,filename);
            return new ResponseEntity<>(ok, HttpStatus.CREATED);

        }catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }




    @GetMapping("/users")
    public List<user> getUsers() {
        return registerService.getAllUsers();
    }
}
