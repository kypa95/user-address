package com.useraddress.user_address.address.controller;

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

import com.useraddress.user_address.address.dto.AddressFilter;
import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.address.service.AddressService;
import com.useraddress.user_address.common.dto.ExportFile;
import com.useraddress.user_address.common.dto.PageResponse;
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

    /**
     * Streams the addresses of a user as a spreadsheet. Like the user export,
     * this endpoint answers with the file itself, not the shared envelope.
     */
    @Operation(summary = "Export the addresses of a user to Excel",
            description = "Returns an .xlsx file with every address of the user. Unlike the rest "
                    + "of the API, the body is the binary file, not the standard response envelope.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Spreadsheet generated.",
                    content = @Content(
                            mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "The workbook could not be written, code 2111.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping(value = "/users/{userId}/addresses/export",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportByUser(
            @Parameter(description = "Identifier of the owner") @PathVariable String userId,
            @Parameter(description = "Term searched in every visible column", example = "centro")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filters the street column") @RequestParam(required = false) String street,
            @Parameter(description = "Filters the exterior number column") @RequestParam(required = false) String exteriorNumber,
            @Parameter(description = "Filters the interior number column") @RequestParam(required = false) String interiorNumber,
            @Parameter(description = "Filters the neighborhood column") @RequestParam(required = false) String neighborhood,
            @Parameter(description = "Filters the state column") @RequestParam(required = false) String state,
            @Parameter(description = "Filters the city column") @RequestParam(required = false) String city,
            @Parameter(description = "Filters the postal code column") @RequestParam(required = false) String postalCode,
            @Parameter(description = "Filters the country column") @RequestParam(required = false) String country) {

        AddressFilter filter = new AddressFilter(
                search, street, exteriorNumber, interiorNumber, neighborhood, state, city,
                postalCode, country);

        ExportFile file = addressService.exportToExcel(userId, filter);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName()).build().toString())
                .contentLength(file.content().length)
                .body(file.content());
    }

    @Operation(summary = "List the addresses of a user",
            description = "Paginated. The optional search parameter matches any visible column "
                    + "(street, numbers, neighborhood, state, city, postal code, country), "
                    + "partial and case insensitive. Each of those columns also takes its own "
                    + "parameter; every criterion given is combined with AND.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Page of addresses."),
            @ApiResponse(responseCode = "404", description = "User not found, code 3100.",
                    content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/users/{userId}/addresses")
    public ResponseEntity<ResponseWrapper<PageResponse<AddressResponse>>> findByUser(
            @Parameter(description = "Identifier of the owner") @PathVariable String userId,
            @Parameter(description = "Term searched in every visible column", example = "centro")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filters the street column") @RequestParam(required = false) String street,
            @Parameter(description = "Filters the exterior number column") @RequestParam(required = false) String exteriorNumber,
            @Parameter(description = "Filters the interior number column") @RequestParam(required = false) String interiorNumber,
            @Parameter(description = "Filters the neighborhood column") @RequestParam(required = false) String neighborhood,
            @Parameter(description = "Filters the state column") @RequestParam(required = false) String state,
            @Parameter(description = "Filters the city column") @RequestParam(required = false) String city,
            @Parameter(description = "Filters the postal code column") @RequestParam(required = false) String postalCode,
            @Parameter(description = "Filters the country column") @RequestParam(required = false) String country,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {

        AddressFilter filter = new AddressFilter(
                search, street, exteriorNumber, interiorNumber, neighborhood, state, city,
                postalCode, country);

        return ResponseHandler.wrapSuccessResponse(
                Message.formatMessage(Message.LIST_OBJECT_WITH_OBJECT_ID, Models.ADDRESS.getValue(),
                        Models.USER.getValue(), userId),
                HttpStatus.OK,
                addressService.findByUserId(userId, filter, pageable));
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
