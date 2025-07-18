import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FlippableTile from './FlippableTile';
import AppText from './AppText';
import { colors } from '../constants/colors';

const LETTERS = ['N', 'E', 'M', 'E', 'R', 'Y'];

const SIZE_MAP = {
  small: 20,
  medium: 34,
  large: 48,
};

const TILE_SIZE_MAP = {
  small: 36,
  medium: 52,
  large: 68,
};

function Logo({ size = 'medium', style }) {
  const [flipped, setFlipped] = useState(Array(LETTERS.length).fill(false));
  const intervals = useRef([]);

  useEffect(() => {
    // Start random flipping intervals for each tile
    intervals.current = LETTERS.map((_, i) =>
      setInterval(
        () => {
          setFlipped((prev) => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
          });
        },
        1200 + Math.random() * 1200
      )
    );
    return () => {
      intervals.current.forEach(clearInterval);
    };
  }, []);

  const fontSize = SIZE_MAP[size] || SIZE_MAP.medium;
  const tileSize = TILE_SIZE_MAP[size] || TILE_SIZE_MAP.medium;
  const borderRadius = 16;
  const borderWidth = 2;

  // Size-dependent styles
  const tileWrapperStyle = {
    width: tileSize,
    height: tileSize,
    borderRadius,
    overflow: 'hidden',
  };
  const tileNumberTextStyle = {
    fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  };
  const tileQuestionTextStyle = {
    fontSize: fontSize,
    fontWeight: '800',
    color: colors.primary,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  };

  return (
    <View style={[styles.row, style]}>
      {LETTERS.map((letter, i) => (
        <View key={`${letter}-${i}`} style={styles.letterContainer}>
          <FlippableTile
            isFlipped={flipped[i]}
            duration={500}
            style={tileWrapperStyle}
            frontContent={
              <LinearGradient
                colors={[colors.primaryDark, colors.primary, colors.accentGlow]}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius,
                  borderWidth,
                  borderColor: colors.primary,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppText style={tileNumberTextStyle}>{letter}</AppText>
              </LinearGradient>
            }
            backContent={
              <LinearGradient
                colors={[colors.background, colors.primaryDark]}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius,
                  borderWidth,
                  borderColor: colors.primary,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppText style={tileQuestionTextStyle}>?</AppText>
              </LinearGradient>
            }
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 60,
    marginHorizontal: -50,
  },
  letterContainer: {
    marginHorizontal: 4,
  },
});

export default Logo;
