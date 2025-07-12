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
// import CardFlip from 'react-native-card-flip';

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
  
  // Card flip ref for animation control
  const cardRef = useRef(null);
  
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
      if (cardRef.current) {
        cardRef.current.flip();
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
      <View style={styles.iconContainer}>
        {/* <CardFlip
          ref={cardRef}
          style={styles.iconWrapper}
          duration={1500}
          flipDirection="y"
          perspective={800}
        >
          <View style={styles.iconCard}>
            <Image
              source={require('../../assets/images/icon_logo.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.iconCard}>
            <Image
              source={require('../../assets/images/icon_logo.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </CardFlip> */}
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
    backgroundColor: colors.white,
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
  iconCard: {
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
    color: colors.white
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