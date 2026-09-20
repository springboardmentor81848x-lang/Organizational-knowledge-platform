package com.okip.service.preferences;
import com.okip.dto.preferences.EmployeePreferencesDTO;
public interface PreferencesService { EmployeePreferencesDTO getMine(); EmployeePreferencesDTO update(EmployeePreferencesDTO dto); }
