package com.orgskills.intelligence.integration;

import com.orgskills.intelligence.config.CacheNames;
import com.orgskills.intelligence.dto.role.RoleCompetencyRequest;
import com.orgskills.intelligence.dto.skill.SkillRequest;
import com.orgskills.intelligence.dto.skill.SkillResponse;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.service.AnalyticsCacheInvalidator;
import com.orgskills.intelligence.service.RoleCompetencyService;
import com.orgskills.intelligence.service.SkillService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * The behavioural contract of the cache layer, asserted rather than measured.
 *
 * <p>These tests run against the in-memory cache manager the test profile selects, not Redis.
 * That is deliberate and it is not a weakened test: {@code @Cacheable} and {@code @CacheEvict}
 * are interpreted by the same Spring cache interceptor whichever {@code CacheManager} sits
 * behind it, so a miss, a hit and an eviction are all exercised for real here. What it cannot
 * cover is the Redis-specific half - value serialisation, the per-cache TTLs, connection
 * failure - which is why {@code RedisCacheConfig} hands the serialiser a Jackson mapper that
 * understands {@code java.time} and installs an error handler that degrades instead of throwing.
 *
 * <p>Every assertion counts repository calls rather than timing anything. A cache that is
 * working is one the database was not asked about; wall-clock timings on a developer machine
 * would prove nothing either way.
 */
@SpringBootTest
@TestPropertySource(properties = "spring.cache.type=simple")
@DisplayName("Caching: catalogue reads are served from cache and writes invalidate it")
class CachingIntegrationTest {

    @Autowired
    private SkillService skillService;

    @Autowired
    private RoleCompetencyService roleCompetencyService;

    @Autowired
    private AnalyticsCacheInvalidator analyticsCacheInvalidator;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private RoleCompetencyRepository roleCompetencyRepository;

    /**
     * A spy rather than a mock: the service under test still has to read and write real rows,
     * and the only thing being observed is how often it goes to the database.
     */
    @SpyBean
    private SkillRepository skillRepository;

    @BeforeEach
    void resetCachesAndCounters() {
        cacheManager.getCacheNames().forEach(name -> {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        });
        clearInvocations(skillRepository);
    }

    @Test
    @DisplayName("the second read of the skill catalogue does not reach the database")
    void repeatedCatalogueReadsHitTheCache() {
        List<SkillResponse> first = skillService.getAllSkills(null);
        verify(skillRepository, times(1)).findAll();

        for (int i = 0; i < 20; i++) {
            List<SkillResponse> repeat = skillService.getAllSkills(null);
            assertThat(repeat).hasSameSizeAs(first);
        }

        // Still one: every read after the first was answered from the cache.
        verify(skillRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("a null category and a blank one share a single cache entry")
    void equivalentFiltersDoNotFragmentTheCache() {
        skillService.getAllSkills(null);
        skillService.getAllSkills("");
        skillService.getAllSkills("   ");

        // The service treats all three as "no filter". If the key were left to the default
        // generator they would occupy three entries holding identical rows, and each would have
        // cost its own query.
        verify(skillRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("a category filter is case insensitive in the cache key, as it is in the query")
    void categoryFilterKeysAreNormalised() {
        skillService.getAllSkills("Programming");
        skillService.getAllSkills("programming");
        skillService.getAllSkills("  PROGRAMMING  ");

        verify(skillRepository, times(1)).findByCategoryIgnoreCase("Programming");
    }

    @Test
    @DisplayName("creating a skill evicts the catalogue so the next read sees it")
    void writesEvictTheCatalogue() {
        List<SkillResponse> before = skillService.getAllSkills(null);
        verify(skillRepository, times(1)).findAll();

        SkillRequest request = new SkillRequest();
        request.setName("Cache Eviction Probe " + System.nanoTime());
        request.setCategory("Testing");
        request.setDescription("Created to prove the catalogue cache is dropped on write");
        SkillResponse created = skillService.create(request);

        List<SkillResponse> after = skillService.getAllSkills(null);

        // The read went back to the database, and the new row is visible rather than the
        // cached list from before the write.
        verify(skillRepository, times(2)).findAll();
        assertThat(after).hasSize(before.size() + 1);
        assertThat(after).extracting(SkillResponse::getId).contains(created.getId());

        skillService.delete(created.getId());
    }

    @Test
    @DisplayName("deleting a skill evicts the catalogue too")
    void deletesEvictTheCatalogue() {
        SkillRequest request = new SkillRequest();
        request.setName("Cache Deletion Probe " + System.nanoTime());
        request.setCategory("Testing");
        SkillResponse created = skillService.create(request);

        List<SkillResponse> withSkill = skillService.getAllSkills(null);
        assertThat(withSkill).extracting(SkillResponse::getId).contains(created.getId());

        skillService.delete(created.getId());

        List<SkillResponse> afterDelete = skillService.getAllSkills(null);
        assertThat(afterDelete).extracting(SkillResponse::getId).doesNotContain(created.getId());
    }

    @Test
    @DisplayName("a competency write clears the analytics caches, not just the competency cache")
    void competencyWritesInvalidateAnalytics() {
        Cache heatmap = cacheManager.getCache(CacheNames.ANALYTICS_TEAM_GAP_HEATMAP);
        assertThat(heatmap).isNotNull();
        heatmap.put("all|all", "a stale matrix");

        Skill skill = skillRepository.save(newSkill("Competency Probe " + System.nanoTime()));
        RoleCompetencyRequest request = new RoleCompetencyRequest();
        request.setJobTitle("Cache Probe Engineer");
        request.setDepartment("Cache Probe Department");
        request.setSkillId(skill.getId());
        request.setRequiredProficiencyLevel(ProficiencyLevel.INTERMEDIATE);

        var created = roleCompetencyService.create(request);

        // A competency is the level a gap is measured against, so changing one moves every gap
        // score derived from it even though no user skill was touched.
        assertThat(heatmap.get("all|all")).isNull();

        roleCompetencyRepository.deleteById(created.getId());
        skillRepository.deleteById(skill.getId());
    }

    @Test
    @DisplayName("the invalidator clears every analytics cache and leaves the catalogue alone")
    void invalidatorClearsOnlyAnalyticsCaches() {
        for (String name : CacheNames.ANALYTICS_CACHES) {
            Cache cache = cacheManager.getCache(name);
            assertThat(cache).isNotNull();
            cache.put("probe", "stale");
        }
        Cache catalogue = cacheManager.getCache(CacheNames.CATALOG_SKILLS);
        assertThat(catalogue).isNotNull();
        catalogue.put("probe", "still valid");

        analyticsCacheInvalidator.invalidateNow();

        for (String name : CacheNames.ANALYTICS_CACHES) {
            assertThat(cacheManager.getCache(name).get("probe"))
                    .as("analytics cache %s should have been cleared", name)
                    .isNull();
        }
        // The catalogue is not derived from gap rows, so recalculating gaps must not throw it
        // away: doing so would turn every gap recalculation into a needless catalogue reload.
        assertThat(catalogue.get("probe")).isNotNull();
    }

    private Skill newSkill(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory("Testing");
        return skill;
    }
}
