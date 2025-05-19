package com.example.SEPDrive.service;


import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.Kunde;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.SEPDrive.controller.profileResponseDto;
import com.example.SEPDrive.controller.updateProfileDto;
import com.example.SEPDrive.exceptions.duplicatResourceException;

import java.util.Arrays;
import java.util.List;

@Service
public class profileService {

    @Autowired
    private userDAO userDao;

    @Autowired
    private HttpInterpreter httpInterpreter;



    public profileResponseDto getOwnProfile() {

        user currentUser = userDao.findUserById(httpInterpreter.Interpreter().getId());

        byte[] raw = currentUser.getProfilePhoto();
        byte[] photoBytes = raw == null ? null : Arrays.copyOf(raw, raw.length);

        if(currentUser instanceof Fahrer) {

            return new profileResponseDto(
                    currentUser.getUserName(),
                    currentUser.getFirstName(),
                    currentUser.getLastName(),
                    currentUser.getEmail(),
                    currentUser.getDateOfBirth(),
                    currentUser.getRating(),
                    "Fahrer",
                     currentUser.getTotalRides(),
                    ((Fahrer) currentUser).getCarClass()

            );
        }

        return new profileResponseDto(
                currentUser.getUserName(),
                currentUser.getFirstName(),
                currentUser.getLastName(),
                currentUser.getEmail(),
                currentUser.getDateOfBirth(),
                currentUser.getRating(),
                "Kunde",
                currentUser.getTotalRides()
        );
    }






//    @Transactional
    public byte[] fetchProfilePhoto() {
        user currentUser = userDao.findUserById(httpInterpreter.Interpreter().getId());

        System.out.println("Profile Photo Length: " + (currentUser.getProfilePhoto() == null ? 0 : currentUser.getProfilePhoto().length));

        return currentUser.getProfilePhoto();

    }

    public String getfilename() {
        user currentUser = userDao.findUserById(httpInterpreter.Interpreter().getId());
        return currentUser.getImageName();
    }


}
