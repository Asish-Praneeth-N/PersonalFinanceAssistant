// app/splash.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const onGetStarted = () => {
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ImageBackground
        source={require('../assets/images/splash-bg.png')}
        style={styles.background}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.content}>
          {/* Text block - moved a bit higher */}
          <View style={styles.centerBlock}>
            <Text style={styles.title}>Personal Finance Assistant</Text>
            <Text style={styles.subtitle}>Track • Save • Grow</Text>
          </View>

          {/* Bottom button */}
          <View style={styles.bottomBlock}>
            <Pressable
              onPress={onGetStarted}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={styles.buttonText}>Get Started  &gt;</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  centerBlock: {
    alignItems: 'center',
    // moved a bit up: was 0.18
    marginTop: Math.round(height * 0.12),
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'CinzelBlack', // 🔑 use the key from useFonts
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'CinzelBlack',
  },
  bottomBlock: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000', // black button
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff', // white text
    fontFamily: 'CinzelBlack',
  },
});