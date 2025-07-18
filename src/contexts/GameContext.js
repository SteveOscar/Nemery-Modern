// src/contexts/GameContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiService from '../services/api';

const GameContext = createContext({});

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState({
    highScores: [],
    userScore: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const difficultyConfig = {
    Easy: { 
      gridSize: [2, 2], 
      maxNumber: (level) => Math.min(6 * level, 99),
      pointsPerTile: 1,
      timeMultiplier: 1.5,
      bonusMultiplier: 1.3,
    },
    Medium: { 
      gridSize: [3, 2], 
      maxNumber: (level) => Math.min(8 * level, 99),
      pointsPerTile: 2,
      timeMultiplier: 2,
      bonusMultiplier: 2,
    },
    Hard: { 
      gridSize: [3, 3], 
      maxNumber: (level) => Math.min(10 * level, 99),
      pointsPerTile: 3,
      timeMultiplier: 3,
      bonusMultiplier: 3,
    },
    Extreme: { 
      gridSize: [4, 4], 
      maxNumber: (level) => Math.min(16 * level, 99),
      pointsPerTile: 4,
      timeMultiplier: 3,
      bonusMultiplier: 4,
    },
  };

  React.useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const savedHighScores = await SecureStore.getItemAsync('highScores');
      if (savedHighScores) {
        setHighScores(JSON.parse(savedHighScores));
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const saveHighScores = useCallback(async (scores) => {
    try {
      await SecureStore.setItemAsync('highScores', JSON.stringify(scores));
      setHighScores(scores);
    } catch (error) {
      console.error('Error saving high scores:', error);
    }
  }, []);

  const changeDifficulty = useCallback(() => {
    const difficulties = ['Easy', 'Medium', 'Hard', 'Extreme'];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    setDifficulty(difficulties[nextIndex]);
  }, [difficulty]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
  }, []);

  const endGame = useCallback(async (finalScore) => {
    setIsPlaying(false);
    // Submit score to API
    try {
      await apiService.submitScore(finalScore);
    } catch (err) {
      console.error('Failed to submit score to API:', err);
    }
    const updatedHighScores = { ...highScores };
    if (finalScore > updatedHighScores.userScore) {
      updatedHighScores.userScore = finalScore;
    }
    const topScores = [...(updatedHighScores.highScores || [])];
    topScores.push(['Anonymous', finalScore]);
    topScores.sort((a, b) => b[1] - a[1]);
    updatedHighScores.highScores = topScores.slice(0, 5);
    await saveHighScores(updatedHighScores);
  }, [highScores, saveHighScores]);

  const updateScore = useCallback(() => {
    const config = difficultyConfig[difficulty];
    const pointsToAdd = config.pointsPerTile;
    setScore((prevScore) => prevScore + pointsToAdd);
  }, [difficulty]);

  const nextLevel = useCallback(() => {
    setLevel((prevLevel) => prevLevel + 1);
    const config = difficultyConfig[difficulty];
    const bonus = Math.floor(score * (config.bonusMultiplier - 1));
    setScore((prevScore) => prevScore + bonus);
  }, [difficulty, score]);

  const getCurrentConfig = useCallback(() => {
    return difficultyConfig[difficulty];
  }, [difficulty]);

  const value = {
    difficulty,
    level,
    score,
    highScores,
    isPlaying,
    setDifficulty,
    changeDifficulty,
    setLevel,
    setScore,
    updateScore,
    startGame,
    endGame,
    nextLevel,
    saveHighScores,
    getCurrentConfig,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};