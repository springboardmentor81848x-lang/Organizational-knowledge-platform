import React from "react";
import { Sparkles } from "lucide-react";
import ManagerPage from "./ManagerPage";

export default function AIRecommendations() {
  return (
    <ManagerPage
      title="AI Recommendations"
      subtitle="Review AI-driven learning and workforce recommendations."
      icon={Sparkles}
      active="AI Recommendations"
    />
  );
}
