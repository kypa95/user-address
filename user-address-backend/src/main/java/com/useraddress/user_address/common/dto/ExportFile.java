package com.useraddress.user_address.common.dto;

/**
 * A generated file ready to be sent as a download.
 *
 * <p>Carries the name alongside the bytes because only the service knows the
 * domain data the name is built from — the owner of the addresses, for example.
 *
 * @param fileName name offered to the browser in the Content-Disposition header
 * @param content  the file itself
 */
public record ExportFile(String fileName, byte[] content) {
}
