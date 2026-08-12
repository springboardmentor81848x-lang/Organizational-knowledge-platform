package com.kgap.intel.api;

import com.kgap.intel.models.SkillGapResponse;
import com.kgap.intel.models.HeatmapResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface GapApiService {
    @GET("skill-gaps")
    Call<List<SkillGapResponse>> getAllGaps();

    @GET("skill-gaps/employee/{employeeId}")
    Call<List<SkillGapResponse>> getEmployeeGaps(@Path("employeeId") Long employeeId);

    @GET("skill-gaps/level/{gapLevel}")
    Call<List<SkillGapResponse>> getGapsByLevel(@Path("gapLevel") String gapLevel);

    @GET("heatmap")
    Call<List<HeatmapResponse>> getHeatmapData();

    @GET("heatmap/employee/{employeeId}")
    Call<List<HeatmapResponse>> getHeatmapByEmployee(@Path("employeeId") Long employeeId);
}
