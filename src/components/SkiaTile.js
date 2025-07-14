import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec, Group, Path, SweepGradient, RadialGradient } from '@shopify/react-native-skia';
import AppText from './AppText';

const SkiaTile = ({ width, height, borderRadius = 16, style }) => {
  // Curved highlight path (Bezier curve)
  const highlightPath = `M ${width * 0.15} ${height * 0.25} Q ${width * 0.5} ${height * 0.05}, ${width * 0.85} ${height * 0.25}`;
  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <Canvas style={{ width, height }}>
        {/* Metallic red gradient */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={borderRadius}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={[
              '#fffafa', // bright highlight
              '#ffe3ec',
              '#ffb3c6',
              '#ff5e62',
              '#b31217', // deep red
              '#2d0608', // shadow
            ]}
          />
        </RoundedRect>
        {/* Shiny highlight streak (top) */}
        <Group>
          <RoundedRect
            x={width * 0.1}
            y={height * 0.08}
            width={width * 0.8}
            height={height * 0.22}
            r={borderRadius * 0.7}
          >
            <LinearGradient
              start={vec(width * 0.1, height * 0.08)}
              end={vec(width * 0.9, height * 0.3)}
              colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.0)']}
            />
          </RoundedRect>
        </Group>
        {/* Curved highlight streak */}
        <Path
          path={highlightPath}
          style="stroke"
          strokeWidth={height * 0.07}
          strokeJoin="round"
          strokeCap="round"
          color="rgba(255,255,255,0.35)"
        />
        {/* Subtle radial reflection */}
        <RoundedRect
          x={width * 0.25}
          y={height * 0.45}
          width={width * 0.5}
          height={height * 0.35}
          r={borderRadius * 0.4}
        >
          <RadialGradient
            c={vec(width * 0.5, height * 0.6)}
            r={width * 0.25}
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.0)']}
          />
        </RoundedRect>
        {/* Faint shadow at the bottom for depth */}
        <RoundedRect
          x={width * 0.1}
          y={height * 0.85}
          width={width * 0.8}
          height={height * 0.12}
          r={borderRadius * 0.5}
        >
          <LinearGradient
            start={vec(width * 0.1, height * 0.85)}
            end={vec(width * 0.9, height)}
            colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.0)']}
          />
        </RoundedRect>
      </Canvas>
      {/* Overlay the question mark */}
      <View style={styles.textOverlay} pointerEvents="none">
        <AppText style={styles.question}>?</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  question: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SkiaTile; 