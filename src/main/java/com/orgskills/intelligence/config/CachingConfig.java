package com.orgskills.intelligence.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
import org.springframework.context.annotation.Configuration;

/**
 * Turns on declarative caching and decides what happens when the cache itself misbehaves.
 *
 * <p>This is deliberately separate from {@link RedisCacheConfig}. {@code @EnableCaching} has to
 * be unconditional: Spring Boot's cache auto configuration only engages when it finds the
 * caching infrastructure already switched on, so putting this annotation on the Redis-only
 * configuration would silently turn every {@code @Cacheable} into a plain method call whenever
 * Redis is not the chosen provider - the test suite included, which would then be verifying
 * nothing. Here the annotations are always active and only the store behind them changes.
 *
 * <p>Implementing {@link CachingConfigurer} is likewise not decorative. A bare
 * {@code CacheErrorHandler} bean is never consulted; the handler is only adopted when it
 * arrives through this interface.
 */
@Configuration
@EnableCaching
@Slf4j
public class CachingConfig implements CachingConfigurer {

    /**
     * Keeps a cache outage out of the request path.
     *
     * <p>The default handler rethrows, so an unreachable Redis would turn every annotated read
     * into a 500 even though the database behind it is healthy and holds the same answer.
     * Failures are logged and swallowed instead, which degrades the application to uncached
     * reads rather than taking it down.
     *
     * <p>A failed <em>eviction</em> is the one case worth separating out. The write that
     * triggered it has already committed, so the database is correct and only the cached copy
     * is wrong; it is logged at error level because that entry will keep being served until its
     * time to live expires. That is the reason the analytics caches are given a short one.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new SimpleCacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache read failed for {}[{}], falling through to the database: {}",
                        cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key,
                                            Object value) {
                log.warn("Cache write failed for {}[{}], the response is unaffected: {}",
                        cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.error("Cache eviction failed for {}[{}]; stale entries will be served until "
                        + "their TTL expires: {}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.error("Cache clear failed for {}; stale entries will be served until their "
                        + "TTL expires: {}", cache.getName(), exception.getMessage());
            }
        };
    }
}
