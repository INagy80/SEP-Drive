package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.user;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface userDAO extends JpaRepository<user, Integer> {

    boolean existsUserByEmail(String email);

    boolean existsUserByUserName(String username);

    user findByUserName(String username);


}
