package com.useraddress.user_address.dashboard.dto;

import java.util.List;

import com.useraddress.user_address.user.dto.UserResponse;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Everything the dashboard needs, resolved in a single request.
 */
@Schema(description = "Aggregated figures for the dashboard.")
public record DashboardSummaryResponse(

        @Schema(description = "Users registered in total", example = "137")
        long totalUsers,

        @Schema(description = "Users that have at least one address", example = "120")
        long usersWithAddress,

        @Schema(description = "Users that have no address registered", example = "17")
        long usersWithoutAddress,

        @Schema(description = "The most recently registered users, newest first")
        List<UserResponse> latestUsers,

        @Schema(description = "States with the most users, highest first")
        List<StateCountResponse> topStates) {
}
