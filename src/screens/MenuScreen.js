// src/screens/MenuScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
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
  
  // Animation values
  const fadeAnims = useRef(
    Array(5).fill().map(() => new Animated.Value(0))
  ).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const iconPerspective = useRef(new Animated.Value(0)).current;
  
  const [helpText] = useState('???');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }

    // Start fade animations
    fadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 700 - (index * 100),
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    });

    // Start icon animation
    startIconAnimation();
  }, [isAuthenticated]);

  const startIconAnimation = () => {
    const animateIcon = () => {
      const duration = Math.random() * 2000 + 6000;
      const delay = Math.random() * 2000 + 500;
      
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(iconRotation, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconPerspective, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(iconRotation, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconPerspective, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateIcon());
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

  const rotateY = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const perspective = iconPerspective.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.15, width * 0.3],
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Animated.Image
          source={require('../../assets/images/icon_logo.png')}
          style={[
            styles.icon,
            {
              transform: [
                { perspective },
                { rotateY },
              ],
            },
          ]}
        />
      </View>

      <View style={styles.menuContainer}>
        <Animated.View style={{ opacity: fadeAnims[0] }}>
          <Logo letters="NEMERY" />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnims[0] }]}>
          <Button
            text="Start"
            onPress={handleStartGame}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnims[1] }]}>
          <Button
            text={`Difficulty: ${getDifficultyEmoji()}`}
            onPress={handleDifficultyChange}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnims[2] }]}>
          <Button
            text="High Scores"
            onPress={handleHighScores}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnims[3] }]}>
          <Button
            text={helpText}
            onPress={handleHelp}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnims[4] }]}>
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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