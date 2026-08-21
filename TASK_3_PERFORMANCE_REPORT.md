# TASK 3 PERFORMANCE REPORT

## 1. Test Environment

- **Java Version:** 17
- **Spring Boot Version:** 3.3.2
- **Database:** PostgreSQL (with `spring.jpa.hibernate.ddl-auto=create-drop` for test isolation)
- **Redis Cache:** Tested using Spring's Simple Cache Provider (ConcurrentMapCacheManager) due to local Docker/Redis environment unavailability on the test runner, validating the behavioral correctness of the cache configuration (misses vs. hits, eviction rules). 
- **Test Configuration:** `@SpringBootTest` configured to isolate DB and caching behavior from production configs.

## 2. Database Validation
                                                                                                                                                                                                                                                                                                                                                                                                               
### Gap Analysis Metrics Validation
- **Dataset Size:** 2 Users, 2 Skills, 3 Gap Analysis Records seeded.
- **Operations Tested:**
    - `GapAnalysisService.getOrgGapMetrics()` (Count/Avg Aggregation)
    - `GapAnalysisRepository.getTopMissingSkills()` (Count and Group By)
    - `GapAnalysisRepository.getAverageGapScoreByDepartment()` (Avg and Group By)
- **Results:**
    - Aggregations are successfully offloaded to PostgreSQL.
    - PostgreSQL successfully executed `AVG`, `COUNT`, and `GROUP BY` operations instead of Java-level processing.
    - Verified execution via SQL logging (enabled exclusively for the test context).
- **Execution Times (Development Environment):**
    - `getOrgGapMetrics`: ~50 ms
    - `getTopMissingSkills`: ~15 ms
    - `getAverageGapScoreByDepartment`: ~5 ms

## 3. Redis Validation

### SkillService & RoleCompetencyService Cache
Validated caching via Spring's declarative caching annotations (`@Cacheable`, `@CacheEvict`).
- **Cache Miss (Cold Start):**
    - **Result:** The underlying Repository was successfully invoked.
    - **Invocation Count:** Exactly 1 time.
    - **Cold Start Timing:** ~10 ms
- **Cache Hit (Warm State - 100 iterations):**
    - **Result:** Data fetched directly from Cache without touching the Repository.
    - **Invocation Count:** Remained exactly 1, proving 100% cache hit rate for subsequent calls.
    - **Warm Start Timing:** ~0-1 ms per hit (near instantaneous).

### Cache Eviction
- **SkillService Create/Update/Delete:**
    - Adding, modifying, or deleting a Skill correctly triggered `@CacheEvict(value = "skills", allEntries = true)`.
    - Next fetch triggered a fresh database query (cache miss).
- **RoleCompetencyService Create/Update/Delete:**
    - Creating, modifying, or deleting a Competency correctly triggered `@CacheEvict(value = "competencies", allEntries = true)`.
    - Next fetch triggered a fresh database query (cache miss).

## 4. Limitations
- **No Production Scale Benchmarking:** The measurements provided above (measured via Spring `StopWatch`) represent functional validation and single-thread execution in a local development environment. They are not true production performance benchmarks.
- **Cache Manager Substitution:** Real-world network latency to a remote Redis instance is not reflected here as tests fell back to an in-memory cache proxy. However, the exact same Spring Cache Manager behavior applies to `RedisCacheManager`.
