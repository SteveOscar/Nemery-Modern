// src/screens/GameScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../contexts/GameContext';
import { useSound } from '../hooks/useSound';

const { width, height } = Dimensions.get('window');

const CELL_SIZE = Math.floor(width * 0.2);
const CELL_PADDING = Math.floor(CELL_SIZE * 0.07);
const BORDER_RADIUS = CELL_PADDING;
const TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
const LETTER_SIZE = Math.floor(TILE_SIZE * 0.7);

const GameScreen = () => {
  const navigation = useNavigation();
  const { 
    level, 
    score, 
    difficulty, 
    updateScore, 
    endGame, 
    nextLevel,
    getCurrentConfig 
  } = useGame();
  const { playSound } = useSound();
  
  const config = getCurrentConfig();
  const [cols, rows] = config.gridSize;
  const totalTiles = cols * rows;
  
  // Game state
  const [hiddenNumbers, setHiddenNumbers] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [previousNumber, setPreviousNumber] = useState(-1);
  const [gamePhase, setGamePhase] = useState('showing'); // 'showing', 'hiding', 'playing', 'ended'
  const [timerProgress] = useState(new Animated.Value(1));
  
  // Refs for animations
  const tileAnimations = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Initialize tile animations
  useEffect(() => {
    tileAnimations.current = Array(totalTiles)
      .fill()
      .map(() => new Animated.Value(0));
  }, [totalTiles]);
  
  // Generate random numbers for tiles
  const generateNumbers = useCallback(() => {
    const max = typeof config.maxNumber === 'function' 
      ? config.maxNumber(level) 
      : config.maxNumber;
    
    const numbers = [];
    while (numbers.length < totalTiles) {
      const num = Math.floor(Math.random() * max);
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers;
  }, [config, level, totalTiles]);
  
  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);
  
  const startNewGame = () => {
    setHiddenNumbers(generateNumbers());
    setRevealedTiles([]);
    setSelectedTiles([]);
    setPreviousNumber(-1);
    setGamePhase('showing');
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: true,
    }).start();
    
    // Show tiles sequence
    showTilesSequence();
  };
  
  const showTilesSequence = async () => {
    await playSound('whoosh2');
    
    // Show tiles row by row
    for (let row = 0; row < rows; row++) {
      setTimeout(() => {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          animateTile(index, 0, 900);
        }
      }, row * 700);
    }
    
    // Hide tiles after showing
    setTimeout(() => {
      hideTilesSequence();
    }, 2500 * config.timeMultiplier);
  };
  
  const hideTilesSequence = async () => {
    setGamePhase('hiding');
    await playSound('whoosh');
    
    // Hide tiles row by row
    for (let row = 0; row < rows; row++) {
      setTimeout(() => {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          animateTile(index, 1, 500);
        }
      }, row * 200);
    }
    
    // Start game after hiding
    setTimeout(() => {
      setGamePhase('playing');
      startTimer();
    }, 1000);
  };
  
  const animateTile = (index, toValue, duration) => {
    Animated.timing(tileAnimations.current[index], {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };
  
  const startTimer = () => {
    const duration = 3500 * config.timeMultiplier * (0.9 ** (level - 1));
    
    playSound('beep');
    
    Animated.timing(timerProgress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start(() => {
      // Timer ended
      if (gamePhase === 'playing') {
        handleGameOver(false);
      }
    });
  };
  
  const handleTilePress = async (index) => {
    if (gamePhase !== 'playing' || selectedTiles.includes(index)) {
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound('tap');
    
    const number = hiddenNumbers[index];
    
    // Reveal tile
    setRevealedTiles([...revealedTiles, index]);
    setSelectedTiles([...selectedTiles, index]);
    
    // Animate tile
    animateTile(index, 2, 300);
    
    // Check if selection is valid
    if (number >= previousNumber) {
      setPreviousNumber(number);
      updateScore(selectedTiles.length + 1);
      
      // Check if level complete
      if (selectedTiles.length + 1 === totalTiles) {
        handleLevelComplete();
      }
    } else {
      // Wrong selection
      handleGameOver(false);
    }
  };
  
  const handleLevelComplete = async () => {
    setGamePhase('ended');
    await playSound('bell');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      nextLevel();
      navigation.navigate('Transition');
    }, 1000);
  };
  
  const handleGameOver = async (timeout) => {
    setGamePhase('ended');
    await playSound('buzzer');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Show all tiles
    showTilesSequence();
    
    setTimeout(() => {
      endGame(score);
      navigation.navigate('Menu');
    }, 3000);
  };
  
  const renderTile = (index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const number = hiddenNumbers[index];
    const isRevealed = revealedTiles.includes(index) || gamePhase === 'showing';
    
    const rotateX = tileAnimations.current[index]?.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['0deg', '-180deg', '-360deg'],
    }) || '0deg';
    
    return (
      <Pressable
        key={index}
        onPress={() => handleTilePress(index)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Animated.View
          style={[
            styles.tile,
            {
              left: col * CELL_SIZE + CELL_PADDING,
              top: row * CELL_SIZE + CELL_PADDING,
              transform: [
                { perspective: CELL_SIZE * 0.95 },
                { rotateX },
              ],
            },
          ]}
        >
          <Text style={