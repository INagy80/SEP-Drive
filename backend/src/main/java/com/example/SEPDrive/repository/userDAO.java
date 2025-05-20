package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.Fahrer;
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

    List<user> findAll();
    user findByEmail(String email);
    user findUserById(Integer userId);

    @Query(value = "SELECT * FROM users WHERE users.username LIKE CONCAT(:name, '%')   ", nativeQuery = true)
    List<user> search(@Param("name") String username);

    @Query(value = "UPDATE users SET profile_photo = :photo WHERE username = :name" ,nativeQuery = true)
    void photo(@Param("photo") byte[] bytes, @Param("name") String username);


}
