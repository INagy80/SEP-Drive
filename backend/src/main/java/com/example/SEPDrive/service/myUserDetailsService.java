package com.example.SEPDrive.service;

import com.example.SEPDrive.exceptions.userNotFoundException;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.model.userPrinciple;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class myUserDetailsService implements UserDetailsService {



    @Autowired
    private userDAO userDAO;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
       user user = userDAO.findByUserName(username);

       if(user == null) {
           throw new userNotFoundException("User not found");
       }

        return new userPrinciple(user);
    }
}
