package com.useraddress.user_address.address.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.address.entity.Address;
import com.useraddress.user_address.address.export.AddressExcelExporter;
import com.useraddress.user_address.address.mapper.AddressMapper;
import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.address.service.AddressService;
import com.useraddress.user_address.common.dto.ExportFile;
import com.useraddress.user_address.common.dto.PageResponse;
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

    /** Stamped into the exported file name, e.g. direcciones_CURP_20260725_1830.xlsx */
    private static final DateTimeFormatter FILE_TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmm");

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;
    private final AddressExcelExporter addressExcelExporter;

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
     * A page of a user's addresses, optionally filtered by a term matching any
     * visible column.
     *
     * @param userId   owner whose addresses are listed
     * @param search   free-text term; blank returns every address
     * @param pageable requested page and size
     * @return a page of addresses
     * @throws GeneralException with HTTP 404 when the user does not exist
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<AddressResponse> findByUserId(String userId, String search, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw userNotExists(userId);
        }
        String term = (search == null) ? "" : search.trim();
        return PageResponse.from(loadPage(userId, term, pageable).map(addressMapper::toResponse));
    }

    /**
     * Single place the listing and the export go through, so both always apply
     * the same criteria.
     *
     * @param userId   owner whose addresses are read
     * @param term     already trimmed search term; blank means no filter
     * @param pageable requested page and size
     */
    private Page<Address> loadPage(String userId, String term, Pageable pageable) {
        return term.isEmpty()
                ? addressRepository.findByUserId(userId, pageable)
                : addressRepository.searchByUser(userId, term, pageable);
    }

    /**
     * Exports every address of a user to a spreadsheet.
     *
     * <p>The owner's CURP goes into the file name, so exports of different
     * users never overwrite each other.
     *
     * @param userId owner whose addresses are exported
     * @return the .xlsx file and the name it should be downloaded as
     * @throws GeneralException with HTTP 404 when the user does not exist,
     *                          or HTTP 500 when the workbook cannot be written
     */
    @Override
    @Transactional(readOnly = true)
    public ExportFile exportToExcel(String userId, String search) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> userNotExists(userId));

        String term = (search == null) ? "" : search.trim();

        try {
            String fileName = Message.formatMessage(
                    Message.EXPORT_ADDRESSES_FILE_NAME,
                    user.getCurp(),
                    LocalDateTime.now().format(FILE_TIMESTAMP));

            // The exporter asks for one page at a time, so a user with many
            // addresses never has them all in memory at once.
            return new ExportFile(
                    fileName,
                    addressExcelExporter.export(pageable -> loadPage(userId, term, pageable)));
        } catch (IOException exception) {
            throw new GeneralException(
                    Message.formatMessage(Message.REPORT_GENERATION_FAILED, Models.ADDRESS.getValue()),
                    ErrorCode.GENERATE_REPORT_FAILED.getValue(),
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    exception.getMessage());
        }
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
