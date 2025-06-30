// src/screens/MenuScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
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
  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(0.7);
  
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

    // Start icon animation
    startIconAnimation();
  }, [isAuthenticated]);

  const startIconAnimation = () => {
    const animateIcon = () => {
      const duration = Math.random() * 2000 + 4000;
      const delay = Math.random() * 2000 + 1000;
      
      // Create a flip effect using scale and opacity
      iconScale.value = withDelay(
        delay,
        withSequence(
          withTiming(0.3, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        )
      );
      
      iconOpacity.value = withDelay(
        delay,
        withSequence(
          withTiming(0.2, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.7, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        )
      );
      
      // Schedule next animation
      setTimeout(animateIcon, delay + duration + 2000);
    };
    
    animateIcon();
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

  // Reanimated animated styless
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
      ],
      opacity: iconOpacity.value,
    };
  });

  const fadeAnimatedStyles = fadeAnims.map((anim, index) => 
    useAnimatedStyle(() => ({
      opacity: anim.value,
    }))
  );

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
          <Image
            source={require('../../assets/images/icon_logo.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>
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

      <Text style={styles.welcomeText} allowFontScaling={false}>
        Welcome, {username}!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: width * 0.25,
    height: width * 0.25,
    opacity: 0.7,
  },
  menuContainer: {
    width: width * 0.8,
    maxWidth: 300,
  },
  buttonWrapper: {
    marginBottom: 5,
  },
  welcomeText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 18,
    color: colors.primary,
    fontFamily: 'System',
  },
});

export default MenuScreen;