package com.useraddress.user_address.address.mapper;

import org.springframework.stereotype.Component;

import com.useraddress.user_address.address.dto.AddressRequest;
import com.useraddress.user_address.address.dto.AddressResponse;
import com.useraddress.user_address.address.entity.Address;
import com.useraddress.user_address.user.entity.User;

@Component
public class AddressMapper {

    public Address toEntity(AddressRequest request, User user) {
        return Address.builder()
                .user(user)
                .street(request.street().trim())
                .exteriorNumber(request.exteriorNumber().trim())
                .interiorNumber(normalize(request.interiorNumber()))
                .neighborhood(request.neighborhood().trim())
                .postalCode(request.postalCode().trim())
                .city(request.city().trim())
                .state(request.state().trim())
                .country(request.country().trim())
                .build();
    }

    public void updateEntity(Address address, AddressRequest request) {
        address.setStreet(request.street().trim());
        address.setExteriorNumber(request.exteriorNumber().trim());
        address.setInteriorNumber(normalize(request.interiorNumber()));
        address.setNeighborhood(request.neighborhood().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setCountry(request.country().trim());
    }

    public AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getUser().getId(),
                address.getStreet(),
                address.getExteriorNumber(),
                address.getInteriorNumber(),
                address.getNeighborhood(),
                address.getPostalCode(),
                address.getCity(),
                address.getState(),
                address.getCountry(),
                address.getCreatedAt(),
                address.getUpdatedAt());
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
