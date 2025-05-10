package com.example.SEPDrive.Service;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class profileSucheService {

    @Autowired
    private userDAO userDao;

    public List<user> searchByUsername(String username) {
        return List.of(userDao.findByUserName(username)); // exact match
    }

}
