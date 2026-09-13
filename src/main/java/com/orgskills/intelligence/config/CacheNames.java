package com.orgskills.intelligence.config;

/**
 * The cache names used across the application, in one place.
 *
 * <p>A cache name is a contract between the method that fills a cache and every method that has
 * to empty it again, and those two live in different classes: {@code SkillService} fills the
 * skill catalogue, but a change to a user's skills is what makes the analytics matrices wrong.
 * Spelling the names as literals at each site is how a write ends up evicting a cache that no
 * read ever populated - the annotation still compiles, the eviction still "succeeds", and the
 * stale entry is served until its time to live runs out. Constants make that mismatch a
 * compile error instead.
 *
 * <p>The {@code group:name} shape gives the underlying Redis keys a readable prefix
 * ({@code catalogs:skills::<key>}), so a {@code SCAN MATCH catalogs:*} during an incident shows
 * which family of entries is involved.
 */
public final class CacheNames {

    /** Reference data: changes only when somebody edits it, so it is evicted on write. */
    public static final String CATALOG_SKILLS = "catalogs:skills";
    public static final String CATALOG_COMPETENCIES = "catalogs:competencies";
    public static final String CATALOG_COURSES = "catalogs:courses";

    /**
     * Derived views: recomputed from whatever skills and assessments happen to be recorded, so
     * every write that moves a proficiency or a gap has to evict them.
     */
    public static final String ANALYTICS_TEAM_GAP_HEATMAP = "analytics:team_gap_heatmap";
    public static final String ANALYTICS_DEPARTMENT_COVERAGE = "analytics:department_coverage";
    public static final String ANALYTICS_ORGANIZATION_GAP = "analytics:organization_gap";

    /** Every analytics cache, for the writes that invalidate all of them at once. */
    public static final String[] ANALYTICS_CACHES = {
            ANALYTICS_TEAM_GAP_HEATMAP,
            ANALYTICS_DEPARTMENT_COVERAGE,
            ANALYTICS_ORGANIZATION_GAP
    };

    private CacheNames() {
    }
}
