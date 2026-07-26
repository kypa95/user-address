package com.useraddress.user_address.address.export;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.function.Function;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.useraddress.user_address.address.entity.Address;

/**
 * Builds the .xlsx file with the addresses of a single user.
 *
 * <p>Rows are pulled from the database in chunks and flushed to disk by
 * {@link SXSSFWorkbook}, so the export never holds the whole result in memory.
 */
@Component
public class AddressExcelExporter {

    private static final String SHEET_NAME = "Direcciones";

    private static final String[] HEADERS = {
            "Calle",
            "Núm. exterior",
            "Núm. interior",
            "Colonia",
            "Estado",
            "Ciudad",
            "C.P.",
            "País",
            "Fecha de registro",
            "Última actualización"
    };

    /** Rows fetched per query, and rows kept in memory by SXSSF before flushing. */
    private static final int CHUNK_SIZE = 200;

    /**
     * Paging without an explicit order lets the database return rows in any
     * sequence, which across pages can repeat one row and drop another.
     */
    private static final Sort ORDER = Sort.by(Sort.Direction.ASC, "createdAt");

    private static final String DATE_PATTERN = "dd/mm/yyyy hh:mm";

    /**
     * Writes every address the loader returns into a workbook.
     *
     * @param pageLoader supplies a page of addresses for the requested {@link Pageable};
     *                   it is called until the last page is consumed
     * @return the .xlsx file as a byte array
     * @throws IOException when the workbook cannot be written
     */
    public byte[] export(Function<Pageable, Page<Address>> pageLoader) throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(CHUNK_SIZE);
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            SXSSFSheet sheet = workbook.createSheet(SHEET_NAME);
            // autoSizeColumn needs the widths tracked while rows are still in memory.
            sheet.trackAllColumnsForAutoSizing();

            CellStyle headerStyle = headerStyle(workbook);
            CellStyle dateStyle = dateStyle(workbook);

            writeHeader(sheet, headerStyle);

            int rowIndex = 1;
            int pageNumber = 0;
            Page<Address> page;

            do {
                page = pageLoader.apply(PageRequest.of(pageNumber, CHUNK_SIZE, ORDER));
                for (Address address : page.getContent()) {
                    writeAddress(sheet.createRow(rowIndex++), address, dateStyle);
                }
                pageNumber++;
            } while (page.hasNext());

            finishSheet(sheet);
            workbook.write(out);

            // Removes the temporary files SXSSF wrote while streaming.
            workbook.dispose();
            return out.toByteArray();
        }
    }

    private void writeHeader(Sheet sheet, CellStyle style) {
        Row header = sheet.createRow(0);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(HEADERS[i]);
            cell.setCellStyle(style);
        }
    }

    private void writeAddress(Row row, Address address, CellStyle dateStyle) {
        row.createCell(0).setCellValue(address.getStreet());
        row.createCell(1).setCellValue(address.getExteriorNumber());
        row.createCell(2).setCellValue(
                address.getInteriorNumber() == null ? "" : address.getInteriorNumber());
        row.createCell(3).setCellValue(address.getNeighborhood());
        row.createCell(4).setCellValue(address.getState());
        row.createCell(5).setCellValue(address.getCity());
        row.createCell(6).setCellValue(address.getPostalCode());
        row.createCell(7).setCellValue(address.getCountry());
        writeDate(row.createCell(8), address.getCreatedAt(), dateStyle);
        writeDate(row.createCell(9), address.getUpdatedAt(), dateStyle);
    }

    private void writeDate(Cell cell, LocalDateTime value, CellStyle style) {
        cell.setCellStyle(style);
        if (value != null) {
            cell.setCellValue(value);
        }
    }

    /**
     * No autofilter on purpose: the rows already come in the order the listing
     * defines, and letting Excel re-sort them would lose it.
     */
    private void finishSheet(Sheet sheet) {
        for (int i = 0; i < HEADERS.length; i++) {
            sheet.autoSizeColumn(i);
            // autoSizeColumn ignores the padding Excel adds around the text.
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 768, 255 * 256));
        }

        // Keeps the header visible while scrolling.
        sheet.createFreezePane(0, 1);
    }

    private CellStyle headerStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());

        XSSFCellStyle style = (XSSFCellStyle) workbook.createCellStyle();
        style.setFont(font);
        // Brand primary (#3E5C76), matching the frontend theme.
        style.setFillForegroundColor(new XSSFColor(new byte[] { 0x3E, 0x5C, 0x76 }, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle dateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat(DATE_PATTERN));
        return style;
    }
}
