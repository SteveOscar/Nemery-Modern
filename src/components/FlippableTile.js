import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const FlippableTile = ({ frontContent, backContent, isFlipped, duration = 500, style }) => {
  const flipAnim = useRef(new Animated.Value(isFlipped ? 180 : 0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, duration]);

  const flipStyle = {
    transform: [
      { perspective: 1000 },
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, style, flipStyle]}>
      <View style={styles.side}>{frontContent}</View>
      <View style={[styles.side, styles.backSide]}>{backContent}</View>
    </Animated.View>
  );
};

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
    transform: [{ rotateY: '180deg' }],
  },
});

export default FlippableTile;