package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.statisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/statistics")
public class statisticController {

    @Autowired
    private statisticService statisticService;

    @GetMapping("/distance/{year}/{month}")
    public List<Double> getDailyDistances(@PathVariable int year, @PathVariable int month) {
        return statisticService.calculateDailyDistance(year, month );
    }

    @GetMapping("/duration/{year}/{month}")
    public List<Double> getDailyDurations(@PathVariable int year, @PathVariable int month) {
        return statisticService.calculateDailyRideDuration(year, month);
    }

    @GetMapping("/income/{year}/{month}")
    public List<Double> getDailyEinnahmen(@PathVariable int year, @PathVariable int month) {
        return statisticService.calculateDailyEinnahme(year, month);
    }

    @GetMapping("/rating/{year}/{month}")
    public List<Double> getDailyAverageRatings(@PathVariable int year, @PathVariable int month) {
        return statisticService.calculateDailyAverageRating(year, month);
    }

    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //
    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //
    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //
    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //

    @GetMapping("/distance/{year}")
    public List<Double> getYearlyRideDistance(@PathVariable int year) {
        return statisticService.calculateYearlyDistance(year);
    }

    @GetMapping("/duration/{year}")
    public List<Double> getYearlyRideDuration(@PathVariable int year) {
        return statisticService.calculateYearlyRideDuration(year);
    }
    @GetMapping("/income/{year}")
    public List<Double> getYearlyRideEinnahme(@PathVariable int year) {
        return statisticService.calculateYearlyEinnahme(year);
    }
    @GetMapping("/rating/{year}")
    public List<Double> getYearlyRideRating(@PathVariable int year) {
        return statisticService.calculateYearlyAverageRating(year);
    }




}
