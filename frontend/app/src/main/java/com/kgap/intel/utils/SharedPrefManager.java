package com.kgap.intel.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SharedPrefManager {
    private static final String SHARED_PREF_NAME = "kgap_pref";
    private static SharedPrefManager instance;
    private final SharedPreferences sharedPreferences;

    private SharedPrefManager(Context context) {
        sharedPreferences = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized SharedPrefManager getInstance(Context context) {
        if (instance == null) {
            instance = new SharedPrefManager(context);
        }
        return instance;
    }

    public void saveToken(String token) {
        sharedPreferences.edit().putString("token", token).apply();
    }

    public String getToken() {
        return sharedPreferences.getString("token", null);
    }

    public void saveUserName(String name) {
        sharedPreferences.edit().putString("name", name).apply();
    }

    public String getUserName() {
        return sharedPreferences.getString("name", "User");
    }

    public void saveUserEmail(String email) {
        sharedPreferences.edit().putString("email", email).apply();
    }

    public String getUserEmail() {
        return sharedPreferences.getString("email", null);
    }

    public void saveUserId(Long id) {
        sharedPreferences.edit().putLong("userId", id).apply();
    }

    public Long getUserId() {
        return sharedPreferences.getLong("userId", -1L);
    }

    public void saveUserRole(String role) {
        sharedPreferences.edit().putString("role", role).apply();
    }

    public String getUserRole() {
        return sharedPreferences.getString("role", "EMPLOYEE");
    }

    public void setIsLoggedIn(boolean isLoggedIn) {
        sharedPreferences.edit().putBoolean("isLoggedIn", isLoggedIn).apply();
    }

    public boolean isLoggedIn() {
        return sharedPreferences.getBoolean("isLoggedIn", false);
    }

    public void clear() {
        sharedPreferences.edit().clear().apply();
    }
}
