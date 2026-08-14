package com.knowledgeiq.util;

import java.net.URI;
import java.net.InetAddress;
import java.util.regex.Pattern;

public class UrlValidatorUtil {

    private static final Pattern DISALLOWED_SCHEMES = Pattern.compile("^(javascript|data|file|blob|vbscript|about):", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOCAL_OR_INTERNAL_HOSTS = Pattern.compile("^(localhost|.*\\.local|.*\\.internal|.*\\.corp|.*\\.cluster\\.local)$", Pattern.CASE_INSENSITIVE);

    /**
     * Validates and sanitizes an external learning resource URL.
     * 
     * @param urlString The candidate URL string (e.g. from Gemini AI or API request)
     * @return Sanitized URL string if valid and safe, or null if invalid or unsafe.
     */
    public static String sanitizeUrl(String urlString) {
        if (urlString == null) return null;
        String trimmed = urlString.trim();
        if (trimmed.isEmpty() || "null".equalsIgnoreCase(trimmed) || "undefined".equalsIgnoreCase(trimmed)) {
            return null;
        }

        // Reject dangerous non-http schemes immediately
        if (DISALLOWED_SCHEMES.matcher(trimmed).find()) {
            return null;
        }

        try {
            URI uri = URI.create(trimmed);
            String scheme = uri.getScheme();
            if (scheme == null) return null;
            scheme = scheme.toLowerCase();

            // Only allow http and https
            if (!"http".equals(scheme) && !"https".equals(scheme)) {
                return null;
            }

            String host = uri.getHost();
            if (host == null || host.trim().isEmpty()) {
                return null;
            }
            host = host.toLowerCase().trim();

            // Reject localhost / internal domain patterns
            if (LOCAL_OR_INTERNAL_HOSTS.matcher(host).matches()) {
                return null;
            }

            // Reject loopback and private IPv4 / IPv6 addresses (SSRF mitigation)
            if (isPrivateOrLoopbackHost(host)) {
                return null;
            }

            return trimmed;
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean isValidExternalUrl(String urlString) {
        return sanitizeUrl(urlString) != null;
    }

    private static boolean isPrivateOrLoopbackHost(String host) {
        if ("127.0.0.1".equals(host) || "0.0.0.0".equals(host) || "::1".equals(host)) {
            return true;
        }

        // Direct IP check
        try {
            // Check if host matches IPv4 format (e.g. 10.x.x.x, 192.168.x.x, 172.16-31.x.x, 169.254.x.x)
            if (host.matches("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$")) {
                String[] parts = host.split("\\.");
                int p0 = Integer.parseInt(parts[0]);
                int p1 = Integer.parseInt(parts[1]);

                if (p0 == 10) return true; // 10.0.0.0/8
                if (p0 == 127) return true; // 127.0.0.0/8
                if (p0 == 169 && p1 == 254) return true; // 169.254.0.0/16 Link-local / AWS metadata
                if (p0 == 172 && p1 >= 16 && p1 <= 31) return true; // 172.16.0.0/12
                if (p0 == 192 && p1 == 168) return true; // 192.168.0.0/16
                if (p0 == 0) return true;
            }
        } catch (Exception ignored) {}

        return false;
    }
}
