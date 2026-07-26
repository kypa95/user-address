package com.useraddress.user_address.user.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.entity.Address;
import com.useraddress.user_address.address.mapper.AddressMapper;
import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.common.dto.PageResponse;
import com.useraddress.user_address.helper.exception.GeneralException;
import com.useraddress.user_address.testsupport.TestData;
import com.useraddress.user_address.user.dto.UserFilter;
import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.dto.UserResponse;
import com.useraddress.user_address.user.entity.User;
import com.useraddress.user_address.user.export.UserExcelExporter;
import com.useraddress.user_address.user.mapper.UserMapper;
import com.useraddress.user_address.user.repository.UserRepository;
import com.useraddress.user_address.util.enums.ErrorCode;

/**
 * Unit tests for {@link UserServiceImpl}: every collaborator is a mock, so what
 * is under test is the service's own rules — uniqueness, the 404s, which query
 * a filter ends up on, and the order deletion happens in.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    private static final UserFilter EMPTY_FILTER =
            new UserFilter(null, null, null, null, null, null, null, null);

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private AddressMapper addressMapper;

    @Mock
    private UserExcelExporter userExcelExporter;

    @InjectMocks
    private UserServiceImpl userService;

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("saves the user with the addresses it carries")
        void savesUserWithItsAddresses() {
            UserRequest request = TestData.userRequest(List.of(TestData.addressRequest()));
            User entity = TestData.user();
            Address address = TestData.address(entity);

            when(userRepository.existsByCurpIgnoreCase(TestData.CURP)).thenReturn(false);
            when(userRepository.existsByRfcIgnoreCase(TestData.RFC)).thenReturn(false);
            when(userRepository.existsByEmailIgnoreCase(TestData.EMAIL)).thenReturn(false);
            when(userMapper.toEntity(request)).thenReturn(entity);
            when(addressMapper.toEntity(any(AddressRequest.class), eq(entity))).thenReturn(address);
            when(userRepository.saveAndFlush(entity)).thenReturn(entity);
            when(userMapper.toResponse(entity)).thenReturn(response(entity));

            UserResponse result = userService.create(request);

            assertThat(result.id()).isEqualTo(TestData.USER_ID);
            assertThat(entity.getAddresses()).containsExactly(address);
            verify(userRepository).saveAndFlush(entity);
        }

        @Test
        @DisplayName("accepts a request without addresses")
        void acceptsRequestWithoutAddresses() {
            UserRequest request = TestData.userRequest();
            User entity = TestData.user();

            when(userMapper.toEntity(request)).thenReturn(entity);
            when(userRepository.saveAndFlush(entity)).thenReturn(entity);
            when(userMapper.toResponse(entity)).thenReturn(response(entity));

            userService.create(request);

            assertThat(entity.getAddresses()).isEmpty();
            verify(addressMapper, never()).toEntity(any(), any());
        }

        @Test
        @DisplayName("rejects a CURP already taken with 409 and its business code")
        void rejectsDuplicatedCurp() {
            UserRequest request = TestData.userRequest();
            when(userRepository.existsByCurpIgnoreCase(TestData.CURP)).thenReturn(true);

            assertThatThrownBy(() -> userService.create(request))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> {
                        GeneralException exception = (GeneralException) thrown;
                        assertThat(exception.getMethod()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(exception.getCode())
                                .isEqualTo(ErrorCode.USER_CURP_ALREADY_EXISTS.getValue());
                    });

            verify(userRepository, never()).saveAndFlush(any());
        }

        @Test
        @DisplayName("rejects an email already taken")
        void rejectsDuplicatedEmail() {
            UserRequest request = TestData.userRequest();
            when(userRepository.existsByCurpIgnoreCase(TestData.CURP)).thenReturn(false);
            when(userRepository.existsByRfcIgnoreCase(TestData.RFC)).thenReturn(false);
            when(userRepository.existsByEmailIgnoreCase(TestData.EMAIL)).thenReturn(true);

            assertThatThrownBy(() -> userService.create(request))
                    .isInstanceOf(GeneralException.class)
                    .hasMessageContaining(TestData.EMAIL);
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("checks uniqueness ignoring the user's own row")
        void checksUniquenessExcludingItself() {
            User entity = TestData.user();
            UserRequest request = TestData.userRequest();

            when(userRepository.findById(TestData.USER_ID)).thenReturn(Optional.of(entity));
            when(userRepository.saveAndFlush(entity)).thenReturn(entity);
            when(userMapper.toResponse(entity)).thenReturn(response(entity));

            userService.update(TestData.USER_ID, request);

            verify(userRepository).existsByCurpIgnoreCaseAndIdNot(TestData.CURP, TestData.USER_ID);
            verify(userRepository).existsByRfcIgnoreCaseAndIdNot(TestData.RFC, TestData.USER_ID);
            verify(userRepository).existsByEmailIgnoreCaseAndIdNot(TestData.EMAIL, TestData.USER_ID);
            verify(userMapper).updateEntity(entity, request);
        }

        @Test
        @DisplayName("fails with 404 when the user does not exist")
        void failsWhenUserMissing() {
            UserRequest request = TestData.userRequest();
            when(userRepository.findById("missing")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.update("missing", request))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> assertThat(((GeneralException) thrown).getMethod())
                            .isEqualTo(HttpStatus.NOT_FOUND));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        @DisplayName("an empty filter never builds a specification")
        void emptyFilterListsEveryUser() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<User> page = new PageImpl<>(List.of(TestData.user()), pageable, 1);

            when(userRepository.findAll(pageable)).thenReturn(page);
            when(userMapper.toResponse(any(User.class))).thenReturn(response(TestData.user()));

            PageResponse<UserResponse> result = userService.findAll(EMPTY_FILTER, pageable);

            assertThat(result.content()).hasSize(1);
            assertThat(result.totalElements()).isEqualTo(1);
            verify(userRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @Test
        @DisplayName("a filter with a value goes through the specification")
        void filterUsesSpecification() {
            Pageable pageable = PageRequest.of(0, 10);
            UserFilter filter = new UserFilter(null, "sonia", null, null, null, null, null, null);
            Page<User> page = new PageImpl<>(List.of(), pageable, 0);

            when(userRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            userService.findAll(filter, pageable);

            verify(userRepository, never()).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("a blank filter counts as empty")
        void blankFilterCountsAsEmpty() {
            Pageable pageable = PageRequest.of(0, 10);
            UserFilter filter = new UserFilter("   ", "", null, null, null, null, null, null);

            when(userRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(), pageable, 0));

            userService.findAll(filter, pageable);

            verify(userRepository).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("exportToExcel")
    class Export {

        @Test
        @DisplayName("hands the exporter a loader that applies the same filter")
        void exportsWithTheSameCriteria() throws IOException {
            byte[] file = {1, 2, 3};
            UserFilter filter = new UserFilter("sonia", null, null, null, null, null, null, null);
            Page<User> page = new PageImpl<>(List.of(TestData.user()));

            when(userRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(page);
            when(userExcelExporter.export(any())).thenAnswer(invocation -> {
                // Run the loader the service passed in: that is what proves the
                // export and the listing share their criteria.
                java.util.function.Function<Pageable, Page<User>> loader = invocation.getArgument(0);
                loader.apply(PageRequest.of(0, 500));
                return file;
            });

            assertThat(userService.exportToExcel(filter)).isEqualTo(file);
            // Twice on the specification: once for the probe that checks there
            // is something to export, once for the page the loader pulled.
            // Never on the plain findAll, which would ignore the filter.
            verify(userRepository, times(2)).findAll(any(Specification.class), any(Pageable.class));
            verify(userRepository, never()).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("turns an IOException into a 500 with the report error code")
        void wrapsIoException() throws IOException {
            // An empty filter skips the specification, so the probe lands on the
            // plain findAll; without content the export never reaches the writer.
            when(userRepository.findAll(any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(TestData.user())));
            when(userExcelExporter.export(any())).thenThrow(new IOException("disk full"));

            assertThatThrownBy(() -> userService.exportToExcel(EMPTY_FILTER))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> {
                        GeneralException exception = (GeneralException) thrown;
                        assertThat(exception.getMethod()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
                        assertThat(exception.getCode())
                                .isEqualTo(ErrorCode.GENERATE_REPORT_FAILED.getValue());
                        assertThat(exception.getData()).isEqualTo("disk full");
                    });
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("removes the addresses before the user, to satisfy the foreign key")
        void deletesAddressesFirst() {
            when(userRepository.existsById(TestData.USER_ID)).thenReturn(true);

            userService.delete(TestData.USER_ID);

            InOrder order = inOrder(addressRepository, userRepository);
            order.verify(addressRepository).deleteAllByUserId(TestData.USER_ID);
            order.verify(userRepository).deleteById(TestData.USER_ID);
        }

        @Test
        @DisplayName("fails with 404 and touches nothing when the user does not exist")
        void failsWhenUserMissing() {
            when(userRepository.existsById("missing")).thenReturn(false);

            assertThatThrownBy(() -> userService.delete("missing"))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> assertThat(((GeneralException) thrown).getCode())
                            .isEqualTo(ErrorCode.USER_NOT_EXISTS.getValue()));

            verify(addressRepository, never()).deleteAllByUserId(anyString());
            verify(userRepository, never()).deleteById(anyString());
        }
    }

    @Test
    @DisplayName("findById maps the entity it finds")
    void findByIdMapsTheEntity() {
        User entity = TestData.user();
        when(userRepository.findById(TestData.USER_ID)).thenReturn(Optional.of(entity));
        when(userMapper.toResponse(entity)).thenReturn(response(entity));

        assertThat(userService.findById(TestData.USER_ID).curp()).isEqualTo(TestData.CURP);
    }

    @Test
    @DisplayName("the listing keeps the page metadata the repository reported")
    void keepsPageMetadata() {
        Pageable pageable = PageRequest.of(1, 2);
        Page<User> page = new PageImpl<>(List.of(TestData.user()), pageable, 5);
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);

        when(userRepository.findAll(captor.capture())).thenReturn(page);
        when(userMapper.toResponse(any(User.class))).thenReturn(response(TestData.user()));

        PageResponse<UserResponse> result = userService.findAll(EMPTY_FILTER, pageable);

        assertThat(captor.getValue()).isEqualTo(pageable);
        assertThat(result.page()).isEqualTo(1);
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.totalElements()).isEqualTo(5);
        assertThat(result.totalPages()).isEqualTo(3);
        assertThat(result.last()).isFalse();
    }

    private static UserResponse response(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getLastName(), user.getSecondLastName(),
                user.getCurp(), user.getRfc(), user.getEmail(), user.getPhoneNumber(),
                user.getCreatedAt(), user.getUpdatedAt());
    }
}
