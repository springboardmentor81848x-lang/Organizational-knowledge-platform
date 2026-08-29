package com.orgskills.intelligence.exception;

/**
 * The caller is authenticated, but this is not theirs to see or do.
 *
 * Distinct from {@link UnauthorizedException}, which means the credentials are missing, expired
 * or wrong. The difference is not pedantry: a client that cannot tell them apart has to guess
 * whether to renew the session or tell the user they were refused, and guessing wrong either
 * signs somebody out of a working session or leaves them staring at a failed panel.
 *
 * <p>Scoped reads throw this — a manager reading another manager's team, an employee reading a
 * colleague's dashboard — because being refused is a normal outcome of a scoped API, not a fault.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
