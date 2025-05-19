package com.example.SEPDrive;

import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.boot.CommandLineRunner;
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

	@Bean
	CommandLineRunner CM (userDAO userDAO) {

		return args -> {

			//user Ib = new user("INagy","Ibrahim", "Sayed", "I.nagy80@yahoo.com", LocalDate.of(2001, Month.JUNE,13) , role.KUNDE, "123456789");

			Kunde bs = new Kunde("INagy80","Ibrahim", "Sayed", "I.nagy81@yahoo.com", LocalDate.of(2001, Month.JUNE,13), "123456789");
			//userDAO.save(bs);
			Fahrer ar = new Fahrer("INagy81","Ibrahim", "Sayed", "I.nagy82@yahoo.com", LocalDate.of(2001, Month.JUNE,13), "123456789", carClass.Medium);
			//userDAO.save(ar);
		};

	}
}
