import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Button from '../components/Button';
import { colors } from '../constants/colors';

const HelpScreen = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={onBack}
          variant="secondary"
          style={styles.backButton}
        />
        <Text style={styles.title}>How to Play</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <Text style={styles.sectionText}>
            Combine tiles with the same number to reach the 2048 tile and beyond!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <Text style={styles.sectionText}>
            • Swipe in any direction to move all tiles in that direction{'\n'}
            • When two tiles with the same number touch, they merge into one{'\n'}
            • After each move, a new tile (2 or 4) appears on the board{'\n'}
            • The game ends when no more moves are possible
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.sectionText}>
            • Each merge gives you points equal to the value of the merged tile{'\n'}
            • Higher value tiles give more points{'\n'}
            • Try to achieve the highest score possible!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <Text style={styles.sectionText}>
            • Keep your highest value tile in a corner{'\n'}
            • Build chains of increasing values{'\n'}
            • Don't let small tiles scatter around{'\n'}
            • Plan your moves ahead
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <Text style={styles.sectionText}>
            • Use the arrow buttons to move tiles{'\n'}
            • Tap "Undo" to reverse your last move{'\n'}
            • Tap "New Game" to start over{'\n'}
            • Your best score is automatically saved
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Good luck and have fun playing Nemery!
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    minWidth: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 80,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HelpScreen; 