import React, { useEffect } from "react";
import selfAssessmentService from "@/services/selfAssessmentService";

const SelfAssessment: React.FC = () => {
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const data =
          await selfAssessmentService.getMyAssessments();

        console.log(
          "SELF ASSESSMENT API RESPONSE =",
          data
        );
      } catch (error: any) {
        console.error(
          "SELF ASSESSMENT API ERROR =",
          error?.response?.data || error
        );
      }
    };

    void loadAssessments();
  }, []);

  return (
    <div>
      Self Assessment
    </div>
  );
};

export default SelfAssessment;