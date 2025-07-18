import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const { difficulty, changeDifficulty, startGame, resetGameState } = useGame();
  const { playSound, soundEnabled, toggleSound } = useSound();
  const { username, isAuthenticated } = useUser();

  // Reanimated shared values
  const fadeAnims = useRef(
    Array(5)
      .fill()
      .map(() => useSharedValue(0))
  ).current;

  // Flip card ref for animation control
  const flipCardRef = useRef(null);

  const [helpText] = useState('How To Play');
  const { backgroundMusicEnabled, toggleBackgroundMusic } = useSound();

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
          duration: 700 - index * 100,
          easing: Easing.out(Easing.ease),
        })
      );
    });

    // Start continuous flipping animation
    startFlippingAnimation();
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      resetGameState();
    }, [resetGameState])
  );

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
    resetGameState();
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
    navigation.navigate('HelpScreen');
  };

  const getDifficultyEmoji = () => {
    switch (difficulty) {
      case 'Easy':
        return '😀';
      case 'Medium':
        return '😐';
      case 'Hard':
        return '😳';
      case 'Extreme':
        return '💀';
      default:
        return '😀';
    }
  };

  const fadeAnimatedStyles = fadeAnims.map((anim, index) =>
    useAnimatedStyle(() => ({
      opacity: anim.value,
    }))
  );

  return (
    <View style={styles.container}>
      {console.log('Gradient colors:', [
        colors.background,
        colors.gameBoard,
        colors.primaryDark,
        colors.primary,
      ])}
      <LinearGradient
        colors={[colors.background, colors.gameBoard, colors.primaryDark, colors.primary]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[colors.overlay, colors.overlayLight]}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.surface, colors.background]}
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
      </View> */}

      <View style={styles.menuContainer}>
        <Animated.View style={fadeAnimatedStyles[0]}>
          <Logo letters="NEMERY" />
          <AppText style={styles.subtext}>Numbers + Memory</AppText>
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[0]]}>
          <Button text="Start" onPress={handleStartGame} sound={soundEnabled} />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[1]]}>
          <Button
            text={`Difficulty: ${getDifficultyEmoji()}`}
            onPress={handleDifficultyChange}
            sound={soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[2]]}>
          <Button text="High Scores" onPress={handleHighScores} sound={soundEnabled} />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[3]]}>
          <Button text={helpText} onPress={handleHelp} sound={soundEnabled} />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[4]]}>
          <Button
            text={`Sound Effects: ${soundEnabled ? 'ON' : 'OFF'}`}
            onPress={toggleSound}
            sound={!soundEnabled}
          />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, fadeAnimatedStyles[4]]}>
          <Button
            text={`Music: ${backgroundMusicEnabled ? 'ON' : 'OFF'}`}
            onPress={toggleBackgroundMusic}
            sound={soundEnabled}
          />
        </Animated.View>
      </View>

      <LinearGradient
        colors={[colors.overlay, colors.overlayLight]}
        style={styles.welcomeContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <AppText
          style={[styles.welcomeText, { color: colors.text, textShadowColor: colors.glow }]}
          allowFontScaling={false}
        >
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
    marginTop: -40,
  },
  iconWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: colors.surface,
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
    marginBottom: 0,
  },
  welcomeContainer: {
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderColor: colors.primary,
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: colors.black,
  },
  welcomeText: {
    fontSize: 18,
    color: colors.text,
    fontFamily: 'System',
    fontWeight: '600',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtext: {
    fontSize: 18,
    color: colors.text,
    fontFamily: 'System',
    fontWeight: '600',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    alignSelf: 'center',
    marginTop: -30,
    marginBottom: 24,
  },
});

export default MenuScreen;
