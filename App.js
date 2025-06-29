// Modern App.js using Expo, React Navigation, and Context API
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import * as Updates from 'expo-updates';
import { Audio } from 'expo-av';
import { View, ActivityIndicator } from 'react-native';

// Contexts
import { GameProvider } from './src/contexts/GameContext';
import { UserProvider } from './src/contexts/UserContext';
import { SoundProvider } from './src/contexts/SoundContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
// import HelpScreen from './src/screens/HelpScreen';
import TransitionScreen from './src/screens/TransitionScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Check for updates
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }

        // Load fonts - temporarily disabled due to missing font files
        // await Font.loadAsync({
        //   'American-Typewriter': require('./assets/fonts/AmericanTypewriter.ttf'),
        //   'Iowan-Old-Style': require('./assets/fonts/IowanOldStyle.ttf'),
        // });

        // Configure audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        });

      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
              {/* <Stack.Screen name="Help" component={HelpScreen} /> */}
              <Stack.Screen name="Transition" component={TransitionScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SoundProvider>
      </GameProvider>
    </UserProvider>
  );
}