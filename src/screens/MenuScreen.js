// src/screens/MenuScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../contexts/GameContext';
import { useSound } from '../contexts/SoundContext';
import { useUser } from '../contexts/UserContext';
import Logo from '../components/Logo';
import Button from '../components/Button';
import AppText from '../components/AppText';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const MenuScreen = () => {
  const navigation = useNavigation();
  const { difficulty, changeDifficulty, startGame, soundEnabled, toggleSound } = useGame();
  const { playSound, playRandomSound } = useSound();
  const { username, isAuthenticated } = useUser();
  
  // Reanimated shared values
  const fadeAnims = useRef(
    Array(5).fill().map(() => useSharedValue(0))
  ).current;
  
  // Flip card ref for animation control
  const flipCardRef = useRef(null);
  
  const [helpText] = useState('???');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }

    // Start fade animations
    fadeAnims.forEach((anim, index) => {
      anim.value = withDelay(
        index * 150,
        withTiming(1, {
          duration: 700 - (index * 100),
          easing: Easing.out(Easing.ease),
        })
      );
    });

    // Start continuous flipping animation
    startFlippingAnimation();
  }, [isAuthenticated]);

  const startFlippingAnimation = () => {
    const flipInterval = setInterval(() => {
      if (flipCardRef.current) {
        flipCardRef.current.flip();
      }
    }, 3000); // Flip every 3 seconds

    return () => clearInterval(flipInterval);
  };

  const handleStartGame = async () => {
    await playSound('whoosh');
    startGame();
    navigation.navigate('Game');
  };

  const handleDifficultyChange = async () => {
    changeDifficulty();
    
    // Play scream sound when switching to Extreme
    if (difficulty === 'Hard') {
      await playSound('scream');
    }
  };

  const handleHighScores = () => {
    navigation.navigate('Scoreboard');
  };

  const handleHelp = () => {
    navigation.navigate('Help');
  };

  const getDifficultyEmoji = () => {
    switch (difficulty) {
      case 'Easy': return '😀';
      case 'Medium': return '😐';
      case 'Hard': return '😳';
      case 'Extreme': return '💀';
      default: return '😀';
    }
  };

  const fadeAnimatedStyles = fadeAnims.map((anim, index) => 
    useAnimatedStyle(() => ({
      opacity: anim.value,
    }))
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
          style={styles.iconWrapper}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={require('../../assets/images/icon_logo.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </LinearGradient>
      </View>

      <View style={styles.menuContainer}>
        <Animated.View style={fadeAnimatedStyles[0]}>
          <Logo letters="NEMERY" />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[0]]}>
          <Button
            text="Start"
            onPress={handleStartGame}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[1]]}>
          <Button
            text={`Difficulty: ${getDifficultyEmoji()}`}
            onPress={handleDifficultyChange}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[2]]}>
          <Button
            text="High Scores"
            onPress={handleHighScores}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[3]]}>
          <Button
            text={helpText}
            onPress={handleHelp}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[4]]}>
          <Button
            text={`Sound: ${soundEnabled ? 'ON' : 'OFF'}`}
            onPress={toggleSound}
            sound={!soundEnabled}
          />
        </Animated.View>
      </View>

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
        style={styles.welcomeContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <AppText style={styles.welcomeText} allowFontScaling={false}>
          Welcome, {username}!
        </AppText>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    width: width * 0.2,
    height: width * 0.2,
    opacity: 0.9,
  },
  menuContainer: {
    width: width * 0.8,
    maxWidth: 300,
  },
  buttonWrapper: {
    marginBottom: 8,
  },
  welcomeContainer: {
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'System',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default MenuScreen;