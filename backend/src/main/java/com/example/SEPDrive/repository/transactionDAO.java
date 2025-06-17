package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.geldKonto;
import com.example.SEPDrive.model.transactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface transactionDAO extends JpaRepository<transactions, Integer> {
}
