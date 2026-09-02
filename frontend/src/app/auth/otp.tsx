import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(30);

  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, '');

    if (!cleanValue) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }

    const next = [...otp];
    next[index] = cleanValue.slice(-1);
    setOtp(next);

    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = () => {
    setOtp(['', '', '', '', '', '']);
    setSeconds(30);
    inputs.current[0]?.focus();
  };

  const verified = otp.every((digit) => digit !== '');

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
        <View style={styles.content}>
          <Pressable
            style={styles.back}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#18181B"
            />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons
                name="chatbubble-ellipses"
                size={25}
                color="#FF3D71"
              />
            </View>

            <Text style={styles.eyebrow}>
              PHONE VERIFICATION
            </Text>

            <Text style={styles.title}>
              Check your{'\n'}
              <Text style={styles.pink}>messages.</Text>
            </Text>

            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to
            </Text>

            <View style={styles.numberRow}>
              <Text style={styles.number}>
                +91 •••••• 4821
              </Text>

              <Pressable onPress={() => router.back()}>
                <Text style={styles.edit}>Edit</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) =>
                  handleChange(value, index)
                }
                onKeyPress={(event) =>
                  handleKeyPress(event, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.otpInput,
                  digit !== '' && styles.activeInput,
                ]}
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            {seconds > 0 ? (
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <Text style={styles.timer}>
                  Resend in {seconds}s
                </Text>
              </Text>
            ) : (
              <Pressable onPress={resend}>
                <Text style={styles.resendButton}>
                  Didn't receive the code? Resend
                </Text>
              </Pressable>
            )}
          </View>

          <Pressable
            disabled={!verified}
            onPress={() => router.replace('/')}
            style={[
              styles.verifyButton,
              !verified && styles.disabled,
            ]}
          >
            <Text style={styles.verifyText}>
              Verify & continue
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
            />
          </Pressable>

          <View style={styles.security}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#71717A"
            />

            <Text style={styles.securityText}>
              Your verification is encrypted and secure
            </Text>
          </View>
        </View>
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

  content: {
    flex: 1,
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
    marginTop: 40,
  },

  icon: {
    width: 52,
    height: 52,
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
    fontSize: 14,
    marginTop: 17,
  },

  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  number: {
    color: '#27272A',
    fontSize: 14,
    fontWeight: '800',
  },

  edit: {
    color: '#FF3D71',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 10,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 45,
  },

  otpInput: {
    width: 48,
    height: 58,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#18181B',
  },

  activeInput: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF5F7',
  },

  resendContainer: {
    alignItems: 'center',
    marginTop: 25,
  },

  resendText: {
    color: '#71717A',
    fontSize: 13,
  },

  timer: {
    color: '#FF3D71',
    fontWeight: '800',
  },

  resendButton: {
    color: '#FF3D71',
    fontSize: 13,
    fontWeight: '800',
  },

  verifyButton: {
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3D71',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 35,
  },

  disabled: {
    opacity: 0.4,
  },

  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  security: {
    marginTop: 'auto',
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  securityText: {
    color: '#71717A',
    fontSize: 11,
  },
});