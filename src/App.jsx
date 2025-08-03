import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [alarms, setAlarms] = useState(() => JSON.parse(localStorage.getItem("alarms")) || []);
  const [inputTime, setInputTime] = useState("");
  const [currentTime, setCurrentTime] = useState(getFormattedTime());
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const audioRef = useRef(null);

  function getFormattedTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    audioRef.current = new Audio("/ALARM.m4a");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getFormattedTime();
      setCurrentTime(now);

      const found = alarms.find(alarm => alarm.enabled && alarm.time === now);
      if (found) {
        setRingingAlarm(found);
        audioRef.current?.play();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  const addAlarm = () => {
    if (!inputTime) return;
    const newAlarm = {
      id: Date.now(),
      time: inputTime,
      enabled: true
    };
    const updated = [...alarms, newAlarm];
    setAlarms(updated);
    localStorage.setItem("alarms", JSON.stringify(updated));
    setInputTime("");
  };

  const toggleAlarm = (id) => {
    const updated = alarms.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    setAlarms(updated);
    localStorage.setItem("alarms", JSON.stringify(updated));
  };

  const deleteAlarm = (id) => {
    const updated = alarms.filter(a => a.id !== id);
    setAlarms(updated);
    localStorage.setItem("alarms", JSON.stringify(updated));
  };

  const dismiss = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setRingingAlarm(null);
  };

  const snooze = () => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
    const timeString = getFormattedTime(snoozeTime);

    const newAlarm = {
      id: Date.now(),
      time: timeString,
      enabled: true
    };

    const updated = [...alarms, newAlarm];
    setAlarms(updated);
    localStorage.setItem("alarms", JSON.stringify(updated));
    dismiss();
  };

  return (
    <div className="App">
      <h1>Alarm Clock</h1>
      <h2>{currentTime}</h2>

      <div className="input-section">
        <input
          type="time"
          value={inputTime}
          onChange={(e) => setInputTime(e.target.value)}
        />
        <button onClick={addAlarm}>Add Alarm</button>
      </div>

      <h3>Set Alarms</h3>
      <ul>
        {alarms.map(alarm => (
          <li key={alarm.id}>
            {alarm.time}
            <input
              type="checkbox"
              checked={alarm.enabled}
              onChange={() => toggleAlarm(alarm.id)}
            />
            <button onClick={() => deleteAlarm(alarm.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {ringingAlarm && (
        <div className="alarm-popup">
          <h2>⏰ Alarm Ringing!</h2>
          <button onClick={snooze}>Snooze 5 min</button>
          <button onClick={dismiss}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default App;
