package com.useraddress.user_address.address.service;

import java.util.List;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;

public interface AddressService {

    AddressResponse create(String userId, AddressRequest request);

    AddressResponse update(String id, AddressRequest request);

    AddressResponse findById(String id);

    List<AddressResponse> findByUserId(String userId);

    void delete(String id);
}
