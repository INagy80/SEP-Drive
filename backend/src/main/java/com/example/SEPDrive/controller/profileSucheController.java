package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.service.profileSucheService;
import com.example.SEPDrive.service.profileService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/profilesuche")
@RequiredArgsConstructor
public class profileSucheController {

    @Autowired
    private  profileSucheService profileSucheService;

    @Autowired
    private profileService profileService;

    @GetMapping("/username")
    public ResponseEntity<List<profileResponseDto>> searchByUsername(@RequestParam String userName) {
        return ResponseEntity.ok(profileSucheService.searchByUsername(userName));
    }

    @GetMapping("/getOthersPhoto")
    public ResponseEntity<List<String>> getPhoto(@RequestParam String userName) {

        List<byte[]> photos = profileSucheService.fetchAllProfilesPhoto(userName);


        String extension = FilenameUtils.getExtension(profileService.getfilename());

        List<String> dataUris = photos.stream()
                .map(photo -> {
                    if (photo.length > 0) {

                    String b64 = Base64.getEncoder().encodeToString(photo);
                    return "data:image/" + extension + ";base64," + b64;
                    }
                    return null;
                })
                .collect(Collectors.toList());




        return ResponseEntity.ok(dataUris);
    }



    @GetMapping("/getProfileByUsername/{userName}")
    public ResponseEntity<profileResponseDto> getProfileByUsername(@PathVariable String userName ) {
        return ResponseEntity.ok(profileSucheService.getProfileByUsername(userName));
    }



    @GetMapping("/getPhotoByUsername/{userName}")
    public ResponseEntity<String> getPhotoByUsername( @PathVariable String userName) {

        byte[] photo = profileSucheService.fetchProfilePhoto(userName);


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
