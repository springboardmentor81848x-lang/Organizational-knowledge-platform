import React, { useEffect, useState } from "react";
import api from "../services/api";

function Notifications() {
  const employeeId = localStorage.getItem("employeeId");

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const response = await api.get(
        `/notifications/employee/${employeeId}`
      );

      setNotifications(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Notifications</h1>
    </div>
  );
}

export default Notifications;