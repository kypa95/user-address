package com.useraddress.user_address.user.dto;

import com.useraddress.user_address.util.ValidationPatterns;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * The messages never repeat the field name: ErrorHandler already prefixes it
 * when it builds the response, so "format is invalid" reads as
 * "curp format is invalid".
 */
@Schema(description = "Data needed to create or update a user.")
public record UserRequest(

        @Schema(description = "First name", example = "Juan", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String name,

        @Schema(description = "Father's last name", example = "Perez", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String lastName,

        @Schema(description = "Mother's last name", example = "Lopez", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String secondLastName,

        @Schema(description = "CURP, 18 characters, unique per user", example = "PELJ900101HDFRPN09")
        @NotBlank(message = "is required")
        @Size(min = 18, max = 18, message = "must be exactly 18 characters")
        @Pattern(regexp = ValidationPatterns.CURP,
                message = "format is invalid: check the birth date, the sex, the state code and the consonants")
        String curp,

        @Schema(description = "RFC, 12 or 13 characters, unique per user", example = "PELJ900101AB1")
        @NotBlank(message = "is required")
        @Size(min = 12, max = 13, message = "must be between 12 and 13 characters")
        @Pattern(regexp = ValidationPatterns.RFC,
                message = "format is invalid: check the letters, the date and the homoclave")
        String rfc,

        @Schema(description = "Email, unique per user", example = "juan.perez@example.com", maxLength = 254)
        @NotBlank(message = "is required")
        @Size(max = 254, message = "must be at most 254 characters")
        @Pattern(regexp = ValidationPatterns.EMAIL, message = "format is invalid")
        String email,

        @Schema(description = "Phone number in E.164, or a Mexican national number",
                example = "+525512345678", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        @Pattern(regexp = ValidationPatterns.PHONE_NUMBER,
                message = "must be a phone in E.164 (+525512345678) or 10 digits")
        String phoneNumber) {
}
