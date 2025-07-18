import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FlippableTile from './FlippableTile';
import AppText from './AppText';
import { colors } from '../constants/colors';

const LETTERS = ['N', 'E', 'M', 'E', 'R', 'Y'];

const SIZE_MAP = {
  small: 20,
  medium: 36,
  large: 48,
};

const TILE_SIZE_MAP = {
  small: 36,
  medium: 52,
  large: 68,
};

const Logo = ({ size = 'medium', style }) => {
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

  return (
    <View style={[styles.row, style]}>
      {LETTERS.map((letter, i) => (
        <View key={i} style={{ marginHorizontal: 4 }}>
          <FlippableTile
            isFlipped={flipped[i]}
            duration={500}
            style={{ width: tileSize, height: tileSize, borderRadius: 8, overflow: 'hidden' }}
            frontContent={
              <View
                style={[
                  styles.tile,
                  { backgroundColor: colors.primaryDark, borderColor: colors.primaryLight },
                ]}
              >
                <AppText
                  style={{
                    color: colors.text,
                    fontWeight: 'bold',
                    fontSize,
                    textAlign: 'center',
                    textShadowColor: colors.glow,
                    textShadowRadius: 8,
                  }}
                >
                  {letter}
                </AppText>
              </View>
            }
            backContent={
              <View
                style={[
                  styles.tile,
                  { backgroundColor: colors.primary, borderColor: colors.primaryDark },
                ]}
              >
                <AppText
                  style={{
                    color: colors.primaryDark,
                    fontWeight: 'bold',
                    fontSize,
                    textAlign: 'center',
                    textShadowColor: colors.glow,
                    textShadowRadius: 8,
                  }}
                >
                  ?
                </AppText>
              </View>
            }
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 8,
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default Logo;
