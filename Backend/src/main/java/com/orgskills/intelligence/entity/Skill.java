package com.orgskills.intelligence.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(length = 2000)
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "skill")
    private List<UserSkill> userSkills = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "skill")
    private List<RoleCompetency> roleCompetencies = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "skill")
    private List<GapAnalysis> gapAnalyses = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "targetSkill")
    private List<MentorshipMatch> mentorshipMatches = new ArrayList<>();
}
