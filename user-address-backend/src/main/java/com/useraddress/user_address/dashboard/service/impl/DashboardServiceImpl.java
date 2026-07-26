package com.useraddress.user_address.dashboard.service.impl;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.dashboard.dto.DashboardSummaryResponse;
import com.useraddress.user_address.dashboard.dto.StateCountResponse;
import com.useraddress.user_address.dashboard.service.DashboardService;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.mapper.UserMapper;
import com.useraddress.user_address.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Read-only aggregations for the dashboard.
 *
 * <p>Each figure is a single query; nothing is loaded that the response does
 * not carry.
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private static final int LATEST_USERS = 5;
    private static final int TOP_STATES = 5;

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        long totalUsers = userRepository.count();
        long usersWithAddress = addressRepository.countDistinctUsers();

        return new DashboardSummaryResponse(
                totalUsers,
                usersWithAddress,
                totalUsers - usersWithAddress,
                latestUsers(),
                topStates());
    }

    /** The most recent registrations, newest first. */
    private List<UserResponse> latestUsers() {
        return userRepository
                .findAll(PageRequest.of(0, LATEST_USERS, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(userMapper::toResponse)
                .getContent();
    }

    /** States ranked by how many distinct users have an address there. */
    private List<StateCountResponse> topStates() {
        return addressRepository.findTopStatesByUserCount(PageRequest.of(0, TOP_STATES)).stream()
                .map(row -> new StateCountResponse(row.getState(), row.getTotal()))
                .toList();
    }
}
