package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.auth.AuthResponse;
import com.orgskills.intelligence.dto.auth.ChangePasswordRequest;
import com.orgskills.intelligence.dto.auth.FirebaseLoginRequest;
import com.orgskills.intelligence.dto.auth.ForgotPasswordRequest;
import com.orgskills.intelligence.dto.auth.LoginRequest;
import com.orgskills.intelligence.dto.auth.OAuth2GoogleRequest;
import com.orgskills.intelligence.dto.auth.RefreshTokenRequest;
import com.orgskills.intelligence.dto.auth.RegisterRequest;
import com.orgskills.intelligence.dto.auth.SignupRequest;
import com.orgskills.intelligence.dto.auth.SignupResponse;
import com.orgskills.intelligence.dto.auth.UpdateProfileRequest;
import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.entity.RefreshToken;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.AccessStatus;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.RefreshTokenRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.FirebaseTokenVerifier;
import com.orgskills.intelligence.security.GoogleIdTokenVerifier;
import com.orgskills.intelligence.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    /** Roles holding the administrative reset, and so the ones worth telling. */
    private static final Set<Role> PASSWORD_RESET_ROLES =
            EnumSet.of(Role.SYSTEM_ADMIN, Role.ADMIN, Role.HR_ADMIN);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final NotificationService notificationService;
    private final AccessRequestService accessRequestService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ValidationException("Email is already registered");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole() != null ? request.getRole() : Role.EMPLOYEE);
        user.setDepartment(request.getDepartment().trim());
        user.setJobTitle(request.getJobTitle().trim());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setActive(true);
        // Created by an administrator, who is themselves the authority that would otherwise
        // grant access. Only self-service sign-up waits for a decision.
        user.setAccessStatus(AccessStatus.APPROVED);

        User saved = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = createRefreshToken(saved);

        auditLogService.logEvent(saved.getId(), saved.getEmail(), "REGISTER", "User", saved.getId().toString(), "User registered successfully");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(toUserProfile(saved))
                .build();
    }

    /**
     * Self-service sign-up: records the account and routes it to the people who can grant access.
     *
     * <p>No tokens come back. The account exists but cannot sign in until an approver grants it,
     * which is the whole point — otherwise registering under any address would hand over a
     * dashboard immediately.
     *
     * <p>Every address already known to the system is refused rather than overwritten, whatever
     * state it is in. An approved address belongs to somebody who should sign in; a pending one
     * is already in the queue and re-submitting would only reset its place; and a rejected one
     * must not be revivable by re-applying, or the refusal would mean nothing.
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user != null && user.getAccessStatus() == AccessStatus.APPROVED) {
            throw new ValidationException("Email is already registered. Please sign in instead.");
        }
        if (user != null && user.getAccessStatus() == AccessStatus.PENDING) {
            throw new ValidationException("A request for this address is already waiting for a "
                    + "decision. You will be able to sign in once it has been granted.");
        }
        if (user != null && user.getAccessStatus() == AccessStatus.REJECTED) {
            // Re-applying cannot be allowed to quietly erase a refusal: that would make the
            // decision meaningless, since anyone turned down could simply sign up again.
            throw new ValidationException(AccessRequestService.refusalMessage(user));
        }
        if (user == null) {
            user = new User();
            user.setEmail(normalizedEmail);
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        // Not taken from the request: see SignupRequest for why self-service cannot choose a role.
        user.setRole(Role.EMPLOYEE);
        user.setDepartment(request.getDepartment().trim());
        user.setJobTitle(request.getJobTitle().trim());
        user.setTargetJobTitle(request.getTargetJobTitle().trim());
        user.setTargetDepartment(request.getTargetDepartment().trim());
        user.setAccessStatus(AccessStatus.PENDING);
        user.setActive(true);

        User saved = userRepository.save(user);

        accessRequestService.notifyApprovers(saved);

        auditLogService.logEvent(saved.getId(), saved.getEmail(), "SIGNUP_REQUESTED", "User",
                saved.getId().toString(),
                "Self-service sign-up submitted for approval in " + saved.getDepartment());

        return SignupResponse.builder()
                .email(normalizedEmail)
                .message("Your request has been sent to the head of " + saved.getDepartment()
                        + " and to HR. You will be able to sign in once somebody grants it.")
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
            CustomPrincipal principal = (CustomPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user no longer exists"));

            if (!Boolean.TRUE.equals(user.getActive())) {
                auditLogService.logEvent(user.getId(), user.getEmail(), "LOGIN_FAILED", "User", user.getId().toString(), "Deactivated account login attempt");
                throw new UnauthorizedException("Account is deactivated. Please contact an administrator.");
            }

            // Without this the approval would be decorative: a sign-up awaiting a decision
            // already holds a usable password, so anyone could register and simply sign in
            // without ever being granted access by anybody.
            if (!user.isAccessApproved()) {
                auditLogService.logEvent(user.getId(), user.getEmail(), "LOGIN_FAILED", "User",
                        user.getId().toString(),
                        "Login attempt on an account that is " + user.getAccessStatus().name().toLowerCase());
                throw new UnauthorizedException(user.getAccessStatus() == AccessStatus.REJECTED
                        ? AccessRequestService.refusalMessage(user)
                        : "Your account is waiting to be approved by your department head or HR. "
                                + "You will be able to sign in once access has been granted.");
            }

            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = createRefreshToken(user);

            auditLogService.logEvent(user.getId(), user.getEmail(), "LOGIN_SUCCESS", "User", user.getId().toString(), "User logged in successfully");

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(toUserProfile(user))
                    .build();
        } catch (DisabledException ex) {
            // The account is deactivated. Spring refuses it inside authenticate() now that the
            // principal reports the real flag, so this arrives before the check further up and
            // must produce the same answer: a refusal the caller can read, and a record of it.
            User deactivated = userRepository.findByEmail(normalizedEmail).orElse(null);
            auditLogService.logEvent(
                    deactivated != null ? deactivated.getId() : null, normalizedEmail,
                    "LOGIN_FAILED", "User",
                    deactivated != null ? deactivated.getId().toString() : null,
                    "Deactivated account login attempt");
            throw new UnauthorizedException("Account is deactivated. Please contact an administrator.");
        } catch (BadCredentialsException ex) {
            auditLogService.logEvent(null, normalizedEmail, "LOGIN_FAILED", "User", null, "Invalid credentials for email: " + normalizedEmail);
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken tokenEntity = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (tokenEntity.getRevoked() || tokenEntity.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(tokenEntity);
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        User user = tokenEntity.getUser();
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new UnauthorizedException("User account is inactive");
        }

        CustomPrincipal principal = new CustomPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getActive()),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String newAccessToken = jwtTokenProvider.generateToken(auth);
        String newRefreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(toUserProfile(user))
                .build();
    }

    /**
     * Signs somebody in with a Google identity that Google itself has vouched for.
     *
     * <p>The account is resolved from the verified token and never from the request body. It
     * also signs in existing people only: auto-provisioning on first Google sign-in would let
     * anyone with a Google account into an internal directory, which is not a decision this
     * endpoint should be making on its own.
     */
    @Transactional
    public AuthResponse oauth2GoogleLogin(OAuth2GoogleRequest request) {
        GoogleIdTokenVerifier.GoogleIdentity identity = googleIdTokenVerifier.verify(request.getIdToken());

        User user = userRepository.findByEmail(identity.email())
                .orElseThrow(() -> {
                    auditLogService.logEvent(null, identity.email(), "OAUTH2_LOGIN_REJECTED", "User", "-",
                            "Google sign-in for an address with no account on this platform");
                    return new UnauthorizedException(
                            "No account exists for " + identity.email()
                                    + ". Ask an administrator to create one before signing in with Google.");
                });

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new UnauthorizedException("User account is inactive");
        }

        // Keep the profile picture in step with the identity provider, but nothing else: name,
        // role and department are administered here, not by Google.
        if (identity.avatarUrl() != null && !identity.avatarUrl().isBlank()) {
            user.setAvatarUrl(identity.avatarUrl());
            userRepository.save(user);
        }

        CustomPrincipal principal = new CustomPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getActive()),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String accessToken = jwtTokenProvider.generateToken(auth);
        String refreshToken = createRefreshToken(user);

        auditLogService.logEvent(user.getId(), user.getEmail(), "OAUTH2_LOGIN", "User",
                user.getId().toString(), "Signed in with a verified Google identity");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(toUserProfile(user))
                .build();
    }

    /**
     * Signs somebody in with a Firebase identity.
     *
     * <p>Firebase Authentication handles the provider negotiation (Google, GitHub, Microsoft,
     * etc.) on the client. The backend receives the resulting ID token, verifies it with the
     * Admin SDK, and maps it to a local account.
     *
     * <p>If the verified email does not belong to any existing account, a new one is provisioned
     * with the {@link Role#EMPLOYEE EMPLOYEE} role. This keeps the sign-up friction low while
     * still requiring an administrator to promote somebody before they see anything sensitive.
     */
    @Transactional
    public AuthResponse firebaseLogin(FirebaseLoginRequest request) {
        FirebaseTokenVerifier.FirebaseIdentity identity = firebaseTokenVerifier.verify(request.getIdToken());

        User user = userRepository.findByEmail(identity.email()).orElse(null);

        if (user == null) {
            // Auto-provision: the person is real (Firebase verified them), but they have no
            // local account yet. They start as an employee; an admin promotes if needed.
            user = new User();
            user.setEmail(identity.email());
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setFullName(identity.fullName() != null ? identity.fullName() : identity.email());
            user.setRole(Role.EMPLOYEE);
            user.setDepartment("Unassigned");
            user.setJobTitle("New Employee");
            user.setAvatarUrl(identity.avatarUrl());
            user.setActive(true);
            user = userRepository.save(user);

            auditLogService.logEvent(user.getId(), user.getEmail(), "FIREBASE_REGISTER", "User",
                    user.getId().toString(),
                    "Auto-provisioned via Firebase (" + identity.provider() + ")");
        } else {
            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new UnauthorizedException("User account is inactive");
            }

            // Keep the avatar in step with the identity provider.
            if (identity.avatarUrl() != null && !identity.avatarUrl().isBlank()) {
                user.setAvatarUrl(identity.avatarUrl());
                userRepository.save(user);
            }
        }

        CustomPrincipal principal = new CustomPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getActive()),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String accessToken = jwtTokenProvider.generateToken(auth);
        String refreshToken = createRefreshToken(user);

        auditLogService.logEvent(user.getId(), user.getEmail(), "FIREBASE_LOGIN", "User",
                user.getId().toString(),
                "Signed in via Firebase (" + identity.provider() + ")");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(toUserProfile(user))
                .build();
    }

    /**
     * Ends a session by revoking its refresh token.
     *
     * <p>Answers the same way whether or not the token existed. A caller who presents a token
     * this service has never seen learns nothing from the reply, which keeps the endpoint from
     * becoming a way to test whether a stolen token is still live.
     *
     * <p>The access token is deliberately not touched: it is a self-contained JWT with a short
     * life and no server-side record to revoke. Cutting off the refresh token is what stops the
     * session being renewed once that expires.
     */
    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken()).ifPresent(token -> {
            if (Boolean.TRUE.equals(token.getRevoked())) {
                return;
            }
            token.setRevoked(true);
            refreshTokenRepository.save(token);

            User user = token.getUser();
            auditLogService.logEvent(user.getId(), user.getEmail(), "LOGOUT", "User",
                    user.getId().toString(), "Signed out and refresh token revoked");
        });
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomPrincipal principal)) {
            throw new UnauthorizedException("Not authenticated");
        }
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserProfile(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Authentication authentication, UpdateProfileRequest request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomPrincipal principal)) {
            throw new UnauthorizedException("Not authenticated");
        }
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullName(request.getFullName().trim());
        user.setDepartment(request.getDepartment().trim());
        user.setJobTitle(request.getJobTitle().trim());
        user.setAvatarUrl(request.getAvatarUrl());

        auditLogService.logEvent(user.getId(), user.getEmail(), "UPDATE_PROFILE", "User", user.getId().toString(), "User profile updated");
        return toUserProfile(userRepository.save(user));
    }

    /**
     * Records that somebody cannot get in, and puts it in front of the people who can help.
     *
     * <p>There is no self-service reset: this platform sends no email, so a link-based flow
     * would either need infrastructure that does not exist or would have to pretend to send
     * something. Instead the request reaches every administrator as a notification, and they
     * complete it with the reset they already have.
     *
     * <p>The answer is the same whether or not the address belongs to anybody. Confirming which
     * addresses have accounts would turn this into a way of enumerating the staff directory.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(user -> {
            List<User> administrators = userRepository.findAll().stream()
                    .filter(candidate -> PASSWORD_RESET_ROLES.contains(candidate.getRole()))
                    .filter(candidate -> Boolean.TRUE.equals(candidate.getActive()))
                    .toList();

            for (User administrator : administrators) {
                notificationService.createOnce(
                        administrator,
                        "Password reset requested",
                        user.getFullName() + " (" + user.getEmail() + ") cannot sign in and has asked for a "
                                + "password reset.",
                        NotificationType.SYSTEM_ALERT,
                        "password-reset-request:" + user.getId());
            }

            auditLogService.logEvent(user.getId(), user.getEmail(), "PASSWORD_RESET_REQUESTED", "User",
                    user.getId().toString(),
                    "Reset requested; " + administrators.size() + " administrator(s) notified");
        });
    }

    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomPrincipal principal)) {
            throw new UnauthorizedException("Not authenticated");
        }
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logEvent(user.getId(), user.getEmail(), "CHANGE_PASSWORD", "User", user.getId().toString(), "User password updated");
    }

    private String createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusSeconds(7 * 24 * 60 * 60)); // 7 days
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    private UserProfileResponse toUserProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .avatarUrl(user.getAvatarUrl())
                .targetJobTitle(user.getTargetJobTitle())
                .targetDepartment(user.getTargetDepartment())
                .accessStatus(user.getAccessStatus().name())
                .active(user.getActive())
                .build();
    }
}
