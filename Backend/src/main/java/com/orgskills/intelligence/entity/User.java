package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.AccessStatus;
import com.orgskills.intelligence.entity.enums.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String jobTitle;

    private String avatarUrl;

    /**
     * The role the person is working towards, as opposed to {@link #jobTitle}, which is the one
     * they hold today.
     *
     * <p>Chosen at sign-up and used as the yardstick for their assessments and gaps: the
     * competency profile matched here is what their proficiency is measured against, so an
     * employee aiming at "Senior Backend Engineer" is assessed on that role's skills rather than
     * their current one. Nullable, because accounts created before this existed - and every
     * non-employee role - have no target.
     */
    @Column(name = "target_job_title")
    private String targetJobTitle;

    /**
     * The department the target role sits in. A competency profile is keyed by job title *and*
     * department, so the title alone does not identify one.
     */
    @Column(name = "target_department")
    private String targetDepartment;

    /**
     * Whether the address has been proven by entering the emailed one-time password.
     *
     * <p>Sign-up leaves this false and sign-in refuses the account until it flips, which is what
     * stops somebody registering under an address they do not control. Seeded and
     * administrator-created accounts are set true on creation, since no one needs to prove an
     * address that was set for them.
     *
     * <p>Deliberately nullable, and null means approved. Two reasons. Hibernate's {@code update}
     * mode cannot add a NOT NULL column to a table that already holds rows, so declaring it
     * non-null would leave the column missing entirely on every existing database. And the rows
     * that predate approval belong to accounts created before it existed — they were never asked
     * to wait for anyone, so treating null as "pending" would have locked out every user the
     * platform already had. Only an explicit PENDING or REJECTED, which only self-service
     * sign-up sets, gates sign-in; see {@link #getAccessStatus()}.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "access_status")
    private AccessStatus accessStatus = AccessStatus.APPROVED;

    /** Who granted or refused access. Null for accounts that never needed a decision. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "access_decided_by")
    private User accessDecidedBy;

    @Column(name = "access_decided_at")
    private Instant accessDecidedAt;

    /** The approver's reason, shown to the applicant. Most useful on a refusal. */
    @Column(name = "access_decision_note", length = 1000)
    private String accessDecisionNote;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private EmployeeProfile employeeProfile;

    @OneToMany(mappedBy = "user")
    private List<UserSkill> userSkills = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<GapAnalysis> gapAnalyses = new ArrayList<>();

    @OneToMany(mappedBy = "employee")
    private List<TrainingRecommendation> recommendations = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "mentee")
    private List<MentorshipMatch> menteeMatches = new ArrayList<>();

    @OneToMany(mappedBy = "mentor")
    private List<MentorshipMatch> mentorMatches = new ArrayList<>();

    @OneToMany(mappedBy = "employee")
    private List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "employee")
    private List<Achievement> achievements = new ArrayList<>();

    @OneToMany(mappedBy = "employee")
    private List<Certification> certifications = new ArrayList<>();

    public User() {
    }

    public User(Long id, String email, String password, String fullName, Role role, String department, String jobTitle, String avatarUrl, Boolean active, User manager, EmployeeProfile employeeProfile) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.department = department;
        this.jobTitle = jobTitle;
        this.avatarUrl = avatarUrl;
        this.active = active != null ? active : true;
        this.manager = manager;
        this.employeeProfile = employeeProfile;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getTargetJobTitle() {
        return targetJobTitle;
    }

    public void setTargetJobTitle(String targetJobTitle) {
        this.targetJobTitle = targetJobTitle;
    }

    public String getTargetDepartment() {
        return targetDepartment;
    }

    public void setTargetDepartment(String targetDepartment) {
        this.targetDepartment = targetDepartment;
    }

    /**
     * Where this account stands with the people who grant access.
     *
     * <p>Null counts as approved: it marks an account created before approval existed, or one an
     * administrator created directly. Every check should go through here rather than testing the
     * field, so that one convention is applied in one place.
     */
    public AccessStatus getAccessStatus() {
        return accessStatus == null ? AccessStatus.APPROVED : accessStatus;
    }

    public void setAccessStatus(AccessStatus accessStatus) {
        this.accessStatus = accessStatus;
    }

    /** Whether this account may sign in as far as the access decision is concerned. */
    public boolean isAccessApproved() {
        return getAccessStatus() == AccessStatus.APPROVED;
    }

    public User getAccessDecidedBy() {
        return accessDecidedBy;
    }

    public void setAccessDecidedBy(User accessDecidedBy) {
        this.accessDecidedBy = accessDecidedBy;
    }

    public Instant getAccessDecidedAt() {
        return accessDecidedAt;
    }

    public void setAccessDecidedAt(Instant accessDecidedAt) {
        this.accessDecidedAt = accessDecidedAt;
    }

    public String getAccessDecisionNote() {
        return accessDecisionNote;
    }

    public void setAccessDecisionNote(String accessDecisionNote) {
        this.accessDecisionNote = accessDecisionNote;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public User getManager() {
        return manager;
    }

    public void setManager(User manager) {
        this.manager = manager;
    }

    public EmployeeProfile getEmployeeProfile() {
        return employeeProfile;
    }

    public void setEmployeeProfile(EmployeeProfile employeeProfile) {
        this.employeeProfile = employeeProfile;
    }

    public List<UserSkill> getUserSkills() {
        return userSkills;
    }

    public void setUserSkills(List<UserSkill> userSkills) {
        this.userSkills = userSkills;
    }

    public List<GapAnalysis> getGapAnalyses() {
        return gapAnalyses;
    }

    public void setGapAnalyses(List<GapAnalysis> gapAnalyses) {
        this.gapAnalyses = gapAnalyses;
    }

    public List<TrainingRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<TrainingRecommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<MentorshipMatch> getMenteeMatches() {
        return menteeMatches;
    }

    public void setMenteeMatches(List<MentorshipMatch> menteeMatches) {
        this.menteeMatches = menteeMatches;
    }

    public List<MentorshipMatch> getMentorMatches() {
        return mentorMatches;
    }

    public void setMentorMatches(List<MentorshipMatch> mentorMatches) {
        this.mentorMatches = mentorMatches;
    }

    public List<Enrollment> getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(List<Enrollment> enrollments) {
        this.enrollments = enrollments;
    }

    public List<Achievement> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<Achievement> achievements) {
        this.achievements = achievements;
    }

    public List<Certification> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<Certification> certifications) {
        this.certifications = certifications;
    }
}
