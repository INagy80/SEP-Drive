package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.statisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class statisticController {

    @Autowired
    private statisticService statisticService;

    @GetMapping("/distance")
    public List<Double> getDailyDistances(
            @RequestParam String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return statisticService.calculateDailyDistance(start, end, username);
    }

    @GetMapping("/duration")
    public List<Integer> getDailyDurations(
            @RequestParam String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return statisticService.calculateDailyRideDuration(start, end, username);
    }

    @GetMapping("/income")
    public List<Double> getDailyEinnahmen(
            @RequestParam String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return statisticService.calculateDailyEinnahme(start, end, username);
    }

    @GetMapping("/rating")
    public List<Double> getDailyAverageRatings(
            @RequestParam String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return statisticService.calculateDailyAverageRating(start, end, username);
    }
}
