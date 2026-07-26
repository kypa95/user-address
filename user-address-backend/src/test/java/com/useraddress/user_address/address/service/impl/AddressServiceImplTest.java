package com.useraddress.user_address.address.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.useraddress.user_address.address.dto.AddressFilter;
import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.address.entity.Address;
import com.useraddress.user_address.address.export.AddressExcelExporter;
import com.useraddress.user_address.address.mapper.AddressMapper;
import com.useraddress.user_address.address.repository.AddressRepository;
import com.useraddress.user_address.common.dto.ExportFile;
import com.useraddress.user_address.helper.exception.GeneralException;
import com.useraddress.user_address.testsupport.TestData;
import com.useraddress.user_address.user.entity.User;
import com.useraddress.user_address.user.repository.UserRepository;
import com.useraddress.user_address.util.enums.ErrorCode;

/**
 * Unit tests for {@link AddressServiceImpl}. The listing is always scoped to a
 * user, so the tests check both that the owner is verified and which query each
 * filter ends up on.
 */
@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    private static final AddressFilter EMPTY_FILTER =
            new AddressFilter(null, null, null, null, null, null, null, null, null);

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressMapper addressMapper;

    @Mock
    private AddressExcelExporter addressExcelExporter;

    @InjectMocks
    private AddressServiceImpl addressService;

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("saves the address against its owner")
        void savesAgainstItsOwner() {
            User owner = TestData.user();
            Address address = TestData.address(owner);
            AddressRequest request = TestData.addressRequest();

            when(userRepository.findById(TestData.USER_ID)).thenReturn(Optional.of(owner));
            when(addressMapper.toEntity(request, owner)).thenReturn(address);
            when(addressRepository.saveAndFlush(address)).thenReturn(address);
            when(addressMapper.toResponse(address)).thenReturn(response(address));

            AddressResponse result = addressService.create(TestData.USER_ID, request);

            assertThat(result.userId()).isEqualTo(TestData.USER_ID);
            verify(addressRepository).saveAndFlush(address);
        }

        @Test
        @DisplayName("fails with 404 and code 3100 when the user does not exist")
        void failsWhenOwnerMissing() {
            AddressRequest request = TestData.addressRequest();
            when(userRepository.findById("missing")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> addressService.create("missing", request))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> {
                        GeneralException exception = (GeneralException) thrown;
                        assertThat(exception.getMethod()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(exception.getCode())
                                .isEqualTo(ErrorCode.USER_NOT_EXISTS.getValue());
                    });

            verify(addressRepository, never()).saveAndFlush(any());
        }
    }

    @Nested
    @DisplayName("findByUserId")
    class FindByUserId {

        @Test
        @DisplayName("an empty filter lists straight by owner")
        void emptyFilterListsByOwner() {
            Pageable pageable = PageRequest.of(0, 10);
            User owner = TestData.user();
            Address address = TestData.address(owner);
            Page<Address> page = new PageImpl<>(List.of(address), pageable, 1);

            when(userRepository.existsById(TestData.USER_ID)).thenReturn(true);
            when(addressRepository.findByUserId(TestData.USER_ID, pageable)).thenReturn(page);
            when(addressMapper.toResponse(address)).thenReturn(response(address));

            assertThat(addressService.findByUserId(TestData.USER_ID, EMPTY_FILTER, pageable)
                    .content()).hasSize(1);
            verify(addressRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @Test
        @DisplayName("a per-column filter goes through the specification")
        void columnFilterUsesSpecification() {
            Pageable pageable = PageRequest.of(0, 10);
            AddressFilter filter = new AddressFilter(
                    null, null, null, null, null, "Jalisco", null, null, null);

            when(userRepository.existsById(TestData.USER_ID)).thenReturn(true);
            when(addressRepository.findAll(any(Specification.class), eq(pageable)))
                    .thenReturn(new PageImpl<>(List.of(), pageable, 0));

            addressService.findByUserId(TestData.USER_ID, filter, pageable);

            verify(addressRepository, never()).findByUserId(any(), any());
        }

        @Test
        @DisplayName("the global search term also goes through the specification")
        void searchUsesSpecification() {
            Pageable pageable = PageRequest.of(0, 10);
            AddressFilter filter = new AddressFilter(
                    "centro", null, null, null, null, null, null, null, null);

            when(userRepository.existsById(TestData.USER_ID)).thenReturn(true);
            when(addressRepository.findAll(any(Specification.class), eq(pageable)))
                    .thenReturn(new PageImpl<>(List.of(), pageable, 0));

            addressService.findByUserId(TestData.USER_ID, filter, pageable);

            verify(addressRepository, never()).findByUserId(any(), any());
        }

        @Test
        @DisplayName("fails with 404 when the owner does not exist")
        void failsWhenOwnerMissing() {
            Pageable pageable = PageRequest.of(0, 10);
            when(userRepository.existsById("missing")).thenReturn(false);

            assertThatThrownBy(() -> addressService.findByUserId("missing", EMPTY_FILTER, pageable))
                    .isInstanceOf(GeneralException.class)
                    .hasMessageContaining("missing");
        }
    }

    @Nested
    @DisplayName("exportToExcel")
    class Export {

        @Test
        @DisplayName("names the file after the owner's CURP and applies the filter")
        void namesFileAfterOwnerAndFilters() throws IOException {
            User owner = TestData.user();
            byte[] content = {4, 5, 6};
            AddressFilter filter = new AddressFilter(
                    null, null, null, null, null, "Jalisco", null, null, null);

            when(userRepository.findById(TestData.USER_ID)).thenReturn(Optional.of(owner));
            // The service probes for a first row before exporting, so the page
            // has to come back with content or the export ends in a 404.
            when(addressRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(TestData.address(owner))));
            when(addressExcelExporter.export(any())).thenAnswer(invocation -> {
                Function<Pageable, Page<Address>> loader = invocation.getArgument(0);
                loader.apply(PageRequest.of(0, 200));
                return content;
            });

            ExportFile file = addressService.exportToExcel(TestData.USER_ID, filter);

            assertThat(file.content()).isEqualTo(content);
            assertThat(file.fileName()).startsWith("direcciones_" + TestData.CURP + "_")
                    .endsWith(".xlsx");
            // Same criteria as the listing: a filtered export must not fall back
            // to every address of the user.
            verify(addressRepository, never()).findByUserId(any(), any());
        }

        @Test
        @DisplayName("turns an IOException into a 500 with the report error code")
        void wrapsIoException() throws IOException {
            User owner = TestData.user();

            when(userRepository.findById(TestData.USER_ID)).thenReturn(Optional.of(owner));
            // An empty filter skips the specification, so the probe lands on
            // findByUserId; without content the export never reaches the writer.
            when(addressRepository.findByUserId(eq(TestData.USER_ID), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(TestData.address(owner))));
            when(addressExcelExporter.export(any())).thenThrow(new IOException("broken pipe"));

            assertThatThrownBy(() -> addressService.exportToExcel(TestData.USER_ID, EMPTY_FILTER))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> {
                        GeneralException exception = (GeneralException) thrown;
                        assertThat(exception.getMethod()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
                        assertThat(exception.getCode())
                                .isEqualTo(ErrorCode.GENERATE_REPORT_FAILED.getValue());
                    });
        }
    }

    @Nested
    @DisplayName("update and delete")
    class Writes {

        @Test
        @DisplayName("update keeps the owner and saves the mapped changes")
        void updateKeepsOwner() {
            User owner = TestData.user();
            Address address = TestData.address(owner);
            AddressRequest request = TestData.addressRequest();

            when(addressRepository.findById(TestData.ADDRESS_ID)).thenReturn(Optional.of(address));
            when(addressRepository.saveAndFlush(address)).thenReturn(address);
            when(addressMapper.toResponse(address)).thenReturn(response(address));

            addressService.update(TestData.ADDRESS_ID, request);

            verify(addressMapper).updateEntity(address, request);
            assertThat(address.getUser()).isSameAs(owner);
        }

        @Test
        @DisplayName("delete removes the address it found")
        void deleteRemovesTheAddress() {
            Address address = TestData.address(TestData.user());
            when(addressRepository.findById(TestData.ADDRESS_ID)).thenReturn(Optional.of(address));

            addressService.delete(TestData.ADDRESS_ID);

            verify(addressRepository).delete(address);
        }

        @Test
        @DisplayName("delete fails with 404 and code 3120 when the address does not exist")
        void deleteFailsWhenMissing() {
            when(addressRepository.findById("missing")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> addressService.delete("missing"))
                    .isInstanceOf(GeneralException.class)
                    .satisfies(thrown -> assertThat(((GeneralException) thrown).getCode())
                            .isEqualTo(ErrorCode.ADDRESS_NOT_EXISTS.getValue()));

            // Typed: the repository also inherits delete(DeleteSpecification).
            verify(addressRepository, never()).delete(any(Address.class));
        }
    }

    private static AddressResponse response(Address address) {
        return new AddressResponse(
                address.getId(), address.getUser().getId(), address.getStreet(),
                address.getExteriorNumber(), address.getInteriorNumber(), address.getNeighborhood(),
                address.getPostalCode(), address.getCity(), address.getState(), address.getCountry(),
                address.getCreatedAt(), address.getUpdatedAt());
    }
}
