package com.example.SEPDrive.controller;


import com.example.SEPDrive.service.userService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("v1/user")
public class userController {

    @Autowired
    private userService userService;

    @GetMapping
    public List<kundeDTO> getCustomers() {
        return userService.getAllUsers();
    }

    @GetMapping("{customerId}")
    public kundeDTO getCustomer(
            @PathVariable("customerId") Integer userId) {
        return userService.getCustomer(userId);
    }



    @DeleteMapping("{userId}")
    public void deleteUser(
            @PathVariable("userId") Integer userId) {
        userService.deleteUserById(userId);
    }

    @PutMapping("{userId}")
    public void updateuser(
            @PathVariable("userId") Integer userId,
            @RequestBody userUpdateRequest updateRequest) {
        userService.updateuser(userId, updateRequest);
    }

    @PostMapping(
            value = "{userId}/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public void uploadUserProfileImage(
            @PathVariable("userId") Integer userId,
            @RequestParam("file") MultipartFile file) {
        userService.uploadUserProfileImage(userId, file);
    }

    @GetMapping(
            value = "{userId}/profile-image",
            produces = MediaType.IMAGE_JPEG_VALUE
    )
    public byte[] getUserProfileImage(
            @PathVariable("userId") Integer userId) {
        return userService.getUserProfileImage(userId);
    }
}
