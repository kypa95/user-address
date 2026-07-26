package com.useraddress.user_address.testsupport;

import java.time.LocalDateTime;
import java.util.List;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.entity.Address;
import com.useraddress.user_address.user.dto.UserRequest;
import com.useraddress.user_address.user.entity.User;

/**
 * Valid fixtures shared by the unit tests, so no test has to hand-write a CURP
 * or an RFC that passes {@code ValidationPatterns}.
 */
public final class TestData {

    public static final String USER_ID = "11111111-1111-1111-1111-111111111111";
    public static final String ADDRESS_ID = "22222222-2222-2222-2222-222222222222";
    public static final String CURP = "LOGS900101MDFPRN09";
    public static final String RFC = "LOGS900101AB1";
    public static final String EMAIL = "sonia.lopez@example.com";

    private TestData() {
    }

    /** A request with every field valid; addresses are left out. */
    public static UserRequest userRequest() {
        return userRequest(null);
    }

    public static UserRequest userRequest(List<AddressRequest> addresses) {
        return new UserRequest(
                "Sonia", "Lopez", "Garcia", CURP, RFC, EMAIL, "+525512345678", addresses);
    }

    public static User user() {
        return user(USER_ID);
    }

    public static User user(String id) {
        return User.builder()
                .id(id)
                .name("Sonia")
                .lastName("Lopez")
                .secondLastName("Garcia")
                .curp(CURP)
                .rfc(RFC)
                .email(EMAIL)
                .phoneNumber("+525512345678")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static AddressRequest addressRequest() {
        return new AddressRequest(
                "Av Universidad", "1234", "5B", "Del Valle", "03100",
                "Ciudad de Mexico", "Ciudad de Mexico", "Mexico");
    }

    public static Address address(User owner) {
        return Address.builder()
                .id(ADDRESS_ID)
                .user(owner)
                .street("Av Universidad")
                .exteriorNumber("1234")
                .interiorNumber("5B")
                .neighborhood("Del Valle")
                .postalCode("03100")
                .city("Ciudad de Mexico")
                .state("Ciudad de Mexico")
                .country("Mexico")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
