package com.orgskills.intelligence.service;

import com.orgskills.intelligence.config.CacheNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Clears the derived analytics caches once the data they were derived from has actually changed.
 *
 * <p>This exists instead of a {@code @CacheEvict} on each write method because of ordering. A
 * declarative eviction fires when the annotated method returns, which is <em>before</em> its
 * transaction commits. In that window a concurrent read still sees the old rows, misses the
 * cache it was just told to drop, and refills it with exactly the stale answer the eviction was
 * meant to remove - a race that leaves a dashboard wrong until the entry expires, and one that
 * is close to impossible to reproduce on demand. Deferring the clear to after commit closes it:
 * by then any reader that repopulates the cache is reading the new rows.
 *
 * <p>The same reasoning rules out annotating the skill and assessment writes directly. Those
 * requests recompute the affected person's gaps <em>after</em> their own transaction commits, so
 * an eviction tied to the write method would run before the numbers it invalidates had even been
 * calculated. Hooking the recomputation itself is what makes the clear land in the right order.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsCacheInvalidator {

    private final CacheManager cacheManager;

    /**
     * Clears the analytics caches, deferring until the current transaction commits when there is
     * one.
     *
     * <p>Registered per transaction rather than per call: a bulk operation that recalculates
     * fifty people's gaps in one transaction should clear the caches once at the end, not fifty
     * times over.
     */
    public void invalidateAfterCommit() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            invalidateNow();
            return;
        }
        if (Boolean.TRUE.equals(TransactionSynchronizationManager.getResource(this))) {
            return;
        }
        TransactionSynchronizationManager.bindResource(this, Boolean.TRUE);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                TransactionSynchronizationManager.unbindResourceIfPossible(AnalyticsCacheInvalidator.this);
                // Cleared on rollback as well as on commit. Dropping a cache that did not need
                // dropping costs one recomputation; keeping one that did is a wrong dashboard.
                invalidateNow();
            }
        });
    }

    /** Clears the analytics caches immediately, without regard to any surrounding transaction. */
    public void invalidateNow() {
        for (String cacheName : CacheNames.ANALYTICS_CACHES) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        }
        log.debug("Analytics caches cleared after a change to skills, competencies or gaps");
    }
}
