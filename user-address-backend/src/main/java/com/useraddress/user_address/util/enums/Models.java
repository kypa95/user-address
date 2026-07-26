package com.useraddress.user_address.util.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Model names used to build the messages of the responses.
 **/
@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum Models {

    // MODELS //
    USER("user"),
    ADDRESS("address");

    private String value;
}
