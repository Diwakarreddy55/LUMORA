import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=90',
        }}
        style={styles.background}
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.05)',
            'rgba(0,0,0,0.25)',
            'rgba(0,0,0,0.95)',
          ]}
          locations={[0, 0.45, 1]}
          style={styles.gradient}
        >
          <View style={styles.top}>
            <View style={styles.logo}>
              <Ionicons name="heart" size={23} color="#fff" />
            </View>

            <Text style={styles.brand}>LUMORA</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.badge}>
              <View style={styles.onlineDot} />
              <Text style={styles.badgeText}>REAL PEOPLE • REAL CONNECTIONS</Text>
            </View>

            <Text style={styles.title}>
              Meet someone{'\n'}
              <Text style={styles.titleAccent}>worth staying for.</Text>
            </Text>

            <Text style={styles.description}>
              Discover meaningful connections with people
              who share your energy, interests and intentions.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.primaryText}>Create an account</Text>
              <View style={styles.arrow}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.secondaryText}>
                Already a member? <Text style={styles.login}>Log in</Text>
              </Text>
            </Pressable>

            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service
              {'\n'}and Privacy Policy.
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },

  background: {
    width,
    height,
  },

  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 65,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },

  top: {
    alignItems: 'center',
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FF3D71',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },

  brand: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 5,
    marginTop: 12,
  },

  content: {
    width: '100%',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 18,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#55E878',
    marginRight: 7,
  },

  badgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  title: {
    color: '#fff',
    fontSize: 43,
    lineHeight: 47,
    fontWeight: '900',
    letterSpacing: -1.5,
  },

  titleAccent: {
    color: '#FF668B',
  },

  description: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
    marginBottom: 28,
    maxWidth: 350,
  },

  primaryButton: {
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FF3D71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  arrow: {
    position: 'absolute',
    right: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButton: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },

  login: {
    color: '#fff',
    fontWeight: '800',
  },

  terms: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 5,
  },
});