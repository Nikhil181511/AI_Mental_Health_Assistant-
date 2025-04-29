import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import './MindfulBreath.css';

const BreathingCircle = ({ isExpanding }) => {
  const circleRef = useRef(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    circle.style.transition = 'transform 5s ease-in-out';
    circle.style.transform = isExpanding ? 'scale(2)' : 'scale(1)';
  }, [isExpanding]);

  return (
    <div className="circle-container">
      <div ref={circleRef} className="breathing-circle"></div>
    </div>
  );
};

const MindfulBreath = () => {
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isExpanding, setIsExpanding] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval;
    let timer;

    if (isGameRunning) {
      interval = setInterval(() => {
        setIsExpanding(prev => !prev);
        setCycles(prev => prev + 1);
      }, 5000);

      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isGameRunning]);

  const handleStartGame = () => {
    setIsGameRunning(true);
    setSeconds(0);
    setCycles(0);
  };

  const handleStopGame = () => {
    setIsGameRunning(false);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = isGameRunning ? Math.min((seconds / 60) * 100, 100) : 0;

  return (
    <div className="mindful-container">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock className="clock-icon" />
            Mindful Breath
          </div>
          <div className="card-description">Practice mindful breathing with this exercise.</div>
        </div>
        <div className="card-content">
          <BreathingCircle isExpanding={isExpanding} />
          <div className="text-center">
            <p className="inhale-exhale">{isExpanding ? 'Inhale' : 'Exhale'}</p>
            <p>Cycles: {cycles}</p>
          </div>
          <div className="separator" />
          <div className="progress-section">
            <p className="time-label">Session time: {formatTime(seconds)}</p>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="card-footer">
          {!isGameRunning ? (
            <button className="btn start" onClick={handleStartGame}>Start</button>
          ) : (
            <button className="btn stop" onClick={handleStopGame}>Stop</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindfulBreath;
