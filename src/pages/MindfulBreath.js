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
  const [duration, setDuration] = useState(1); // Default duration: 1 minute
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    let interval;
    let timer;
  
    if (isGameRunning) {
      interval = setInterval(() => {
        setIsExpanding(prev => !prev);
        setCycles(prev => prev + 1);
      }, 5000);
  
      timer = setInterval(() => {
        setSeconds(prev => {
          const totalSessionSeconds = duration * 60;
          if (prev >= totalSessionSeconds - 1) {
            setIsGameRunning(false);  // Stop session when time is up
            clearInterval(interval);
            clearInterval(timer);
            return totalSessionSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
  
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isGameRunning, duration]);
  
  const handleStartGame = () => {
    setIsGameRunning(true);
    setSeconds(0);
    setCycles(0);
    setShowSettings(false);
  };

  const handleStopGame = () => {
    setIsGameRunning(false);
    setShowSettings(true);
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setDuration(value > 0 ? value : 1);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = isGameRunning ? Math.min((seconds / (duration * 60)) * 100, 100) : 0;
  const remainingTime = (duration * 60) - seconds;

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
          {showSettings && (
            <div className="settings-container">
              <label htmlFor="duration" className="settings-label">Set meditation length (minutes):</label>
              <input 
                type="number" 
                id="duration" 
                className="duration-input" 
                value={duration} 
                onChange={handleDurationChange} 
                min="1" 
                max="60"
              />
              <div className="duration-slider">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={handleDurationChange}
                  className="slider"
                />
                <div className="range-labels">
                  <span>1 min</span>
                  <span>15 min</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>
          )}
          
          <BreathingCircle isExpanding={isExpanding} />
          <div className="text-center">
            <p className="inhale-exhale">{isExpanding ? 'Inhale' : 'Exhale'}</p>
            <p>Cycles: {cycles}</p>
          </div>
          <div className="separator" />
          <div className="progress-section">
            <div className="time-display">
              <p className="time-label">Session time: {formatTime(seconds)}</p>
              {isGameRunning && (
                <p className="time-remaining">Remaining: {formatTime(remainingTime)}</p>
              )}
            </div>
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