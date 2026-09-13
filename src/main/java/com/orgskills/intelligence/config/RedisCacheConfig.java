package com.orgskills.intelligence.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Wires the Redis cache manager that backs {@code @Cacheable} across the service layer.
 *
 * <p>Only the cache <em>store</em> lives here; {@link CachingConfig} owns the
 * {@code @EnableCaching} switch and the error handling. This class is conditional on
 * {@code spring.cache.type=redis}, the runtime default. The test suite sets
 * {@code spring.cache.type=simple} so that {@code mvn test} needs no Redis container, and
 * Spring Boot's own auto configuration supplies an in-memory manager in its place. The caching
 * annotations on the services behave identically against either manager, so the tests still
 * exercise real hit, miss and eviction paths.
 */
@Configuration
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = true)
@Slf4j
public class RedisCacheConfig {

    @Value("${cache.ttl.catalog-minutes:60}")
    private long catalogTtlMinutes;

    @Value("${cache.ttl.analytics-minutes:10}")
    private long analyticsTtlMinutes;

    @Value("${cache.ttl.default-minutes:30}")
    private long defaultTtlMinutes;

    /**
     * The mapper used for cache values, kept separate from the one that serialises HTTP
     * responses.
     *
     * <p>Two settings here are what make a cached value readable again rather than a
     * {@code LinkedHashMap} that blows up on the way out. Default typing writes the concrete
     * class alongside the JSON, which is the only way a generic {@code Object} value from
     * {@code @Cacheable} can be reconstructed as the DTO it started as. The JSR-310 module
     * handles the {@code Instant} and {@code LocalDateTime} fields that the heatmap and
     * analytics responses carry - without it, writing those values fails outright.
     *
     * <p>The typing has to be {@code EVERYTHING} rather than the more usual {@code NON_FINAL},
     * and the difference is not academic. The services here return {@code List.of(...)} and
     * {@code Stream.toList()}, whose implementation classes are final, so {@code NON_FINAL}
     * writes them with no type id at all - while the reader, whose declared type is
     * {@code Object}, still demands one. Every such value fails on the way back out. The
     * failure is invisible in normal operation: the error handler swallows it and the request
     * is served from the database, so the only symptom is a cache that never produces a hit.
     * With {@code EVERYTHING} the id is always written, and Jackson substitutes a concrete
     * implementation (an {@code ArrayList}, an unmodifiable map) when reading an immutable one
     * back. It also keeps the type ids on boxed numbers, which is what stops a {@code Long} in
     * the summary-metrics map returning as an {@code Integer}.
     */
    public static ObjectMapper cacheObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY);
        return mapper;
    }

    /**
     * The serialiser used for every cached value.
     *
     * <p>Exposed as a bean, and built from a static factory, so that the round trip it performs
     * can be asserted against the real DTOs without standing up Redis. That round trip is the
     * part of this configuration most likely to break silently: it fails on the value being
     * written, so the first sign of trouble is a cache that never fills.
     */
    @Bean
    public RedisSerializer<Object> cacheValueSerializer() {
        return new GenericJackson2JsonRedisSerializer(cacheObjectMapper());
    }

    private RedisCacheConfiguration baseConfiguration(Duration ttl, RedisSerializer<Object> valueSerializer) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(valueSerializer))
                // A null is what a lookup returns when the row is genuinely absent. Caching it
                // would keep answering "absent" for the rest of the window after the row is
                // created, which is the one answer that is certain to be wrong.
                .disableCachingNullValues();
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory,
                                          RedisSerializer<Object> cacheValueSerializer) {
        Duration catalogTtl = Duration.ofMinutes(catalogTtlMinutes);
        Duration analyticsTtl = Duration.ofMinutes(analyticsTtlMinutes);

        Map<String, RedisCacheConfiguration> perCache = new HashMap<>();
        perCache.put(CacheNames.CATALOG_SKILLS, baseConfiguration(catalogTtl, cacheValueSerializer));
        perCache.put(CacheNames.CATALOG_COMPETENCIES, baseConfiguration(catalogTtl, cacheValueSerializer));
        perCache.put(CacheNames.CATALOG_COURSES, baseConfiguration(catalogTtl, cacheValueSerializer));
        for (String analyticsCache : CacheNames.ANALYTICS_CACHES) {
            perCache.put(analyticsCache, baseConfiguration(analyticsTtl, cacheValueSerializer));
        }

        log.info("Redis cache manager configured: catalog TTL {}m, analytics TTL {}m",
                catalogTtlMinutes, analyticsTtlMinutes);

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(baseConfiguration(Duration.ofMinutes(defaultTtlMinutes), cacheValueSerializer))
                .withInitialCacheConfigurations(perCache)
                .build();
    }

}
