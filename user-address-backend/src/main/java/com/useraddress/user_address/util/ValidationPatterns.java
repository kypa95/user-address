package com.useraddress.user_address.util;

/**
 * Regular expressions shared by the DTOs. They live here so the same rule is
 * never written twice and stays aligned with the ones the frontend applies in
 * {@code src/utils/validators.js}.
 **/
public final class ValidationPatterns {

    private ValidationPatterns() {
    }

    /** The 32 state codes a CURP can carry, plus NE for people born abroad. */
    private static final String CURP_STATES =
            "AS|BC|BS|CC|CH|CL|CM|CS|DF|DG|GR|GT|HG|JC|MC|MN|MS|NE|NL|OC|PL|QR|QT|SL|SP|SR|TC|TL|TS|VZ|YN|ZS";

    /** Consonants only: the three letters taken from the surnames and given name. */
    private static final String CONSONANT = "[B-DF-HJ-NP-TV-Z]";

    /**
     * CURP, 18 characters:
     * initial + first internal vowel + two initials, birth date YYMMDD, sex,
     * state code, three internal consonants, homoclave and check digit.
     */
    public static final String CURP =
            "^[A-Z][AEIOUX][A-Z]{2}"
                    + "\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])"
                    + "[HM]"
                    + "(?:" + CURP_STATES + ")"
                    + CONSONANT + "{3}"
                    + "[A-Z\\d]\\d$";

    /**
     * RFC, 12 or 13 characters: three letters for a company or four for an
     * individual, birth or incorporation date, and homoclave.
     */
    public static final String RFC =
            "^[A-ZÑ&]{3,4}"
                    + "\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])"
                    + "[A-Z\\d]{3}$";

    /**
     * Phone number, in either of two shapes:
     *
     * <ul>
     *   <li>E.164, what the frontend's CustomPhoneInput sends: a plus sign and
     *       8 to 15 digits, any country — "+525512345678".</li>
     *   <li>A Mexican national number with separators, kept so rows and API
     *       clients that predate that field keep validating — "55 1234 5678".</li>
     * </ul>
     */
    public static final String PHONE_NUMBER =
            "^(?:\\+[1-9]\\d{7,14}"
                    + "|(?:\\+?52[\\s.-]?)?(?=(?:\\D*\\d){10}\\D*$)[\\d\\s().-]+)$";

    /**
     * Email. Deliberately permissive on the local part, strict on the shape:
     * jakarta's @Email accepts values like "a@b" that no mail server would route.
     */
    public static final String EMAIL = "^[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,}$";

    /** Postal code: 5 digits in Mexico. */
    public static final String POSTAL_CODE = "^\\d{5}$";
}
