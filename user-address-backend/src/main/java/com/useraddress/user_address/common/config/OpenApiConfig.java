package com.useraddress.user_address.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI userAddressOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("User & Address API")
                        .version("v1")
                        .description("""
                                Management of users and their addresses.

                                Every response shares the same envelope: timestamp, message, success,
                                status, code and data. On a failure the field `code` carries a business
                                code from the ErrorCode catalog, not the HTTP status:

                                - 817 INCOMPLETE_DATA: a field of the body did not pass the validation.
                                - 830 MISSING_ARGUMENTS_IN_BODY: the body could not be read.
                                - 1020 USER_EMAIL_ALREADY_EXISTS / 1027 USER_CURP_ALREADY_EXISTS / 1028 USER_RFC_ALREADY_EXISTS.
                                - 2215 JDBC_DUPLICATE_KEY: a unique constraint was rejected by the database.
                                - 3100 USER_NOT_EXISTS.
                                - 3120 ADDRESS_NOT_EXISTS.

                                Deleting a user also deletes every address associated with it.
                                """)
                        .contact(new Contact().name("User Address Team"))
                        .license(new License().name("Proprietary")));
    }
}
