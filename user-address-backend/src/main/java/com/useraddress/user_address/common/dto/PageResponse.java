package com.useraddress.user_address.common.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Slice of a paginated listing.")
public record PageResponse<T>(

        @Schema(description = "Records of the current page")
        List<T> content,

        @Schema(description = "Current page, zero based", example = "0")
        int page,

        @Schema(description = "Records requested per page", example = "10")
        int size,

        @Schema(description = "Total records matching the query", example = "37")
        long totalElements,

        @Schema(description = "Total pages available", example = "4")
        int totalPages,

        @Schema(description = "True when this is the first page", example = "true")
        boolean first,

        @Schema(description = "True when this is the last page", example = "false")
        boolean last) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
