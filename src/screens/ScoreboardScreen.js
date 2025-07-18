// src/screens/ScoreboardScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../contexts/GameContext';
import { useSound } from '../contexts/SoundContext';
import { useUser } from '../contexts/UserContext';
import apiService from '../services/api';
import AppText from '../components/AppText';
import { colors } from '../constants/colors';
import BackButton from '../components/BackButton';

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
      <LinearGradient
        key={index}
        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
        style={[styles.scoreRow, isCurrentUser && styles.currentUserRow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <AppText style={styles.rankText} allowFontScaling={false}>
          {medal || `${index + 1}.`}
        </AppText>
        <AppText 
          style={[
            styles.nameText, 
            isCurrentUser && styles.currentUserText
          ]} 
          allowFontScaling={false}
          numberOfLines={1}
        >
          {name}
        </AppText>
        <AppText 
          style={[
            styles.scoreText,
            isCurrentUser && styles.currentUserText
          ]} 
          allowFontScaling={false}
        >
          {points}
        </AppText>
      </LinearGradient>
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
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadScores(true)}
            tintColor="#ffffff"
          />
        }
      >

        <BackButton
          style={{marginTop: 15, marginLeft: 10}}
          onPress={() => navigation.navigate('Menu')}
        />
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
          <AppText style={styles.title} allowFontScaling={false}>
            The Legends
          </AppText>
        </Animated.View>

        <Animated.View style={[styles.scoresContainer, { opacity: fadeAnim2 }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : error ? (
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
              style={styles.errorContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppText style={styles.errorText}>{error}</AppText>
            </LinearGradient>
          ) : sortedScores.length > 0 ? (
            sortedScores.map((score, index) => renderHighScore(score, index))
          ) : (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.emptyContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppText style={styles.emptyText}>No scores yet!</AppText>
            </LinearGradient>
          )}
        </Animated.View>

        <Animated.View style={[styles.userScoreContainer, { opacity: fadeAnim2 }]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.userScoreCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.divider} />
            <AppText style={styles.yourScoreLabel} allowFontScaling={false}>
              Your Best:
            </AppText>
            <AppText style={styles.yourScoreValue} allowFontScaling={false}>
              {userScore}
            </AppText>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: colors.primary,
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scoresContainer: {
    minHeight: 300,
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  currentUserRow: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
  },
  rankText: {
    fontSize: height * 0.035,
    fontFamily: 'System',
    color: '#ffffff',
    width: 40,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameText: {
    flex: 1,
    fontSize: height * 0.04,
    fontFamily: 'System',
    color: '#ffffff',
    marginRight: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreText: {
    fontSize: height * 0.04,
    fontFamily: 'System',
    color: '#ffffff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  currentUserText: {
    color: '#51cf66',
    fontWeight: 'bold',
  },
  userScoreContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  userScoreCard: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  divider: {
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  yourScoreLabel: {
    fontSize: height * 0.035,
    fontFamily: 'System',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  yourScoreValue: {
    fontSize: height * 0.05,
    fontFamily: 'System',
    color: '#51cf66',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: 40,
  },
  backButton: {
    width: '100%',
  },
  errorContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ScoreboardScreen;