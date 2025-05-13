package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.adress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface adressDAO extends JpaRepository<adress, Integer> {

}
