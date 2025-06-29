// src/screens/ScoreboardScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../contexts/GameContext';
import { useSound } from '../contexts/SoundContext';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import { colors } from '../constants/colors';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');

const ScoreboardScreen = () => {
  const navigation = useNavigation();
  const { highScores, saveHighScores } = useGame();
  const { playSound } = useSound();
  const { username } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation values
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 1000,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Start star rotation
    startStarAnimation();
    
    // Load fresh scores
    loadScores();
  }, []);

  const startStarAnimation = () => {
    Animated.loop(
      Animated.timing(starRotation, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const loadScores = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await apiService.getHighScores();
      
      if (result.success) {
        await saveHighScores(result.data);
      } else if (!result.fromCache) {
        setError('Unable to load latest scores');
      }
    } catch (err) {
      console.error('Error loading scores:', err);
      setError('Failed to load scores');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleBack = async () => {
    await playSound('whoosh');
    navigation.goBack();
  };

  const renderHighScore = (score, index) => {
    const [name, points] = score;
    const isCurrentUser = name === username;
    const medal = getMedal(index);

    return (
      <View key={index} style={styles.scoreRow}>
        <Text style={styles.rankText} allowFontScaling={false}>
          {medal || `${index + 1}.`}
        </Text>
        <Text 
          style={[
            styles.nameText, 
            isCurrentUser && styles.currentUserText
          ]} 
          allowFontScaling={false}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text 
          style={[
            styles.scoreText,
            isCurrentUser && styles.currentUserText
          ]} 
          allowFontScaling={false}
        >
          {points}
        </Text>
      </View>
    );
  };

  const getMedal = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return null;
    }
  };

  const rotate = starRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const userScore = highScores?.userScore || 0;
  const topScores = highScores?.highScores || [];
  const sortedScores = [...topScores].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadScores(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.starContainer}>
          <Animated.Text
            style={[
              styles.star,
              { transform: [{ rotate }] }
            ]}
          >
            ⭐
          </Animated.Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim1 }}>
          <Text style={styles.title} allowFontScaling={false}>
            The Legends
          </Text>
        </Animated.View>

        <Animated.View style={[styles.scoresContainer, { opacity: fadeAnim2 }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : sortedScores.length > 0 ? (
            sortedScores.map((score, index) => renderHighScore(score, index))
          ) : (
            <Text style={styles.emptyText}>No scores yet!</Text>
          )}
        </Animated.View>

        <Animated.View style={[styles.userScoreContainer, { opacity: fadeAnim2 }]}>
          <View style={styles.divider} />
          <Text style={styles.yourScoreLabel} allowFontScaling={false}>
            Your Best:
          </Text>
          <Text style={styles.yourScoreValue} allowFontScaling={false}>
            {userScore}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim3 }]}>
          <Button
            text="← ← ←"
            onPress={handleBack}
            style={styles.backButton}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  starContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  star: {
    fontSize: width * 0.25,
    opacity: 0.9,
  },
  title: {
    fontSize: height * 0.07,
    color: colors.text,
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 30,
  },
  scoresContainer: {
    minHeight: 300,
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  rankText: {
    fontSize: height * 0.035,
    fontFamily: 'System',
    color: colors.primary,
    width: 40,
  },
  nameText: {
    flex: 1,
    fontSize: height * 0.04,
    fontFamily: 'System',
    color: colors.primary,
    marginRight: 10,
  },
  scoreText: {
    fontSize: height * 0.04,
    fontFamily: 'System',
    color: colors.primary,
    fontWeight: '600',
  },
  currentUserText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  userScoreContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  divider: {
    width: '80%',
    height: 2,
    backgroundColor: colors.primary,
    marginBottom: 20,
    opacity: 0.3,
  },
  yourScoreLabel: {
    fontSize: height * 0.035,
    fontFamily: 'System',
    color: colors.text,
    marginBottom: 5,
  },
  yourScoreValue: {
    fontSize: height * 0.05,
    fontFamily: 'System',
    color: colors.accent,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: 40,
  },
  backButton: {
    width: '100%',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    fontFamily: 'System',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 18,
    fontFamily: 'System',
  },
});

export default ScoreboardScreen;