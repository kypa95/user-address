package com.useraddress.user_address.user.mapper;

import org.springframework.stereotype.Component;

import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.entity.User;

@Component
public class UserMapper {

    public User toEntity(UserRequest request) {
        return User.builder()
                .name(request.name().trim())
                .lastName(request.lastName().trim())
                .secondLastName(request.secondLastName().trim())
                .curp(request.curp().trim().toUpperCase())
                .rfc(request.rfc().trim().toUpperCase())
                .email(request.email().trim().toLowerCase())
                .phoneNumber(request.phoneNumber().trim())
                .build();
    }

    public void updateEntity(User user, UserRequest request) {
        user.setName(request.name().trim());
        user.setLastName(request.lastName().trim());
        user.setSecondLastName(request.secondLastName().trim());
        user.setCurp(request.curp().trim().toUpperCase());
        user.setRfc(request.rfc().trim().toUpperCase());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhoneNumber(request.phoneNumber().trim());
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getLastName(),
                user.getSecondLastName(),
                user.getCurp(),
                user.getRfc(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
