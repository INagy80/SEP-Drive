package com.example.SEPDrive.Service;

import com.example.SEPDrive.dto.updateProfileDto;
import com.example.SEPDrive.dto.profileResponseDto;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.SEPDrive.exceptions.duplicatResourceException;

@Service
public class profileService {

    @Autowired
    private userDAO userDao;

    public profileResponseDto getOwnProfile() {
        String username = getCurrentUsername();
        user currentUser = userDao.findByUserName(username);

        return new profileResponseDto(
                currentUser.getUserName(),
                currentUser.getFirstName(),
                currentUser.getLastName(),
                currentUser.getEmail(),
                currentUser.getRating(),
                currentUser.getClass().getSimpleName(),
                currentUser.isOnline(),
                currentUser.getTotalRides()
        );
    }

    public profileResponseDto updateProfile(updateProfileDto dto) {
        String username = getCurrentUsername();
        user currentUser = userDao.findByUserName(username);

        if (!currentUser.getEmail().equals(dto.getEmail())
                && userDao.existsUserByEmail(dto.getEmail())) {
            throw new RuntimeException ("This email is already used by another user.");
        }

        currentUser.setFirstName(dto.getFirstName());
        currentUser.setLastName(dto.getLastName());
        currentUser.setEmail(dto.getEmail());
        currentUser.setProfilePhoto(dto.getProfilePhoto());

        userDao.save(currentUser);

        return new profileResponseDto(
                currentUser.getUserName(),
                currentUser.getFirstName(),
                currentUser.getLastName(),
                currentUser.getEmail(),
                currentUser.getRating(),
                currentUser.getClass().getSimpleName(),
                currentUser.isOnline(),
                currentUser.getTotalRides()
        );
    }

    public void updatePassword(String newPassword) {
        String username = getCurrentUsername();
        user currentUser = userDao.findByUserName(username);
        currentUser.setPassword(newPassword); // to be encrypted later
        userDao.save(currentUser);
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    public void updateUserName(String newUserName) {
        String currentUserName = getCurrentUsername();
        user currentUser = userDao.findByUserName(currentUserName);

        if (userDao.existsUserByUserName(newUserName)) {
            throw new DuplicatResourceException("Dieser Benutzername ist bereits vergeben.");
        }

        currentUser.setUserName(newUserName);
        userDao.save(currentUser);
    }

}
