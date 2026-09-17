package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.okip.entity.master.Skill;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.TrainingSkill;

public interface TrainingSkillRepository
        extends JpaRepository<TrainingSkill, Long> {

    List<TrainingSkill> findBySkill(Skill skill);

    List<TrainingSkill> findByTraining(Training training);

    @Query("select ts from TrainingSkill ts join fetch ts.skill where ts.training = :training")
    List<TrainingSkill> findByTrainingWithSkill(@Param("training") Training training);

    Optional<TrainingSkill> findByTrainingAndSkill(
            Training training,
            Skill skill);

    boolean existsByTrainingAndSkill(
            Training training,
            Skill skill);

    void deleteByTrainingAndSkill(
            Training training,
            Skill skill);
}