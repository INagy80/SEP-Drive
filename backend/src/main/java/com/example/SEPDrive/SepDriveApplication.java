package com.example.SEPDrive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.LocalDate;
import java.time.Month;

@SpringBootApplication
@EnableScheduling
public class SepDriveApplication {

	public static void main(String[] args) {
		SpringApplication.run(SepDriveApplication.class, args);
	}

}
