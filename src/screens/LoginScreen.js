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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useSound } from '../contexts/SoundContext';
import Logo from '../components/Logo';
import Button from '../components/Button';
import AppText from '../components/AppText';
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
      <LinearGradient
        colors={[colors.background, colors.gameBoard, colors.primaryDark, colors.primary]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[colors.overlay, colors.overlayLight]}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
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
              color="#ffffff" 
              style={styles.loader}
            />
          )}
          
          <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim1 }]}>
            <AppText style={styles.welcomeText} allowFontScaling={false}>
              Welcome to
            </AppText>
            <Logo letters="NEMERY" />
          </Animated.View>
          
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim2 }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.formCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppText style={styles.instructionText} allowFontScaling={false}>
                Create a User Name:
              </AppText>
            </LinearGradient>
          </Animated.View>
          
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim3 }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.inputCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                autoCorrect={false}
                autoCapitalize="none"
                maxLength={20}
                selectionColor="#ffffff"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={handleFocus}
                onBlur={handleBlur}
                editable={!isLoading}
                fontFamily="System"
              />
              
              <Button
                text="Submit"
                onPress={handleLogin}
                style={styles.submitButton}
                disabled={isLoading}
              />
              
              {displayError ? (
                <AppText style={styles.errorText} allowFontScaling={false}>
                  {displayError}
                </AppText>
              ) : null}
              
              {message ? (
                <AppText style={styles.messageText} allowFontScaling={false}>
                  {message}
                </AppText>
              ) : null}
            </LinearGradient>
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
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    color: colors.text,
    fontFamily: 'System',
    marginBottom: -10,
    fontWeight: '600',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  formContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  instructionText: {
    fontSize: height * 0.03,
    color: '#ffffff',
    fontFamily: 'System',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  inputCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: height * 0.025,
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageText: {
    color: '#51cf66',
    fontSize: height * 0.025,
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  spacer: {
    height: 100,
  },
});

export default LoginScreen;