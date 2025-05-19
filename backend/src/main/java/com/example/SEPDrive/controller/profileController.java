package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.profileService;
import com.example.SEPDrive.service.profileSucheService;
import com.example.SEPDrive.model.user;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.SEPDrive.controller.profileResponseDto;
import com.example.SEPDrive.controller.updateProfileDto;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/profile")
@RequiredArgsConstructor
public class profileController {

    @Autowired
    private profileService profileService;

    @Autowired
    private  profileSucheService profileSucheService;

    @GetMapping("/getmyProfile")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<com.example.SEPDrive.controller.profileResponseDto> getOwnProfile() {
        return ResponseEntity.ok(profileService.getOwnProfile());
    }




    @GetMapping("getmyPhoto")
    public ResponseEntity<String> getPhoto() {

        byte[] photo = profileService.fetchProfilePhoto();

        String Extensions = FilenameUtils.getExtension(profileService.getfilename());
        String encodeBase64 = Base64.getEncoder().encodeToString(photo) ;
        String base64Encoded = "data:image/" + Extensions + ";base64," + encodeBase64;


        if (photo == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return new ResponseEntity<String>(base64Encoded, HttpStatus.OK);
    }





}
