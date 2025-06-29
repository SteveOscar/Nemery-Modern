// src/screens/LoginScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useSound } from '../contexts/SoundContext';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading, error, message, clearError, isAuthenticated } = useUser();
  const { playSound } = useSound();
  
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');
  
  // Animation values
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // If already authenticated, go to menu
    if (isAuthenticated) {
      navigation.replace('Menu');
      return;
    }

    // Start animations
    Animated.sequence([
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isAuthenticated]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLocalError('');
    
    if (!username.trim()) {
      setLocalError('Enter a name');
      return;
    }
    
    if (username.length > 10) {
      setLocalError(`Name is ${username.length - 10} characters too long`);
      return;
    }

    const success = await login(username.trim());
    if (success) {
      await playSound('whoosh');
      navigation.replace('Menu');
    }
  };

  const handleFocus = () => {
    clearError();
    setLocalError('');
    scrollViewRef.current?.scrollTo({ y: 100, animated: true });
  };

  const handleBlur = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading && (
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={styles.loader}
            />
          )}
          
          <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim1 }]}>
            <Text style={styles.welcomeText} allowFontScaling={false}>
              Welcome to
            </Text>
            <Logo letters="NEMERY" />
          </Animated.View>
          
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim2 }]}>
            <Text style={styles.instructionText} allowFontScaling={false}>
              Create a User Name:
            </Text>
          </Animated.View>
          
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim3 }]}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={colors.accent + '80'}
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={20}
              selectionColor={colors.accent}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={!isLoading}
            />
            
            <Button
              text="Submit"
              onPress={handleLogin}
              style={styles.submitButton}
              disabled={isLoading}
            />
            
            {displayError ? (
              <Text style={styles.errorText} allowFontScaling={false}>
                {displayError}
              </Text>
            ) : null}
            
            {message ? (
              <Text style={styles.messageText} allowFontScaling={false}>
                {message}
              </Text>
            ) : null}
          </Animated.View>
          
          <View style={styles.spacer} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.1,
    paddingHorizontal: 20,
  },
  loader: {
    marginBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: height * 0.045,
    color: colors.primary,
    fontFamily: 'American-Typewriter',
    marginBottom: -10,
  },
  formContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: height * 0.03,
    color: colors.text,
    fontFamily: 'American-Typewriter',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    color: colors.text,
    backgroundColor: 'white',
    fontFamily: 'American-Typewriter',
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: height * 0.025,
    fontFamily: 'American-Typewriter',
    textAlign: 'center',
    marginTop: 10,
  },
  messageText: {
    color: colors.primary,
    fontSize: height * 0.025,
    fontFamily: 'American-Typewriter',
    textAlign: 'center',
    marginTop: 10,
  },
  spacer: {
    height: 100,
  },
});

export default LoginScreen;