package com.kgap.intel.utils;

public class ValidationUtils {
    public static boolean isValidPassword(String password) {
        return password.length() >= 8 && password.matches(".*\\d.*") && password.matches(".*[A-Z].*");
    }
}
