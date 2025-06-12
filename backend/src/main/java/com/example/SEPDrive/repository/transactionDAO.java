package com.example.SEPDrive.repository;
import com.example.SEPDrive.model.account;
import com.example.SEPDrive.model.transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface transactionDAO extends JpaRepository<transaction, Integer> {
}
