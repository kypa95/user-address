package com.useraddress.user_address.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "A state and how many users have an address there.")
public record StateCountResponse(

        @Schema(description = "State as it was registered in the address", example = "Nuevo León")
        String state,

        @Schema(description = "Distinct users with at least one address in that state", example = "12")
        long total) {
}
