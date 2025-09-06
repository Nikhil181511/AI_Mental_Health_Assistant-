import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import './MindfulBreath.css';
// Import audio assets (folder is named 'asserts' in the project)
import oceanWaves from '../asserts/ocean-waves.mp3';
import rainforest from '../asserts/rainforest.mp3';
import gentlePiano from '../asserts/gentle-piano.mp3';
import highFrequency from '../asserts/high-frequency.mp3';

// List of calm music tracks (using imported module URLs so bundler resolves them)
const MUSIC_TRACKS = [
  { label: 'Ocean Waves', url: oceanWaves },
  { label: 'Rainforest', url: rainforest },
  { label: 'Gentle Piano', url: gentlePiano },
  { label: 'High frequency', url: highFrequency },
  { label: 'No Music', url: '' }
];

const BreathingCircle = ({ isExpanding }) => {
  const circleRef = useRef(null);
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.transition = 'transform 4.8s ease-in-out'; // Updated to match 4s breathing cycle
    circle.style.transform = isExpanding ? 'scale(2)' : 'scale(1)';
  }, [isExpanding]);
  return (
    <div className="circle-container">
      <div ref={circleRef} className="breathing-circle"></div>
    </div>
  );
};

const MindfulBreath = () => {
  // Music selector state
  const [selectedTrack, setSelectedTrack] = useState(MUSIC_TRACKS[0].url);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Meditation state
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanding, setIsExpanding] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [duration, setDuration] = useState(1); // Default duration: 1 minute
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    let interval;
    let timer;
    if (isGameRunning && !isPaused) {
      interval = setInterval(() => {
        setIsExpanding(prev => !prev);
        setCycles(prev => prev + 1);
      }, 4800); // Changed from 5000ms to 4800ms for more natural breathing
      timer = setInterval(() => {
        setSeconds(prev => {
          const totalSessionSeconds = duration * 60;
          if (prev >= totalSessionSeconds - 1) {
            setIsGameRunning(false);
            setIsPaused(false);
            clearInterval(interval);
            clearInterval(timer);
            
            // Auto-stop music when session ends
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              setIsPlaying(false);
            }
            
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
  }, [isGameRunning, isPaused, duration]);

  const handleTrackChange = (e) => {
    setSelectedTrack(e.target.value);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handlePlayPause = () => {
    if (!selectedTrack) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStartGame = () => {
    setIsGameRunning(true);
    setIsPaused(false);
    setSeconds(0);
    setCycles(0);
    setShowSettings(false);
    
    // Auto-start music if track is selected
    if (selectedTrack && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePauseResumeGame = () => {
    setIsPaused(prev => !prev);
    
    // Pause/Resume music along with session
    if (audioRef.current) {
      if (!isPaused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (selectedTrack) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleStopGame = () => {
    setIsGameRunning(false);
    setIsPaused(false);
    setShowSettings(true);
    
    // Auto-stop music
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
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
      {/* Heading */}
      <div className="card-header">
        <div className="card-title">
          <Clock className="clock-icon" />
          Mindful Breath
        </div>
        <div className="card-description">Practice mindful breathing with this exercise.</div>
      </div>

      <div className="card-content">
        {/* Timer Settings */}
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

        {/* Desktop Left Panel - Breathing Sphere */}
        <div className="desktop-left-panel">
          <BreathingCircle isExpanding={isExpanding} />
          
          {/* Inhale / Exhale Indicator */}
          <div className="status-block">
            <p className="inhale-exhale">{isPaused ? 'Paused' : (isExpanding ? 'Inhale' : 'Exhale')}</p>
            <p>Cycles: {cycles}</p>
            {isPaused && <p className="pause-message">Session paused - click Resume to continue</p>}
          </div>
        </div>

        {/* Desktop Right Panel - Controls */}
        <div className="desktop-right-panel">
          {/* Session Time + Start / Pause Controls */}
          <div className="session-time-controls">
            <div className="progress-section compact">
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
            {/* Music Selector moved above the session controls */}
            <div className="music-selector-footer inline" style={{marginTop: '10px'}}>
              <label htmlFor="music-select">Background Music:</label>
              <select id="music-select" className="music-select" value={selectedTrack} onChange={handleTrackChange}>
                {MUSIC_TRACKS.map(track => (
                  <option key={track.url} value={track.url}>{track.label}</option>
                ))}
              </select>
              {selectedTrack && (
                <audio ref={audioRef} src={selectedTrack} loop />
              )}
            </div>
            <div className="session-controls inline">
              {!isGameRunning ? (
                <button className="btn start" onClick={handleStartGame}>Start Session</button>
              ) : (
                <>
                  <button className="btn pause" onClick={handlePauseResumeGame}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button className="btn stop" onClick={handleStopGame}>Stop Session</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindfulBreath;