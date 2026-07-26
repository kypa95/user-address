package com.useraddress.user_address.user.service;

import org.springframework.data.domain.Pageable;

import com.useraddress.user_address.common.dto.PageResponse;
import com.useraddress.user_address.user.dto.UserFilter;
import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.dto.UserResponse;

public interface UserService {

    UserResponse create(UserRequest request);

    UserResponse update(String id, UserRequest request);

    UserResponse findById(String id);

    PageResponse<UserResponse> findAll(UserFilter filter, Pageable pageable);

    byte[] exportToExcel(UserFilter filter);

    void delete(String id);
}
