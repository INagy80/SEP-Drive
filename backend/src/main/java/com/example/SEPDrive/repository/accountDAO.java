package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.account;
import com.example.SEPDrive.model.transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface accountDAO extends JpaRepository<account, Integer> {
    Optional<account> findByType(account.AccountType type);

}