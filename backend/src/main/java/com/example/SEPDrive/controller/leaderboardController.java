package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.leaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leaderboard")
public class leaderboardController {

    @Autowired
    private leaderboardService leaderboardService;

    @GetMapping
    public List<Map<String, Object>> getLeaderboard() {
        return leaderboardService.getLeaderboard();
    }
}
