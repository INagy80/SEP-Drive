package com.example.SEPDrive.service;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HttpInterpreter {

    @Autowired
    private JWTService jwtService;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private userDAO userDAO;

    public user Interpreter() {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return userDAO.findByUserName(jwtService.extractUserName(token));
    }
}
