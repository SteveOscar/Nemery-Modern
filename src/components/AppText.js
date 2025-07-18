import React from 'react';
import { Text } from 'react-native';
import { theme } from '../constants/theme';

export default function AppText({ style, children, ...props }) {
  return (
    <Text style={[{ fontFamily: theme.fontFamily }, style]} {...props}>
      {children}
    </Text>
  );
}
