package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.fahrerDTO;
import com.example.SEPDrive.controller.kundeDTO;
import com.example.SEPDrive.controller.userUpdateRequest;
import com.example.SEPDrive.model.Kunde;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class userService {

    @Autowired
    private HttpInterpreter httpInterpreter;

    @Autowired
    private userDAO userDAO;




    public List<kundeDTO> getAllUsers() {
        List<user> kundelist =  userDAO.findAll();
        List<kundeDTO> kundeDTOList = null;
        for(user user : kundelist){
          kundeDTO kunde = new kundeDTO(user.getId(),
                                       user.getUserName(),
                                       user.getEmail(),
                                       user.getFirstName(),
                                       user.getLastName(),
                                       user.getDateOfBirth(),
                                       user.getProfilePhoto());

          kundeDTOList.add(kunde);

        }
        return kundeDTOList;
    }

    public kundeDTO getCustomer(Integer userId) {
        user user = userDAO.findUserById(userId);

        return new kundeDTO(user.getId(),
                           user.getUserName(),
                           user.getEmail(),
                           user.getFirstName(),
                           user.getLastName(),
                           user.getDateOfBirth(),
                           user.getProfilePhoto());
    }

    public void deleteUserById(Integer userId) {
        if(userDAO.findById(userId).isEmpty()){
            throw new IllegalArgumentException("User not found");
        }
        userDAO.deleteById(userId);
    }

    public void updateuser(Integer userId, userUpdateRequest updateRequest) {

    }

    public void uploadUserProfileImage(Integer userId, MultipartFile file) {

    }

    public byte[] getUserProfileImage(Integer userId) {
        return userDAO.findUserById(userId).getProfilePhoto();
    }



}
