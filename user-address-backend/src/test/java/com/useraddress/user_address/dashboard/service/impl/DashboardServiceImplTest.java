package com.useraddress.user_address.dashboard.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.address.repository.StateCount;
import com.useraddress.user_address.dashboard.dto.DashboardSummaryResponse;
import com.useraddress.user_address.dashboard.dto.StateCountResponse;
import com.useraddress.user_address.testsupport.TestData;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.entity.User;
import com.useraddress.user_address.user.mapper.UserMapper;
import com.useraddress.user_address.user.repository.UserRepository;

/**
 * Unit tests for {@link DashboardServiceImpl}: the figures are arithmetic over
 * what the repositories report, and the two listings are capped and ordered
 * here rather than by the caller.
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    @DisplayName("users without an address is what is left of the total")
    void derivesUsersWithoutAddress() {
        when(userRepository.count()).thenReturn(137L);
        when(addressRepository.countDistinctUsers()).thenReturn(120L);
        when(userRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(addressRepository.findTopStatesByUserCount(any(Pageable.class))).thenReturn(List.of());

        DashboardSummaryResponse summary = dashboardService.getSummary();

        assertThat(summary.totalUsers()).isEqualTo(137);
        assertThat(summary.usersWithAddress()).isEqualTo(120);
        assertThat(summary.usersWithoutAddress()).isEqualTo(17);
    }

    @Test
    @DisplayName("asks for the 5 newest users, newest first")
    void asksForTheFiveNewestUsers() {
        User user = TestData.user();
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);

        when(userRepository.count()).thenReturn(1L);
        when(addressRepository.countDistinctUsers()).thenReturn(1L);
        when(userRepository.findAll(captor.capture())).thenReturn(new PageImpl<>(List.of(user)));
        when(userMapper.toResponse(user)).thenReturn(response(user));
        when(addressRepository.findTopStatesByUserCount(any(Pageable.class))).thenReturn(List.of());

        DashboardSummaryResponse summary = dashboardService.getSummary();

        Pageable requested = captor.getValue();
        assertThat(requested.getPageSize()).isEqualTo(5);
        assertThat(requested.getSort().getOrderFor("createdAt"))
                .isNotNull()
                .extracting(Sort.Order::getDirection)
                .isEqualTo(Sort.Direction.DESC);
        assertThat(summary.latestUsers()).extracting(UserResponse::id).containsExactly(TestData.USER_ID);
    }

    @Test
    @DisplayName("maps the top 5 states with their counts, keeping the query order")
    void mapsTopStates() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);

        when(userRepository.count()).thenReturn(3L);
        when(addressRepository.countDistinctUsers()).thenReturn(2L);
        when(userRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(addressRepository.findTopStatesByUserCount(captor.capture()))
                .thenReturn(List.of(new Row("Jalisco", 12), new Row("Nuevo Leon", 7)));

        DashboardSummaryResponse summary = dashboardService.getSummary();

        assertThat(captor.getValue().getPageSize()).isEqualTo(5);
        assertThat(summary.topStates())
                .extracting(StateCountResponse::state, StateCountResponse::total)
                .containsExactly(tuple("Jalisco", 12L), tuple("Nuevo Leon", 7L));
    }

    @Test
    @DisplayName("answers with zeros on an empty database")
    void answersZerosWhenEmpty() {
        when(userRepository.count()).thenReturn(0L);
        when(addressRepository.countDistinctUsers()).thenReturn(0L);
        when(userRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(addressRepository.findTopStatesByUserCount(any(Pageable.class))).thenReturn(List.of());

        DashboardSummaryResponse summary = dashboardService.getSummary();

        assertThat(summary.totalUsers()).isZero();
        assertThat(summary.usersWithoutAddress()).isZero();
        assertThat(summary.latestUsers()).isEmpty();
        assertThat(summary.topStates()).isEmpty();
    }

    /**
     * The projection as a plain value: stubbing a mock inside a {@code when(…)}
     * argument would leave that stubbing unfinished.
     */
    private record Row(String state, long total) implements StateCount {

        @Override
        public String getState() {
            return state;
        }

        @Override
        public long getTotal() {
            return total;
        }
    }

    private static UserResponse response(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getLastName(), user.getSecondLastName(),
                user.getCurp(), user.getRfc(), user.getEmail(), user.getPhoneNumber(),
                user.getCreatedAt(), user.getUpdatedAt());
    }
}
