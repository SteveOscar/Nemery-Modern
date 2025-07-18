// Modern App.js using Expo, React Navigation, and Context API
import React from 'react';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/constants/theme';

// Contexts
import { GameProvider } from './src/contexts/GameContext';
import { UserProvider } from './src/contexts/UserContext';
import { SoundProvider } from './src/contexts/SoundContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import TransitionScreen from './src/screens/TransitionScreen';
import HelpScreen from './src/screens/HelpScreen';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <UserProvider>
      <GameProvider>
        <SoundProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animationEnabled: true,
                cardStyleInterpolator: ({ current: { progress } }) => ({
                  cardStyle: {
                    opacity: progress,
                  },
                }),
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Menu" component={MenuScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="Scoreboard" component={ScoreboardScreen} />
              <Stack.Screen name="Transition" component={TransitionScreen} />
              <Stack.Screen name="HelpScreen" component={HelpScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SoundProvider>
      </GameProvider>
    </UserProvider>
  );
}