package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.admin.EndpointPermissionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * What each role may actually do.
 *
 * <p>This platform has no permission table. Authorization lives in the {@code @PreAuthorize}
 * expressions on the controllers, and those expressions are what decide every request. So rather
 * than maintain a second description of the rules for an administration screen to display - which
 * would be free to drift from the enforcement and would eventually be wrong in exactly the way
 * nobody notices - the rules are read back off the running application.
 *
 * <p>The summary is best-effort and the raw expression always travels with it. Anything the
 * parser cannot reduce to a list of roles is reported with an empty role list and its expression
 * intact, so the screen shows the reader the real rule rather than a confident misreading of it.
 */
@Service
@RequiredArgsConstructor
public class EndpointPermissionService {

    private static final Pattern ROLE_LITERAL = Pattern.compile("'([A-Z_]+)'");
    private static final Pattern HAS_ROLE_CALL = Pattern.compile("hasAnyRole\\(([^)]*)\\)|hasRole\\(([^)]*)\\)");

    @Qualifier("requestMappingHandlerMapping")
    private final RequestMappingHandlerMapping handlerMapping;

    public List<EndpointPermissionResponse> getEndpointPermissions() {
        List<EndpointPermissionResponse> rows = new ArrayList<>();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMapping.getHandlerMethods().entrySet()) {
            HandlerMethod handler = entry.getValue();
            String rule = ruleFor(handler);
            if (rule == null) {
                continue;
            }

            for (String path : pathsOf(entry.getKey())) {
                if (!path.startsWith("/api")) {
                    continue;
                }
                for (String method : methodsOf(entry.getKey())) {
                    rows.add(describe(area(path), method, path, rule));
                }
            }
        }

        rows.sort(Comparator.comparing(EndpointPermissionResponse::getArea)
                .thenComparing(EndpointPermissionResponse::getPath)
                .thenComparing(EndpointPermissionResponse::getMethod));
        return rows;
    }

    /**
     * The rule in force for a handler: its own annotation if it carries one, otherwise the one on
     * the controller, which is how the class-level rules on these controllers apply.
     */
    private String ruleFor(HandlerMethod handler) {
        PreAuthorize onMethod = handler.getMethodAnnotation(PreAuthorize.class);
        if (onMethod != null) {
            return onMethod.value();
        }
        PreAuthorize onClass = handler.getBeanType().getAnnotation(PreAuthorize.class);
        return onClass != null ? onClass.value() : null;
    }

    private EndpointPermissionResponse describe(String area, String method, String path, String rule) {
        Set<String> roles = new LinkedHashSet<>();
        Matcher calls = HAS_ROLE_CALL.matcher(rule);
        while (calls.find()) {
            String arguments = calls.group(1) != null ? calls.group(1) : calls.group(2);
            Matcher literals = ROLE_LITERAL.matcher(arguments);
            while (literals.find()) {
                roles.add(literals.group(1));
            }
        }

        return EndpointPermissionResponse.builder()
                .area(area)
                .method(method)
                .path(path)
                .roles(List.copyOf(roles))
                .anyAuthenticated(roles.isEmpty() && rule.contains("isAuthenticated()"))
                .selfPermitted(rule.contains("authentication.principal.userId"))
                .rawRule(rule)
                .build();
    }

    /** The first segment after /api, which is how these controllers are already grouped. */
    private String area(String path) {
        String[] segments = path.split("/");
        return segments.length > 2 ? segments[2] : "api";
    }

    private Set<String> pathsOf(RequestMappingInfo info) {
        if (info.getPathPatternsCondition() != null) {
            Set<String> paths = new LinkedHashSet<>();
            info.getPathPatternsCondition().getPatterns()
                    .forEach(pattern -> paths.add(pattern.getPatternString()));
            return paths;
        }
        return info.getPatternsCondition() == null ? Set.of() : info.getPatternsCondition().getPatterns();
    }

    private Set<String> methodsOf(RequestMappingInfo info) {
        Set<String> methods = new LinkedHashSet<>();
        info.getMethodsCondition().getMethods().forEach(method -> methods.add(method.name()));
        return methods.isEmpty() ? Set.of("ANY") : methods;
    }
}
