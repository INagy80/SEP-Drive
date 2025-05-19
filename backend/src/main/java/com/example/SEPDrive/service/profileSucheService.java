package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.fahrerDTO;
import com.example.SEPDrive.controller.profileResponseDto;
import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class profileSucheService {

    @Autowired
    private userDAO userDao;




    public List<profileResponseDto> searchByUsername(String username) {
        List<user> users = userDao.search(username);
        List<profileResponseDto> usersList = new ArrayList<>();
        for (user u : users) {
            if (u instanceof Fahrer) {

             profileResponseDto F = new profileResponseDto(
                    u.getUserName(),
                    u.getFirstName(),
                    u.getLastName(),
                    u.getEmail(),
                    u.getDateOfBirth(),
                    u.getRating(),
                    "Fahrer",
                    u.getTotalRides(),
                    ((Fahrer) u).getCarClass()

             );
                 usersList.add(F);
            }else {
                profileResponseDto K = new profileResponseDto(
                        u.getUserName(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getDateOfBirth(),
                        u.getRating(),
                        "Kunde",
                        u.getTotalRides()
                );
                usersList.add(K);
            }
        }
        return usersList  ;
    }





    public List<byte[]> fetchAllProfilesPhoto(String username) {

        List<user> users = userDao.search(username);

        if (users == null || users.isEmpty()) {
            return new ArrayList<>();
        }
        List<byte[]> photoList = new ArrayList<>();

        for (user u : users) {
            if (u.getProfilePhoto() == null) {
                photoList.add(new byte[0]);
            }
            else {
                photoList.add(u.getProfilePhoto());
            }

        }
        return photoList;
    }



    public profileResponseDto getProfileByUsername(String useName) {
        user currentUser = userDao.findByUserName(useName);
        if (currentUser == null) {
            throw new RuntimeException("User not found!");
        }
        if (currentUser instanceof Fahrer){
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

    public byte[] fetchProfilePhoto(String userName) {
        user currentUser = userDao.findByUserName(userName);
        return currentUser.getProfilePhoto();
    }
}
