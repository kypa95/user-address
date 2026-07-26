package com.useraddress.user_address.address.service;

import org.springframework.data.domain.Pageable;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.common.dto.ExportFile;
import com.useraddress.user_address.common.dto.PageResponse;

public interface AddressService {

    AddressResponse create(String userId, AddressRequest request);

    AddressResponse update(String id, AddressRequest request);

    AddressResponse findById(String id);

    PageResponse<AddressResponse> findByUserId(String userId, String search, Pageable pageable);

    ExportFile exportToExcel(String userId, String search);

    void delete(String id);
}
