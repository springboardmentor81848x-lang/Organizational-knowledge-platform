package com.orgskills.intelligence.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

/**
 * Answers unauthenticated requests with 401 rather than Spring Security's stateless default of
 * 403.
 *
 * <p>The distinction is what lets a client tell "your session has expired, refresh the token and
 * try again" apart from "you are signed in, but this is not yours to read". Returning 403 for a
 * missing or expired token conflates the two: a browser client sees the same status whether it
 * needs to renew its credentials or has genuinely been refused, so it cannot recover from an
 * expiry without signing the user out of a working session.
 *
 * <p>The body matches {@link com.orgskills.intelligence.exception.GlobalExceptionHandler}, so a
 * caller parses one error shape no matter which layer rejected the request.
 */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Authentication is required to access this resource.",
                request.getRequestURI()
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
