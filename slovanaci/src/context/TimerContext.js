import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";

export const TimerContext = createContext();

const ALERT_SECONDS = 6 * 60;
const RESET_SECONDS = 24 * 3600;
const STORAGE_KEY = "slovanaci.timer";
const emptyTimer = () => ({ elapsedMs: 0, startedAt: null, alerted: false });

const readTimer = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return emptyTimer();
    const timer = JSON.parse(stored);
    if (
      timer === null ||
      !Number.isFinite(timer.elapsedMs) ||
      timer.elapsedMs < 0 ||
      (timer.startedAt !== null &&
        (!Number.isFinite(timer.startedAt) || timer.startedAt < 0)) ||
      typeof timer.alerted !== "boolean"
    ) {
      throw new Error("Invalid saved timer state");
    }
    return timer;
  } catch (error) {
    console.error("Could not restore the timer.", error);
    return emptyTimer();
  }
};

const saveTimer = (timer) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
  } catch (error) {
    console.error("Could not save the timer.", error);
    toast.error("Časovač se nepodařilo uložit. Po zavření stránky se neobnoví.", {
      toastId: "timer-storage-error",
    });
  }
};

const elapsedMilliseconds = (timer, now = Date.now()) =>
  timer.elapsedMs + (timer.startedAt === null ? 0 : Math.max(0, now - timer.startedAt));

export const TimerProvider = ({ children }) => {
  const [initialTimer] = useState(readTimer);
  const timerRef = useRef(initialTimer);
  const [seconds, setSeconds] = useState(() =>
    Math.floor(elapsedMilliseconds(initialTimer) / 1000)
  );
  const [running, setIsRunning] = useState(initialTimer.startedAt !== null);

  const synchronize = useCallback(() => {
    let timer = timerRef.current;
    let elapsed = Math.floor(elapsedMilliseconds(timer) / 1000);

    if (elapsed >= RESET_SECONDS) {
      timer = emptyTimer();
      elapsed = 0;
      timerRef.current = timer;
      saveTimer(timer);
    } else if (elapsed >= ALERT_SECONDS && !timer.alerted) {
      timer = { ...timer, alerted: true };
      timerRef.current = timer;
      saveTimer(timer);
      toast.error("⏱ Uběhlo 6 minut!", { autoClose: false, closeOnClick: true });
    }

    setSeconds(elapsed);
    setIsRunning(timer.startedAt !== null);
  }, []);

  useEffect(() => {
    synchronize();
    document.addEventListener("visibilitychange", synchronize);
    window.addEventListener("pageshow", synchronize);
    window.addEventListener("focus", synchronize);
    return () => {
      document.removeEventListener("visibilitychange", synchronize);
      window.removeEventListener("pageshow", synchronize);
      window.removeEventListener("focus", synchronize);
    };
  }, [synchronize]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(synchronize, 1000);
    return () => clearInterval(interval);
  }, [running, synchronize]);

  const setRunning = (value) => {
    synchronize();
    const timer = timerRef.current;
    const isRunning = timer.startedAt !== null;
    const nextRunning = typeof value === "function" ? value(isRunning) : value;
    if (nextRunning === isRunning) return;

    const now = Date.now();
    timerRef.current = {
      ...timer,
      elapsedMs: elapsedMilliseconds(timer, now),
      startedAt: nextRunning ? now : null,
    };
    saveTimer(timerRef.current);
    synchronize();
  };

  const handleReset = () => {
    timerRef.current = emptyTimer();
    saveTimer(timerRef.current);
    synchronize();
  };

  return (
    <TimerContext.Provider value={{ seconds, running, setRunning, handleReset }}>
      {children}
    </TimerContext.Provider>
  );
};
