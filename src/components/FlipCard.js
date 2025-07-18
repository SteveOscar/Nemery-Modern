import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const FlipCard = forwardRef(
  ({ children, style, duration = 600, flipDirection = 'y', perspective = 1000 }, ref) => {
    const rotate = useSharedValue(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const frontAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { perspective },
          flipDirection === 'y'
            ? { rotateY: `${rotate.value}deg` }
            : { rotateX: `${rotate.value}deg` },
        ],
        opacity: interpolate(rotate.value, [0, 90, 91, 180], [1, 1, 0, 0], Extrapolate.CLAMP),
        zIndex: interpolate(rotate.value, [0, 90, 91, 180], [1, 1, 0, 0], Extrapolate.CLAMP),
      };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { perspective },
          flipDirection === 'y'
            ? { rotateY: `${rotate.value + 180}deg` }
            : { rotateX: `${rotate.value + 180}deg` },
        ],
        opacity: interpolate(rotate.value, [0, 89, 90, 180], [0, 0, 1, 1], Extrapolate.CLAMP),
        zIndex: interpolate(rotate.value, [0, 89, 90, 180], [0, 0, 1, 1], Extrapolate.CLAMP),
      };
    });

    useImperativeHandle(ref, () => ({
      flip: () => {
        const newFlipped = !isFlipped;
        rotate.value = withTiming(newFlipped ? 180 : 0, { duration }, (finished) => {
          if (finished) {
            runOnJS(setIsFlipped)(newFlipped);
          }
        });
      },
    }));

    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[styles.side, frontAnimatedStyle]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          {children[0]}
        </Animated.View>
        <Animated.View
          style={[styles.side, backAnimatedStyle]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          {children[1]}
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  side: {
    position: 'absolute',
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  },
});

export default FlipCard;
