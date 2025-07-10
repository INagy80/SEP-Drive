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

    @PostMapping("/distance")
    public List<Double> getDailyDistances(@RequestBody MonthRequest request) {
        return statisticService.calculateDailyDistance(request.year, request.month );
    }

    @PostMapping("/duration")
    public List<Double> getDailyDurations(@RequestBody MonthRequest request) {
        return statisticService.calculateDailyRideDuration(request.year, request.month);
    }

    @PostMapping("/income")
    public List<Double> getDailyEinnahmen(@RequestBody MonthRequest request) {
        return statisticService.calculateDailyEinnahme(request.year, request.month);
    }

    @PostMapping("/rating")
    public List<Double> getDailyAverageRatings(@RequestBody MonthRequest request) {
        return statisticService.calculateDailyAverageRating(request.year, request.month);
    }

    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //
    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //
    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //
    // Yearly !!!!!!!!!!!!!!!!!!!!!!! //

    @PostMapping("/distance/yearly")
    public List<Double> getYearlyRideDistance(@RequestBody YearRequest request) {
        return statisticService.calculateYearlyDistance(request.year());
    }

    @PostMapping("/duration/yearly")
    public List<Double> getYearlyRideDuration(@RequestBody YearRequest request) {
        return statisticService.calculateYearlyRideDuration(request.year());
    }
    @PostMapping("/einnahme/yearly")
    public List<Double> getYearlyRideEinnahme(@RequestBody YearRequest request) {
        return statisticService.calculateYearlyEinnahme(request.year());
    }
    @PostMapping("/rating/yearly")
    public List<Double> getYearlyRideRating(@RequestBody YearRequest request) {
        return statisticService.calculateYearlyAverageRating(request.year());
    }

    public record StatsRequest(
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {}
    public record MonthRequest(int year, int month) {}
    public record YearRequest(int year) {}

}
