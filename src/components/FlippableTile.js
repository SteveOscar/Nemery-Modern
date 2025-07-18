// src/components/FlippableTile.js
import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

function FlippableTile({ frontContent, backContent, isFlipped, duration = 500, style }) {
  const flipAnim = useRef(new Animated.Value(isFlipped ? 180 : 0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, duration]);

  const frontStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, style, { transform: [{ perspective: 1000 }] }]}>
      <Animated.View style={[styles.side, frontStyle]}>{frontContent}</Animated.View>
      <Animated.View style={[styles.side, styles.backSide, backStyle]}>{backContent}</Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  side: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  backSide: {
    // No additional transform here
  },
});

export default FlippableTile;
