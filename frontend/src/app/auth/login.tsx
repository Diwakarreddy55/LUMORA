import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const [phone, setPhone] = useState('');



  const continueLogin = async () => {
    if (phone.length !== 10) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: `+91${phone}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to send OTP');
        return;
      }

      // Go to OTP screen
      router.push({
        pathname: '/auth/otp',
        params: {
          phone: `+91${phone}`,
          purpose: 'login',
        },
      });

    } catch (error) {
      console.error('Login OTP error:', error);
      alert('Unable to connect to server');
    }
  };


  return (
    <LinearGradient
      colors={['#FFF7F9', '#FFFFFF']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.back}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#18181B" />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="heart" size={24} color="#FF3D71" />
            </View>

            <Text style={styles.smallTitle}>WELCOME BACK</Text>

            <Text style={styles.title}>
              Good to see{'\n'}
              <Text style={styles.pink}>you again.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Sign in with your mobile number and
              continue your journey.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>MOBILE NUMBER</Text>

            <View style={styles.phoneContainer}>
              <View style={styles.country}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.code}>+91</Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color="#777"
                />
              </View>

              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter mobile number"
                placeholderTextColor="#A1A1AA"
                maxLength={10}
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={continueLogin}
              style={[
                styles.button,
                phone.length < 10 && styles.disabled,
              ]}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>OR</Text>
              <View style={styles.line} />
            </View>

            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#222" />
              <Text style={styles.socialText}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color="#222" />
              <Text style={styles.socialText}>
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              New here?{' '}
            </Text>

            <Pressable onPress={() => router.push('/auth/register')}>
              <Text style={styles.register}>
                Create an account
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 55,
  },

  back: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  header: {
    marginTop: 35,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  smallTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF3D71',
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    color: '#18181B',
    letterSpacing: -1,
  },

  pink: {
    color: '#FF3D71',
  },

  subtitle: {
    color: '#71717A',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
  },

  form: {
    marginTop: 40,
  },

  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#71717A',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  phoneContainer: {
    height: 62,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  country: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 13,
    borderRightWidth: 1,
    borderRightColor: '#E4E4E7',
  },

  flag: {
    fontSize: 20,
    marginRight: 7,
  },

  code: {
    color: '#27272A',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 5,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#18181B',
    paddingLeft: 13,
  },

  button: {
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3D71',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  disabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E7',
  },

  or: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 14,
  },

  socialButton: {
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },

  socialText: {
    color: '#27272A',
    fontSize: 14,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 30,
  },

  footerText: {
    color: '#71717A',
    fontSize: 13,
  },

  register: {
    color: '#FF3D71',
    fontSize: 13,
    fontWeight: '800',
  },
});