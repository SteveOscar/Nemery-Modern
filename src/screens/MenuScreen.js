import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { colors } from '../constants/colors';

const MenuScreen = ({ 
  onStartGame, 
  onViewScoreboard, 
  onHelp, 
  onLogout,
  username,
  bestScore 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Logo size="large" style={styles.logo} />
          
          <Text style={styles.welcomeText}>
            Welcome, {username}!
          </Text>
          
          {bestScore > 0 && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Best Score</Text>
              <Text style={styles.scoreValue}>{bestScore}</Text>
            </View>
          )}

          <View style={styles.menuContainer}>
            <Button
              title="Start New Game"
              onPress={onStartGame}
              style={styles.menuButton}
            />
            
            <Button
              title="Scoreboard"
              onPress={onViewScoreboard}
              variant="secondary"
              style={styles.menuButton}
            />
            
            <Button
              title="How to Play"
              onPress={onHelp}
              variant="secondary"
              style={styles.menuButton}
            />
            
            <Button
              title="Logout"
              onPress={onLogout}
              variant="danger"
              style={styles.menuButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  menuContainer: {
    width: '100%',
  },
  menuButton: {
    marginBottom: 16,
  },
});

export default MenuScreen; 