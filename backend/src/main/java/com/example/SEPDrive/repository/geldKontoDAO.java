package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.geldKonto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface geldKontoDAO extends JpaRepository<geldKonto, Integer> {
}
