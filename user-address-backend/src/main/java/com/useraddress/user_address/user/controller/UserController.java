package com.useraddress.user_address.user.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import com.useraddress.user_address.user.dto.UserFilter;
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

    /** Stamped into the exported file name, e.g. usuarios_20260725_1830.xlsx */
    private static final DateTimeFormatter FILE_TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmm");

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
            description = """
                    `search` matches any visible column. The remaining parameters filter a single
                    column each. All of them are partial and case insensitive, and combine with AND
                    — `lastName=perez&curp=PEL` returns the users matching both.
                    """)
    @ApiResponse(responseCode = "200", description = "Page of users.")
    @GetMapping
    public ResponseEntity<ResponseWrapper<PageResponse<UserResponse>>> findAll(
            @Parameter(description = "Term searched in every visible column", example = "perez")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filters the name column") @RequestParam(required = false) String name,
            @Parameter(description = "Filters the last name column") @RequestParam(required = false) String lastName,
            @Parameter(description = "Filters the second last name column") @RequestParam(required = false) String secondLastName,
            @Parameter(description = "Filters the CURP column") @RequestParam(required = false) String curp,
            @Parameter(description = "Filters the RFC column") @RequestParam(required = false) String rfc,
            @Parameter(description = "Filters the email column") @RequestParam(required = false) String email,
            @Parameter(description = "Filters the phone column") @RequestParam(required = false) String phoneNumber,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UserFilter filter = new UserFilter(
                search, name, lastName, secondLastName, curp, rfc, email, phoneNumber);

        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(pageable, Models.USER.getValue()),
                HttpStatus.OK,
                userService.findAll(filter, pageable));
    }

    /**
     * Streams the listing as a spreadsheet. This is the one endpoint that does
     * not answer with the shared envelope: the body is the file itself.
     */
    @Operation(summary = "Export the users to Excel",
            description = "Returns an .xlsx file with every user matching the same criteria the "
                    + "listing accepts, so the file mirrors what is on screen. The export is never "
                    + "paginated. Unlike the rest of the API, the body is the binary file, not the "
                    + "standard response envelope.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Spreadsheet generated.",
                    content = @Content(
                            mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "500", description = "The workbook could not be written, code 2111.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping(value = "/export",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportToExcel(
            @Parameter(description = "Term searched in every visible column", example = "perez")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filters the name column") @RequestParam(required = false) String name,
            @Parameter(description = "Filters the last name column") @RequestParam(required = false) String lastName,
            @Parameter(description = "Filters the second last name column") @RequestParam(required = false) String secondLastName,
            @Parameter(description = "Filters the CURP column") @RequestParam(required = false) String curp,
            @Parameter(description = "Filters the RFC column") @RequestParam(required = false) String rfc,
            @Parameter(description = "Filters the email column") @RequestParam(required = false) String email,
            @Parameter(description = "Filters the phone column") @RequestParam(required = false) String phoneNumber) {

        UserFilter filter = new UserFilter(
                search, name, lastName, secondLastName, curp, rfc, email, phoneNumber);

        byte[] file = userService.exportToExcel(filter);
        String fileName = Message.formatMessage(
                Message.EXPORT_FILE_NAME,
                LocalDateTime.now().format(FILE_TIMESTAMP));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fileName).build().toString())
                .contentLength(file.length)
                .body(file);
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
