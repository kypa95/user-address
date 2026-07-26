package com.useraddress.user_address.user.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.useraddress.user_address.common.dto.PageResponse;
import com.useraddress.user_address.helper.response.ResponseHandler;
import com.useraddress.user_address.helper.response.ResponseWrapper;
import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.service.UserService;
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

@Tag(name = "Users", description = "Registration, search and removal of users.")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Create a user",
            description = "CURP, RFC and email must not be registered by another user.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created."),
            @ApiResponse(responseCode = "400", description = "Validation failed, code 817.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "409",
                    description = "CURP (1027), RFC (1028) or email (1020) already registered.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @PostMapping
    public ResponseEntity<ResponseWrapper<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_CREATED, Models.USER.getValue()),
                HttpStatus.CREATED,
                userService.create(request));
    }

    @Operation(summary = "Update a user", description = "Replaces every field of the user.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User updated."),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "409",
                    description = "CURP (1027), RFC (1028) or email (1020) already registered by someone else.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<ResponseWrapper<UserResponse>> update(
            @Parameter(description = "Identifier of the user") @PathVariable String id,
            @Valid @RequestBody UserRequest request) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_UPDATED, Models.USER.getValue()),
                HttpStatus.OK,
                userService.update(id, request));
    }

    @Operation(summary = "Find a user by id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found."),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<ResponseWrapper<UserResponse>> findById(
            @Parameter(description = "Identifier of the user") @PathVariable String id) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_WITH_ID_EXISTS, Models.USER.getValue(), id),
                HttpStatus.OK,
                userService.findById(id));
    }

    @Operation(summary = "List users with pagination",
            description = "The optional search parameter matches name, last name or second last name, "
                    + "partial and case insensitive.")
    @ApiResponse(responseCode = "200", description = "Page of users.")
    @GetMapping
    public ResponseEntity<ResponseWrapper<PageResponse<UserResponse>>> findAll(
            @Parameter(description = "Term searched in name, lastName and secondLastName", example = "perez")
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(pageable, Models.USER.getValue()),
                HttpStatus.OK,
                userService.findAll(search, pageable));
    }

    @Operation(summary = "Delete a user",
            description = "Removes the user together with every address associated with it.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User and its addresses deleted."),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseWrapper<Void>> delete(
            @Parameter(description = "Identifier of the user") @PathVariable String id) {
        userService.delete(id);
        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.OBJECT_DELETED, Models.USER.getValue()),
                HttpStatus.OK,
                null);
    }
}
