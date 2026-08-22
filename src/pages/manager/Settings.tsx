import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import ManagerPage from "./ManagerPage";

const Settings: React.FC = () => (
  <ManagerPage
    title="Settings"
    subtitle="Configure manager dashboard and team workspace preferences."
    icon={SettingsIcon}
    active="Settings"
  />
);

export default Settings;
