import React from 'react';
import Button from './Button';
import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const BackButton = ({ onPress, text = '← Back', style, textStyle, ...props }) => (
  <Button
    text={text}
    onPress={onPress}
    style={[styles.backButton, style]}
    textStyle={[styles.backButtonText, textStyle]}
    {...props}
  />
);

const styles = StyleSheet.create({
  backButton: {
    width: 100,
    height: 40,
    marginBottom: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    borderWidth: 2,
    shadowColor: 'transparent',
    elevation: 0,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: colors.glow,
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
});

export default BackButton;
