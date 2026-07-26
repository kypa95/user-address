package com.useraddress.user_address.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The regexes the DTOs validate with. They are the same rules the frontend
 * applies, so a change here that is not mirrored there lets the form accept
 * what the API will reject.
 */
class ValidationPatternsTest {

    @Nested
    @DisplayName("CURP")
    class Curp {

        @ParameterizedTest
        @ValueSource(strings = {
                "LOGS900101MDFPRN09",  // second letter a vowel
                "LOXS900101MDFPRN09",  // X stands in when there is no internal vowel
                "MAGM851231MJCRRR05",  // woman, Jalisco, last day of the year
                "SOAL000229HNERLS01",  // born abroad (NE)
        })
        void accepts(String curp) {
            assertThat(curp).matches(ValidationPatterns.CURP);
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "LOGS900101MDFPRN0",   // 17 characters
                "PBLJ900101HDFRPN09",  // second letter is not a vowel nor X
                "LOGS901301MDFPRN09",  // month 13
                "LOGS900132MDFPRN09",  // day 32
                "LOGS900101XDFPRN09",  // sex is neither H nor M
                "LOGS900101MZZPRN09",  // state code does not exist
                "LOGS900101MDFPRA09",  // A is a vowel, not a consonant
                "pelj900101hdfrpn09",  // lowercase
        })
        void rejects(String curp) {
            assertThat(curp).doesNotMatch(ValidationPatterns.CURP);
        }
    }

    @Nested
    @DisplayName("RFC")
    class Rfc {

        @ParameterizedTest
        @ValueSource(strings = {
                "LOGS900101AB1",  // individual, 13 characters
                "ABC900101AB1",   // company, 12 characters
                "ÑAAA900101AB1",  // Ñ is a valid initial
        })
        void accepts(String rfc) {
            assertThat(rfc).matches(ValidationPatterns.RFC);
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "PE900101AB1",     // only two letters
                "LOGS901301AB1",   // month 13
                "LOGS900101AB",    // homoclave too short
                "pelj900101ab1",   // lowercase
        })
        void rejects(String rfc) {
            assertThat(rfc).doesNotMatch(ValidationPatterns.RFC);
        }
    }

    @Nested
    @DisplayName("phone number")
    class PhoneNumber {

        @ParameterizedTest
        @ValueSource(strings = {
                "+525512345678",  // E.164, what CustomPhoneInput sends
                "+14155552671",   // any country
                "5512345678",     // Mexican national number
                "55 1234 5678",   // with separators
                "(55) 1234-5678",
        })
        void accepts(String phone) {
            assertThat(phone).matches(ValidationPatterns.PHONE_NUMBER);
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "551234567",     // 9 digits
                "55123456789",   // 11 digits
                "+0525512345678",// E.164 never starts with zero
                "55-1234-567a",  // a letter
                "",
        })
        void rejects(String phone) {
            assertThat(phone).doesNotMatch(ValidationPatterns.PHONE_NUMBER);
        }
    }

    @Nested
    @DisplayName("email")
    class Email {

        @ParameterizedTest
        @ValueSource(strings = {
                "sonia.lopez@example.com",
                "sonia+etiqueta@sub.example.mx",
        })
        void accepts(String email) {
            assertThat(email).matches(ValidationPatterns.EMAIL);
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "sonia@example",     // no TLD; jakarta's @Email would accept this
                "sonia@example.c",   // one-letter TLD
                "sonia example.com", // a space
                "@example.com",
        })
        void rejects(String email) {
            assertThat(email).doesNotMatch(ValidationPatterns.EMAIL);
        }
    }

    @Nested
    @DisplayName("postal code")
    class PostalCode {

        @ParameterizedTest
        @ValueSource(strings = {"03100", "44100"})
        void accepts(String postalCode) {
            assertThat(postalCode).matches(ValidationPatterns.POSTAL_CODE);
        }

        @ParameterizedTest
        @ValueSource(strings = {"3100", "031000", "0310a"})
        void rejects(String postalCode) {
            assertThat(postalCode).doesNotMatch(ValidationPatterns.POSTAL_CODE);
        }
    }
}
