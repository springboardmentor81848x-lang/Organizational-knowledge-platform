package com.orgskills.intelligence.exception;

/**
 * A live provider fetch could not be completed - the call failed, timed out, or the provider
 * answered with an error status.
 *
 * <p>Kept distinct from a provider that answered normally with no courses. Both leave the
 * catalogue unchanged, but one is a fault to report and the other is an empty result, and an
 * import screen that showed them the same way would be lying about one of them.
 */
public class ExternalProviderException extends RuntimeException {

    public ExternalProviderException(String message) {
        super(message);
    }

    public ExternalProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
