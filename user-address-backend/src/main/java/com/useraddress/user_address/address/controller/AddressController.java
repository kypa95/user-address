package com.useraddress.user_address.address.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.address.service.AddressService;
import com.useraddress.user_address.helper.response.ResponseHandler;
import com.useraddress.user_address.helper.response.ResponseWrapper;
import com.useraddress.user_address.util.Message;
import com.useraddress.user_address.util.enums.Models;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Addresses", description = "Addresses owned by a user.")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @Operation(summary = "Create an address for a user",
            description = "The owner comes from the URL, the body never carries the user id.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Address created."),
            @ApiResponse(responseCode = "400", description = "Validation failed, code 817.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @PostMapping("/users/{userId}/addresses")
    public ResponseEntity<ResponseWrapper<AddressResponse>> create(
            @Parameter(description = "Identifier of the owner") @PathVariable String userId,
            @Valid @RequestBody AddressRequest request) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_CREATED, Models.ADDRESS.getValue()),
                HttpStatus.CREATED,
                addressService.create(userId, request));
    }

    @Operation(summary = "List every address of a user",
            description = "Returns the complete list, without pagination, ordered by creation date.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Addresses of the user."),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/users/{userId}/addresses")
    public ResponseEntity<ResponseWrapper<List<AddressResponse>>> findByUser(
            @Parameter(description = "Identifier of the owner") @PathVariable String userId) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.LIST_OBJECT_WITH_OBJECT_ID, Models.ADDRESS.getValue(),
                        Models.USER.getValue(), userId),
                HttpStatus.OK,
                addressService.findByUserId(userId));
    }

    @Operation(summary = "Update an address", description = "The owner of the address never changes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Address updated."),
            @ApiResponse(responseCode = "404", description = "Address not found, code 3120.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @PutMapping("/addresses/{id}")
    public ResponseEntity<ResponseWrapper<AddressResponse>> update(
            @Parameter(description = "Identifier of the address") @PathVariable String id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_UPDATED, Models.ADDRESS.getValue()),
                HttpStatus.OK,
                addressService.update(id, request));
    }

    @Operation(summary = "Find an address by id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Address found."),
            @ApiResponse(responseCode = "404", description = "Address not found, code 3120.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/addresses/{id}")
    public ResponseEntity<ResponseWrapper<AddressResponse>> findById(
            @Parameter(description = "Identifier of the address") @PathVariable String id) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_WITH_ID_EXISTS, Models.ADDRESS.getValue(), id),
                HttpStatus.OK,
                addressService.findById(id));
    }

    @Operation(summary = "Delete an address")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Address deleted."),
            @ApiResponse(responseCode = "404", description = "Address not found, code 3120.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ResponseWrapper<Void>> delete(
            @Parameter(description = "Identifier of the address") @PathVariable String id) {
        addressService.delete(id);
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_DELETED, Models.ADDRESS.getValue()),
                HttpStatus.OK,
                null);
    }
}
