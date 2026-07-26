package com.useraddress.user_address.user.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.common.dto.PageResponse;
import com.useraddress.user_address.helper.exception.GeneralException;
import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.entity.User;
import com.useraddress.user_address.user.mapper.UserMapper;
import com.useraddress.user_address.user.repository.UserRepository;
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

    /**
     * Creates a new user after checking that its CURP, RFC and email are free.
     *
     * @param request the user data to persist
     * @return the saved user mapped to a response
     * @throws GeneralException with HTTP 409 when CURP, RFC or email is already taken
     */
    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        validateUniqueness(request, null);
        User user = userMapper.toEntity(request);
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
     * Returns a page of users, optionally filtered by a search term.
     *
     * <p>A blank or {@code null} term returns every user; otherwise the
     * repository search runs against the indexed columns.
     *
     * @param search   free-text term; blank means no filter
     * @param pageable the requested page and size
     * @return a page of users wrapped in a {@link PageResponse}
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(String search, Pageable pageable) {
        String term = (search == null) ? "" : search.trim();

        Page<User> page = term.isEmpty()
                ? userRepository.findAll(pageable)
                : userRepository.search(term, pageable);

        return PageResponse.from(page.map(userMapper::toResponse));
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
