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
// import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);





  const continueRegister = async () => {
    if (phone.length !== 10 || !accepted) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: `+91${phone}`,
            purpose: 'register',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to send OTP');
        return;
      }

      router.push({
        pathname: '/auth/otp',
        params: {
          phone: `+91${phone}`,
          purpose: 'register',
        },
      });
    } catch (error) {
      console.error('Register OTP error:', error);
      alert('Unable to connect to server');
    }
  };

  return (
    <LinearGradient
      colors={['#FFF6F8', '#FFFFFF']}
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

          <View style={styles.progress}>
            <View style={styles.activeProgress} />
            <View style={styles.progressLine} />
            <View style={styles.progressLine} />
            <View style={styles.progressLine} />
          </View>

          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="sparkles" size={24} color="#FF3D71" />
            </View>

            <Text style={styles.eyebrow}>
              LET'S GET STARTED
            </Text>

            <Text style={styles.title}>
              Your story{'\n'}
              <Text style={styles.pink}>starts here.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Create your account and discover
              people who match your vibe.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              MOBILE NUMBER
            </Text>

            <View style={styles.phoneContainer}>
              <View style={styles.country}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.code}>+91</Text>
                <Ionicons name="chevron-down" size={14} color="#777" />
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
              style={styles.termsRow}
              onPress={() => setAccepted(!accepted)}
            >
              <View
                style={[
                  styles.checkbox,
                  accepted && styles.checked,
                ]}
              >
                {accepted && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color="#fff"
                  />
                )}
              </View>

              <Text style={styles.terms}>
                I agree to the Terms of Service and
                Privacy Policy.
              </Text>
            </Pressable>

            <Pressable
              onPress={continueRegister}
              style={[
                styles.button,
                (phone.length !== 10 || !accepted) &&
                styles.disabled,
              ]}
            >
              <Text style={styles.buttonText}>
                Verify my number
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </Pressable>
          </View>

          <View style={styles.trust}>
            <Ionicons
              name="shield-checkmark"
              size={17}
              color="#71717A"
            />

            <Text style={styles.trustText}>
              Your number is private and secure
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>

            <Pressable onPress={() => router.push('/auth/login')}>
              <Text style={styles.login}>
                Log in
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

  progress: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 25,
  },

  activeProgress: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#FF3D71',
  },

  progressLine: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E4E4E7',
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

  eyebrow: {
    color: '#FF3D71',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    color: '#18181B',
    fontSize: 39,
    lineHeight: 44,
    fontWeight: '900',
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
    marginTop: 38,
  },

  label: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '900',
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
    paddingLeft: 13,
    color: '#18181B',
    fontSize: 16,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checked: {
    backgroundColor: '#FF3D71',
    borderColor: '#FF3D71',
  },

  terms: {
    flex: 1,
    color: '#71717A',
    fontSize: 12,
    lineHeight: 18,
  },

  button: {
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3D71',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 25,
  },

  disabled: {
    opacity: 0.4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  trust: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 28,
  },

  trustText: {
    color: '#71717A',
    fontSize: 12,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 25,
  },

  footerText: {
    color: '#71717A',
    fontSize: 13,
  },

  login: {
    color: '#FF3D71',
    fontSize: 13,
    fontWeight: '800',
  },
});