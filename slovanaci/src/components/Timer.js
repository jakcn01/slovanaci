import React, { useContext } from "react";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import "../css/Timer.css";
import { TimerContext } from "../context/TimerContext";

const Timer = () => {
  const { seconds, running, setRunning, handleReset } = useContext(TimerContext);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="timer-bar">
      <span className="timer-display">
        {minutes}:{secs}
      </span>
      <div className="timer-controls">
        {!running ? (
          <button className="timer-btn timer-btn-play" onClick={() => setRunning(true)}>
            <FaPlay />
          </button>
        ) : (
          <button className="timer-btn timer-btn-pause" onClick={() => setRunning(false)}>
            <FaPause />
          </button>
        )}
        <button className="timer-btn timer-btn-reset" onClick={handleReset}>
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

export default Timer;
