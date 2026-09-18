package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * What an import actually did.
 *
 * <p>The import endpoints used to return only the courses that were saved, which meant a row the
 * parser dropped - one with no title, say - disappeared without trace, and re-importing the same
 * file looked identical to importing new material. Neither the count of rows read nor the reason
 * anything was rejected reached the caller.
 *
 * <p>Every row read is accounted for: {@code created + updated + skipped == rowsRead}, and each
 * skipped row carries its line number and the reason it was rejected.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogImportResult {

    /** Where the courses came from: the uploaded filename, or the provider that was called. */
    private String source;

    /** True when the source was a live provider fetch rather than an uploaded file. */
    private boolean fromProvider;

    /**
     * Set when a provider fetch failed outright - the call could not be made, or the provider
     * answered with an error. Distinct from a provider that answered with no courses.
     */
    private String providerError;

    /** Rows read from the file, or courses returned by the provider. */
    private int rowsRead;

    /** Courses that did not exist in the catalogue before and now do. */
    private int created;

    /** Courses already in the catalogue whose details were refreshed from this import. */
    private int updated;

    /** Rows that produced no course, each with a reason below. */
    private int skipped;

    private List<ImportRowError> errors;

    /** The courses now in the catalogue as a result, whether created or updated. */
    private List<ExternalCourseResponse> courses;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportRowError {
        /** 1-based line in the uploaded file, counting the header. Null for a provider fetch. */
        private Integer line;
        /** Whatever title the row carried, so the reader can find it in their own file. */
        private String title;
        private String reason;
    }
}
