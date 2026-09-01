package com.knowledgegap.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JWTAuthenticationFilter
        extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JWTAuthenticationFilter(
            JWTService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println(
                "================================================"
        );

        System.out.println("JWT FILTER");
        System.out.println(
                "Request: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );

        String authHeader =
                request.getHeader("Authorization");

        // -----------------------------------------------------
        // NO TOKEN
        // -----------------------------------------------------

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No Bearer token found."
            );

            filterChain.doFilter(request, response);
            return;
        }

        System.out.println(
                "Bearer token found."
        );

        String jwt =
                authHeader.substring(7);

        try {

            // -------------------------------------------------
            // EXTRACT EMAIL
            // -------------------------------------------------

            String email =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "JWT Email: " + email
            );

            // -------------------------------------------------
            // AUTHENTICATE USER
            // -------------------------------------------------

            if (email != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                System.out.println(
                        "User loaded: "
                                + userDetails.getUsername()
                );

                System.out.println(
                        "User authorities: "
                                + userDetails.getAuthorities()
                );

                // ---------------------------------------------
                // VALIDATE TOKEN
                // ---------------------------------------------

                if (jwtService.validateToken(
                        jwt,
                        userDetails.getUsername())) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );

                    System.out.println(
                            "JWT authentication SUCCESS"
                    );

                    System.out.println(
                            "Authenticated user: "
                                    + userDetails.getUsername()
                    );

                    System.out.println(
                            "Authorities: "
                                    + userDetails.getAuthorities()
                    );

                } else {

                    System.out.println(
                            "JWT validation FAILED"
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT authentication ERROR: "
                            + e.getMessage()
            );
        }

        filterChain.doFilter(request, response);
    }
}