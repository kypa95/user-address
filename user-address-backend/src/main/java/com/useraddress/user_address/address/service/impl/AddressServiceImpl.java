package com.useraddress.user_address.address.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.address.entity.Address;
import com.useraddress.user_address.address.mapper.AddressMapper;
import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.address.service.AddressService;
import com.useraddress.user_address.helper.exception.GeneralException;
import com.useraddress.user_address.user.entity.User;
import com.useraddress.user_address.user.repository.UserRepository;
import com.useraddress.user_address.util.Message;
import com.useraddress.user_address.util.enums.ErrorCode;
import com.useraddress.user_address.util.enums.Models;

import lombok.RequiredArgsConstructor;

/**
 * Default {@link AddressService} implementation.
 *
 * <p>Manages the addresses that belong to a user: every address is created
 * against an existing user, and lookups by user return the rows ordered by
 * creation. Writes run in a transaction; reads are read-only.
 */
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    /**
     * Creates an address for the given user.
     *
     * @param userId  owner of the new address
     * @param request the address data to persist
     * @return the saved address mapped to a response
     * @throws GeneralException with HTTP 404 when the user does not exist
     */
    @Override
    @Transactional
    public AddressResponse create(String userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> userNotExists(userId));

        Address address = addressMapper.toEntity(request, user);
        return addressMapper.toResponse(addressRepository.saveAndFlush(address));
    }

    /**
     * Updates an existing address. Its owner is not changed.
     *
     * @param id      identifier of the address to update
     * @param request the new address data
     * @return the updated address mapped to a response
     * @throws GeneralException with HTTP 404 when the address does not exist
     */
    @Override
    @Transactional
    public AddressResponse update(String id, AddressRequest request) {
        Address address = getAddressOrThrow(id);
        addressMapper.updateEntity(address, request);
        return addressMapper.toResponse(addressRepository.saveAndFlush(address));
    }

    /**
     * Fetches a single address by id.
     *
     * @param id identifier of the address
     * @return the address mapped to a response
     * @throws GeneralException with HTTP 404 when the address does not exist
     */
    @Override
    @Transactional(readOnly = true)
    public AddressResponse findById(String id) {
        return addressMapper.toResponse(getAddressOrThrow(id));
    }

    /**
     * Lists every address of a user, oldest first.
     *
     * @param userId owner whose addresses are listed
     * @return the user's addresses mapped to responses; empty when they have none
     * @throws GeneralException with HTTP 404 when the user does not exist
     */
    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> findByUserId(String userId) {
        if (!userRepository.existsById(userId)) {
            throw userNotExists(userId);
        }
        return addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    /**
     * Deletes an address by id.
     *
     * @param id identifier of the address to delete
     * @throws GeneralException with HTTP 404 when the address does not exist
     */
    @Override
    @Transactional
    public void delete(String id) {
        addressRepository.delete(getAddressOrThrow(id));
    }

    /**
     * Loads an address by id or fails.
     *
     * @param id identifier of the address
     * @return the found address entity
     * @throws GeneralException with HTTP 404 when the address does not exist
     */
    private Address getAddressOrThrow(String id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new GeneralException(
                        Message.formatMessage(Message.OBJECT_WITH_ID_NOT_EXISTS, Models.ADDRESS.getValue(), id),
                        ErrorCode.ADDRESS_NOT_EXISTS.getValue(),
                        HttpStatus.NOT_FOUND));
    }

    /**
     * Builds the standard "user not found" exception.
     *
     * @param userId identifier that was not found
     * @return a {@link GeneralException} carrying HTTP 404 and the user error code
     */
    private GeneralException userNotExists(String userId) {
        return new GeneralException(
                Message.formatMessage(Message.OBJECT_WITH_ID_NOT_EXISTS, Models.USER.getValue(), userId),
                ErrorCode.USER_NOT_EXISTS.getValue(),
                HttpStatus.NOT_FOUND);
    }
}
