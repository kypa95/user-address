package com.useraddress.user_address.dashboard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.useraddress.user_address.dashboard.dto.DashboardSummaryResponse;
import com.useraddress.user_address.dashboard.service.DashboardService;
import com.useraddress.user_address.helper.response.ResponseHandler;
import com.useraddress.user_address.helper.response.ResponseWrapper;
import com.useraddress.user_address.util.Message;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Dashboard", description = "Aggregated figures for the landing screen.")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * The three figures travel together because the dashboard shows them at
     * once: one request, one loading state, one cache entry.
     */
    @Operation(summary = "Dashboard summary",
            description = """
                    Returns in a single call:
                    - totalUsers: how many users are registered.
                    - latestUsers: the 5 most recent registrations, newest first.
                    - topStates: the 5 states with the most users, each with its count.

                    A state's count is the number of distinct users holding an address there,
                    so somebody with two addresses in the same state is counted once.
                    """)
    @ApiResponse(responseCode = "200", description = "Summary calculated.")
    @GetMapping("/summary")
    public ResponseEntity<ResponseWrapper<DashboardSummaryResponse>> getSummary() {
        return ResponseHandler.wrapSuccessResponse(
                Message.DASHBOARD_SUMMARY,
                HttpStatus.OK,
                dashboardService.getSummary());
    }
}
