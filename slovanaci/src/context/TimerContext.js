import React, { createContext, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export const TimerContext = createContext();

const ALERT_SECONDS = 6 * 60;
const RESET_SECONDS = 24 * 3600;
export const TimerProvider = ({ children }) => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const alertedRef = useRef(false);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next === ALERT_SECONDS && !alertedRef.current) {
            alertedRef.current = true;
            toast.error("⏱ Uběhlo 6 minut!", { autoClose: false, closeOnClick: true });
          }
          if (next >= RESET_SECONDS) {
            setRunning(false);
            return 0
        }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleReset = () => {
    setRunning(false);
    setSeconds(0);
    alertedRef.current = false;
  };

  return (
    <TimerContext.Provider value={{ seconds, running, setRunning, handleReset }}>
      {children}
    </TimerContext.Provider>
  );
};
