package com.okip.entity.master;
import jakarta.persistence.*;
@Entity @Table(name="employee_preferences")
public class EmployeePreferences {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="preference_id") private Long preferenceId;
 @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="employee_id", nullable=false, unique=true) private Employee employee;
 private boolean emailNotifications=true, pushNotifications=true, learningReminders=true, skillGapAlerts=true, trainingNotifications=true, assessmentReminders=true, certificateUpdates=true;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private ProfileVisibility profileVisibility=ProfileVisibility.ORGANIZATION;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Theme theme=Theme.SYSTEM;
 public enum ProfileVisibility{ORGANIZATION,PRIVATE} public enum Theme{SYSTEM,LIGHT,DARK}
 public Long getPreferenceId(){return preferenceId;} public Employee getEmployee(){return employee;} public void setEmployee(Employee v){employee=v;}
 public boolean isEmailNotifications(){return emailNotifications;} public void setEmailNotifications(boolean v){emailNotifications=v;}
 public boolean isPushNotifications(){return pushNotifications;} public void setPushNotifications(boolean v){pushNotifications=v;}
 public boolean isLearningReminders(){return learningReminders;} public void setLearningReminders(boolean v){learningReminders=v;}
 public boolean isSkillGapAlerts(){return skillGapAlerts;} public void setSkillGapAlerts(boolean v){skillGapAlerts=v;}
 public boolean isTrainingNotifications(){return trainingNotifications;} public void setTrainingNotifications(boolean v){trainingNotifications=v;}
 public boolean isAssessmentReminders(){return assessmentReminders;} public void setAssessmentReminders(boolean v){assessmentReminders=v;}
 public boolean isCertificateUpdates(){return certificateUpdates;} public void setCertificateUpdates(boolean v){certificateUpdates=v;}
 public ProfileVisibility getProfileVisibility(){return profileVisibility;} public void setProfileVisibility(ProfileVisibility v){profileVisibility=v;}
 public Theme getTheme(){return theme;} public void setTheme(Theme v){theme=v;}
}
