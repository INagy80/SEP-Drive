package com.example.SEPDrive.Controller;

import com.example.SEPDrive.dto.updateProfileDto;
import com.example.SEPDrive.dto.profileResponseDto;
import com.example.SEPDrive.service.profileService;
import com.example.SEPDrive.service.profileSucheService;
import com.example.SEPDrive.model.user;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/v1/profile")
@RequiredArgsConstructor
public class profileController {

    @Autowired
    private final profileService profileService;

    @Autowired
    private final profileSucheService profileSucheService;

    @GetMapping("/me")
    public ResponseEntity<profileResponseDto> getOwnProfile() {
        return ResponseEntity.ok(profileService.getOwnProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<profileResponseDto> updateProfile(@RequestBody updateProfileDto dto) {
        return ResponseEntity.ok(profileService.updateProfile(dto));
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> updatePassword(@RequestBody String newPassword) {
        profileService.updatePassword(newPassword);
        return ResponseEntity.ok("Password updated successfully.");
    }

    @GetMapping("/search")
    public ResponseEntity<List<user>> searchUsers(
            @RequestParam(required = false) String userName,
    ) {
        if (userName != null) return ResponseEntity.ok(profileSucheService.searchByUsername(userName));
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/me/username")
    public ResponseEntity<String> updateUsername(@RequestBody String newUserName) {
        profileService.updateUserName(newUserName);
        return ResponseEntity.ok("Benutzername wurde erfolgreich geändert.");
    }

}
