package com.okip.service.peerassessment;

import com.okip.dto.peerassessment.PeerAnswerRequestDTO;
import com.okip.dto.peerassessment.PeerAssessmentDTO;
import com.okip.dto.peerassessment.PeerAssessmentResultDTO;
import com.okip.dto.peerassessment.PeerDTO;
import com.okip.dto.peerassessment.PeerSkillDTO;

import java.util.List;

public interface PeerAssessmentService {

    List<PeerDTO> getAvailablePeers();

    List<PeerSkillDTO> getPeerSkills(Long employeeId);

    PeerAssessmentDTO getPeerAssessment(
            Long employeeId,
            Long skillId
    );

    PeerAssessmentResultDTO startAssessment(
            Long employeeId,
            Long skillId
    );

    PeerAssessmentResultDTO submitAssessment(
            Long attemptId,
            List<PeerAnswerRequestDTO> answers
    );
}