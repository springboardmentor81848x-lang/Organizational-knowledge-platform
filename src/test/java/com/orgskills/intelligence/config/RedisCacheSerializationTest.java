package com.orgskills.intelligence.config;

import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixCellResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse;
import com.orgskills.intelligence.dto.skill.SkillResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves that the values the application caches survive the trip through Redis.
 *
 * <p>This is the half of the cache layer the integration test cannot reach. Against the
 * in-process cache manager a value is simply the same object again, so serialisation is never
 * exercised; against Redis it is written as JSON and read back as a new instance, and if either
 * direction fails the symptom is a cache that quietly never fills - the request still succeeds,
 * just always from the database.
 *
 * <p>The two settings under test are the ones that a default {@code
 * GenericJackson2JsonRedisSerializer} gets wrong for these DTOs. Without the JSR-310 module the
 * {@code Instant} on the heatmap response cannot be written at all. Without default typing the
 * JSON comes back as a {@code LinkedHashMap}, which is assignable to the {@code Object} that
 * Spring's cache abstraction hands back and so fails later, at the cast in the calling method,
 * rather than here where it would be obvious.
 */
@DisplayName("Redis cache serialisation: cached DTOs round trip intact")
class RedisCacheSerializationTest {

    private final RedisSerializer<Object> serializer =
            new GenericJackson2JsonRedisSerializer(RedisCacheConfig.cacheObjectMapper());

    @SuppressWarnings("unchecked")
    private <T> T roundTrip(T value) {
        byte[] written = serializer.serialize(value);
        assertThat(written).isNotNull().isNotEmpty();
        return (T) serializer.deserialize(written);
    }

    @Test
    @DisplayName("a list of catalogue DTOs comes back as the DTO type, not a map")
    void skillListRoundTrips() {
        List<SkillResponse> original = List.of(
                SkillResponse.builder().id(1L).name("Java").category("Programming")
                        .description("JVM language").build(),
                SkillResponse.builder().id(2L).name("Kubernetes").category("Platform").build());

        Object restored = roundTrip((Object) original);

        assertThat(restored).isInstanceOf(List.class);
        List<?> restoredList = (List<?>) restored;
        assertThat(restoredList).hasSize(2);
        // The element type is the point of the assertion: default typing is what stops this
        // being a LinkedHashMap that only fails at the caller's cast.
        assertThat(restoredList.get(0)).isInstanceOf(SkillResponse.class);
        assertThat(((SkillResponse) restoredList.get(0)).getName()).isEqualTo("Java");
        assertThat(((SkillResponse) restoredList.get(1)).getCategory()).isEqualTo("Platform");
    }

    @Test
    @DisplayName("the heatmap response, Instant field and nested collections included, round trips")
    void heatmapResponseRoundTrips() {
        Instant generatedAt = Instant.parse("2026-01-15T09:30:00Z");
        HeatmapMatrixResponse original = HeatmapMatrixResponse.builder()
                .scope("ORG")
                .scopeName("Organisation")
                .totalUsers(2)
                .totalSkills(1)
                .skills(List.of(new HeatmapMatrixResponse.SkillHeader()))
                .users(List.of(new HeatmapMatrixResponse.UserHeader()))
                .matrix(List.of(new HeatmapMatrixCellResponse()))
                .levelCounts(Map.of("HIGH", 3L, "LOW", 1L))
                .colorLegend(Map.of("HIGH", "#22c55e"))
                .generatedAt(generatedAt)
                .build();

        HeatmapMatrixResponse restored = roundTrip(original);

        assertThat(restored).isNotNull();
        assertThat(restored.getScope()).isEqualTo("ORG");
        assertThat(restored.getTotalUsers()).isEqualTo(2);
        // An Instant is what a stock ObjectMapper refuses to write; a mismatch here would mean
        // the JavaTimeModule registration had been dropped.
        assertThat(restored.getGeneratedAt()).isEqualTo(generatedAt);
        assertThat(restored.getLevelCounts()).containsEntry("HIGH", 3L);
        assertThat(restored.getColorLegend()).containsEntry("HIGH", "#22c55e");
        assertThat(restored.getMatrix()).hasSize(1);
        assertThat(restored.getMatrix().get(0)).isInstanceOf(HeatmapMatrixCellResponse.class);
    }

    @Test
    @DisplayName("the summary-metrics map keeps its numeric types rather than widening them")
    void summaryMetricsMapRoundTrips() {
        Map<String, Object> original = Map.of(
                "totalCells", 120L,
                "highPercentage", 42.5,
                "scope", "ORG");

        Object restored = roundTrip((Object) original);

        assertThat(restored).isInstanceOf(Map.class);
        Map<?, ?> restoredMap = (Map<?, ?>) restored;
        // getHeatmapSummaryMetrics returns Map<String, Object>, and its callers read the values
        // back out at their original types. Losing a Long to an Integer here would surface as a
        // ClassCastException in a dashboard rather than anywhere near the cache.
        assertThat(restoredMap.get("totalCells")).isEqualTo(120L);
        assertThat(restoredMap.get("highPercentage")).isEqualTo(42.5);
        assertThat(restoredMap.get("scope")).isEqualTo("ORG");
    }
}
