package com.useraddress.user_address.user.service.impl;

import java.io.IOException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.useraddress.user_address.address.mapper.AddressMapper;
import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.common.dto.PageResponse;
import com.useraddress.user_address.helper.exception.GeneralException;
import com.useraddress.user_address.user.dto.UserFilter;
import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.entity.User;
import com.useraddress.user_address.user.export.UserExcelExporter;
import com.useraddress.user_address.user.mapper.UserMapper;
import com.useraddress.user_address.user.repository.UserRepository;
import com.useraddress.user_address.user.repository.UserSpecifications;
import com.useraddress.user_address.user.service.UserService;
import com.useraddress.user_address.util.Message;
import com.useraddress.user_address.util.enums.ErrorCode;
import com.useraddress.user_address.util.enums.Models;

import lombok.RequiredArgsConstructor;

/**
 * Default {@link UserService} implementation.
 *
 * <p>Handles user CRUD, enforcing that CURP, RFC and email stay unique across
 * the table, and cascades the removal of a user's addresses on delete. Every
 * write runs inside a transaction; reads are marked read-only.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final UserExcelExporter userExcelExporter;

    /**
     * Creates a new user, together with the addresses it carries, in one
     * transaction: if any address is rejected the whole registration rolls back,
     * so a user is never left half created.
     *
     * @param request the user data, optionally with a list of addresses
     * @return the saved user mapped to a response
     * @throws GeneralException with HTTP 409 when CURP, RFC or email is already taken
     */
    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        validateUniqueness(request, null);
        User user = userMapper.toEntity(request);

        if (request.addresses() != null) {
            request.addresses().forEach(
                    address -> user.getAddresses().add(addressMapper.toEntity(address, user)));
        }

        return userMapper.toResponse(userRepository.saveAndFlush(user));
    }

    /**
     * Updates an existing user, re-checking uniqueness while ignoring its own row.
     *
     * @param id      identifier of the user to update
     * @param request the new user data
     * @return the updated user mapped to a response
     * @throws GeneralException with HTTP 404 when the user does not exist,
     *                          or HTTP 409 when CURP, RFC or email belongs to another user
     */
    @Override
    @Transactional
    public UserResponse update(String id, UserRequest request) {
        User user = getUserOrThrow(id);
        validateUniqueness(request, id);
        userMapper.updateEntity(user, request);
        return userMapper.toResponse(userRepository.saveAndFlush(user));
    }

    /**
     * Fetches a single user by id.
     *
     * @param id identifier of the user
     * @return the user mapped to a response
     * @throws GeneralException with HTTP 404 when the user does not exist
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(String id) {
        return userMapper.toResponse(getUserOrThrow(id));
    }

    /**
     * Returns a page of users narrowed by the given criteria.
     *
     * <p>An empty filter returns every user; otherwise only the criteria that
     * carry a value reach the database.
     *
     * @param filter   global term and per-column filters
     * @param pageable the requested page and size
     * @return a page of users wrapped in a {@link PageResponse}
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(UserFilter filter, Pageable pageable) {
        return PageResponse.from(loadPage(filter, pageable).map(userMapper::toResponse));
    }

    /**
     * Exports every user matching the criteria, letting the exporter pull the
     * rows page by page so the whole table is never held in memory at once.
     *
     * @param filter same criteria the listing accepts; empty exports everything
     * @return the .xlsx file as a byte array
     * @throws GeneralException with HTTP 500 when the workbook cannot be written
     */
    @Override
    @Transactional(readOnly = true)
    public byte[] exportToExcel(UserFilter filter) {
        try {
            return userExcelExporter.export(pageable -> loadPage(filter, pageable));
        } catch (IOException exception) {
            throw new GeneralException(
                    Message.formatMessage(Message.REPORT_GENERATION_FAILED, Models.USER.getValue()),
                    ErrorCode.GENERATE_REPORT_FAILED.getValue(),
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    exception.getMessage());
        }
    }

    /**
     * Single place the listing and the export go through, so both always apply
     * the same criteria. An empty filter skips the specification altogether.
     */
    private Page<User> loadPage(UserFilter filter, Pageable pageable) {
        return filter.isEmpty()
                ? userRepository.findAll(pageable)
                : userRepository.findAll(UserSpecifications.matching(filter), pageable);
    }

    /**
     * Deletes a user and all of its addresses.
     *
     * <p>Addresses are removed first in a single statement to satisfy the
     * foreign key, then the user row itself.
     *
     * @param id identifier of the user to delete
     * @throws GeneralException with HTTP 404 when the user does not exist
     */
    @Override
    @Transactional
    public void delete(String id) {
        if (!userRepository.existsById(id)) {
            throw new GeneralException(
                    Message.formatMessage(Message.OBJECT_WITH_ID_NOT_EXISTS, Models.USER.getValue(), id),
                    ErrorCode.USER_NOT_EXISTS.getValue(),
                    HttpStatus.NOT_FOUND);
        }
        // Addresses go first in a single statement; the user row is removed afterwards.
        addressRepository.deleteAllByUserId(id);
        userRepository.deleteById(id);
    }

    /**
     * Loads a user by id or fails.
     *
     * @param id identifier of the user
     * @return the found user entity
     * @throws GeneralException with HTTP 404 when the user does not exist
     */
    private User getUserOrThrow(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new GeneralException(
                        Message.formatMessage(Message.OBJECT_WITH_ID_NOT_EXISTS, Models.USER.getValue(), id),
                        ErrorCode.USER_NOT_EXISTS.getValue(),
                        HttpStatus.NOT_FOUND));
    }

    /**
     * Verifies CURP, RFC and email are not already used by another user.
     *
     * @param request   the incoming user data
     * @param currentId id to exclude from the check on updates; {@code null} on create
     * @throws GeneralException with HTTP 409 on the first field already taken
     */
    private void validateUniqueness(UserRequest request, String currentId) {
        String curp = request.curp().trim();
        String rfc = request.rfc().trim();
        String email = request.email().trim();

        boolean curpTaken = currentId == null
                ? userRepository.existsByCurpIgnoreCase(curp)
                : userRepository.existsByCurpIgnoreCaseAndIdNot(curp, currentId);
        if (curpTaken) {
            throw new GeneralException(
                    Message.formatMessage(Message.USER_CURP_ALREADY_EXISTS, curp),
                    ErrorCode.USER_CURP_ALREADY_EXISTS.getValue(),
                    HttpStatus.CONFLICT);
        }

        boolean rfcTaken = currentId == null
                ? userRepository.existsByRfcIgnoreCase(rfc)
                : userRepository.existsByRfcIgnoreCaseAndIdNot(rfc, currentId);
        if (rfcTaken) {
            throw new GeneralException(
                    Message.formatMessage(Message.USER_RFC_ALREADY_EXISTS, rfc),
                    ErrorCode.USER_RFC_ALREADY_EXISTS.getValue(),
                    HttpStatus.CONFLICT);
        }

        boolean emailTaken = currentId == null
                ? userRepository.existsByEmailIgnoreCase(email)
                : userRepository.existsByEmailIgnoreCaseAndIdNot(email, currentId);
        if (emailTaken) {
            throw new GeneralException(
                    Message.formatMessage(Message.USER_EMAIL_ALREADY_EXISTS, email),
                    ErrorCode.USER_EMAIL_ALREADY_EXISTS.getValue(),
                    HttpStatus.CONFLICT);
        }
    }
}
