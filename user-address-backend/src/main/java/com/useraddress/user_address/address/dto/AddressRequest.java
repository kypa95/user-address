package com.useraddress.user_address.address.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Data needed to create or update an address. The owner comes from the URL.")
public record AddressRequest(

        @Schema(description = "Street", example = "Av Universidad", maxLength = 150)
        @NotBlank(message = "is required")
        @Size(max = 150, message = "must be at most 150 characters")
        String street,

        @Schema(description = "Exterior number", example = "1234", maxLength = 20)
        @NotBlank(message = "is required")
        @Size(max = 20, message = "must be at most 20 characters")
        String exteriorNumber,

        @Schema(description = "Interior number, the only optional field", example = "5B", maxLength = 20)
        @Size(max = 20, message = "must be at most 20 characters")
        String interiorNumber,

        @Schema(description = "Neighborhood", example = "Del Valle", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String neighborhood,

        @Schema(description = "Postal code, digits only", example = "03100", maxLength = 10)
        @NotBlank(message = "is required")
        @Size(max = 10, message = "must be at most 10 characters")
        @Pattern(regexp = "^[0-9]{4,10}$", message = "must contain only digits")
        String postalCode,

        @Schema(description = "City", example = "Ciudad de Mexico", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String city,

        @Schema(description = "State", example = "Ciudad de Mexico", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String state,

        @Schema(description = "Country", example = "Mexico", maxLength = 100)
        @NotBlank(message = "is required")
        @Size(max = 100, message = "must be at most 100 characters")
        String country) {
}
