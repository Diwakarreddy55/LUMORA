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
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OTPScreen() {
    const { phone, purpose } = useLocalSearchParams<{
        phone?: string;
        purpose?: string;
    }>();

    const [otp, setOtp] = useState([
        '',
        '',
        '',
        '',
        '',
        '',
    ]);

    const [seconds, setSeconds] = useState(30);
    const [loading, setLoading] = useState(false);

    const inputs = useRef<Array<TextInput | null>>([]);

    /*
     * OTP TIMER
     */
    useEffect(() => {
        if (seconds <= 0) return;

        const timer = setInterval(() => {
            setSeconds((value) => value - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    /*
     * OTP INPUT
     */
    const handleChange = (
        value: string,
        index: number
    ) => {
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

    /*
     * BACKSPACE
     */
    const handleKeyPress = (
        event: any,
        index: number
    ) => {
        if (
            event.nativeEvent.key === 'Backspace' &&
            !otp[index] &&
            index > 0
        ) {
            inputs.current[index - 1]?.focus();
        }
    };

    /*
     * RESEND OTP
     */
    const resend = async () => {
        if (seconds > 0 || !phone || loading) {
            return;
        }

        if (!API_URL) {
            Alert.alert(
                'Configuration Error',
                'API URL is not configured.'
            );
            return;
        }

        try {
            setLoading(true);

            /*
             * LOGIN
             */
            if (purpose === 'login') {
                console.log(
                    '🔄 Resending LOGIN OTP...'
                );

                const response = await fetch(
                    `${API_URL}/api/auth/login/send-otp`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },

                        body: JSON.stringify({
                            phone: phone,
                        }),
                    }
                );

                const data = await response.json();

                console.log(
                    '📥 Login resend response:',
                    data
                );

                if (!response.ok) {
                    Alert.alert(
                        'Unable to resend',
                        data.message ||
                        'Failed to resend OTP'
                    );
                    return;
                }

                setOtp([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                ]);

                setSeconds(30);

                inputs.current[0]?.focus();

                Alert.alert(
                    'OTP Sent',
                    'A new login verification code has been sent.'
                );

                return;
            }

            /*
             * REGISTER
             */
            console.log(
                '🔄 Resending REGISTER OTP...'
            );

            const response = await fetch(
                `${API_URL}/api/auth/register/send-otp`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },

                    body: JSON.stringify({
                        phone: phone,
                    }),
                }
            );

            const data = await response.json();

            console.log(
                '📥 Register resend response:',
                data
            );

            if (!response.ok) {
                Alert.alert(
                    'Unable to resend',
                    data.message ||
                    'Failed to resend OTP'
                );
                return;
            }

            setOtp([
                '',
                '',
                '',
                '',
                '',
                '',
            ]);

            setSeconds(30);

            inputs.current[0]?.focus();

            Alert.alert(
                'OTP Sent',
                'A new verification code has been sent.'
            );

        } catch (error) {
            console.error(
                '❌ Resend OTP error:',
                error
            );

            Alert.alert(
                'Connection Error',
                'Unable to connect to server'
            );

        } finally {
            setLoading(false);
        }
    };

    /*
     * VERIFY OTP
     */
    const verifyOtp = async () => {
        if (!phone) {
            Alert.alert(
                'Error',
                'Phone number is missing'
            );
            return;
        }

        const enteredOtp = otp.join('');

        if (enteredOtp.length !== 6) {
            Alert.alert(
                'Invalid OTP',
                'Please enter the 6 digit OTP.'
            );
            return;
        }

        if (!API_URL) {
            Alert.alert(
                'Configuration Error',
                'API URL is not configured.'
            );
            return;
        }

        try {
            setLoading(true);

            console.log(
                '🔐 Verifying OTP...'
            );

            console.log(
                '📱 Phone:',
                phone
            );

            console.log(
                '🔢 OTP:',
                enteredOtp
            );

            /*
             * =====================================
             * LOGIN OTP VERIFICATION
             * =====================================
             */
            if (purpose === 'login') {
                console.log('🔑 LOGIN verification');

                const response = await fetch(
                    `${API_URL}/api/auth/login/verify-otp`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },

                        body: JSON.stringify({
                            phone: phone,
                            otp: enteredOtp,
                        }),
                    }
                );

                const data = await response.json();

                console.log(
                    '📥 Login verify response:',
                    data
                );

                // API ERROR
                if (!response.ok) {
                    Alert.alert(
                        'Login Failed',
                        data.message || 'Invalid OTP'
                    );

                    return;
                }

                // BACKEND SUCCESS CHECK
                if (!data.success) {
                    Alert.alert(
                        'Login Failed',
                        data.message || 'Unable to login'
                    );

                    return;
                }

                // JWT CHECK
                if (!data.token) {
                    console.error('❌ JWT token missing');

                    Alert.alert(
                        'Login Error',
                        'Authentication token was not received.'
                    );

                    return;
                }

                // ==========================================
                // SAVE JWT TOKEN
                // IMPORTANT: use "token"
                // ==========================================

                await AsyncStorage.setItem(
                    'token',
                    data.token
                );

                console.log('✅ JWT token saved');

                // Verify token was actually saved
                const savedToken =
                    await AsyncStorage.getItem('token');

                console.log(
                    '🔐 Token exists after save:',
                    !!savedToken
                );

                // ==========================================
                // SAVE USER
                // ==========================================

                if (data.user) {
                    await AsyncStorage.setItem(
                        'user',
                        JSON.stringify(data.user)
                    );

                    console.log(
                        '✅ User saved:',
                        data.user
                    );
                }

                // ==========================================
                // SAVE USER ID
                // ==========================================

                if (data.user?.id) {
                    await AsyncStorage.setItem(
                        'user_id',
                        String(data.user.id)
                    );

                    console.log(
                        '✅ User ID saved:',
                        data.user.id
                    );
                }

                // ==========================================
                // LOGIN SUCCESS
                // ==========================================

                console.log('🎉 LOGIN SUCCESS');

                router.replace('/dashboard');

                return;
            }



            /*
             * =====================================
             * REGISTER OTP VERIFICATION
             * =====================================
             */
            console.log(
                '📝 REGISTER verification'
            );

            const response = await fetch(
                `${API_URL}/api/auth/register/verify-otp`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },

                    body: JSON.stringify({
                        phone: phone,
                        otp: enteredOtp,
                    }),
                }
            );

            const data = await response.json();

            console.log(
                '📥 Register verify response:',
                data
            );

            /*
             * API ERROR
             */
            if (!response.ok) {
                Alert.alert(
                    'Verification Failed',
                    data.message ||
                    'Invalid OTP'
                );

                return;
            }

            /*
             * SAVE USER ID
             */
            if (data.user?.id) {
                await AsyncStorage.setItem(
                    'user_id',
                    String(data.user.id)
                );

                console.log(
                    '✅ User ID saved:',
                    data.user.id
                );
            }

            /*
             * REGISTER SUCCESS
             */
            Alert.alert(
                'Verified',
                'Mobile number verified successfully.',
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            router.replace('/dashboard');
                        },
                    },
                ]
            );

        } catch (error) {
            console.error(
                '❌ Verify OTP error:',
                error
            );

            Alert.alert(
                'Connection Error',
                'Unable to connect to server'
            );

        } finally {
            setLoading(false);
        }
    };

    const verified =
        otp.every(
            (digit) => digit !== ''
        );

    /*
     * DISPLAY PHONE NUMBER
     *
     * Example:
     * +919876543210
     *
     * becomes:
     * +91 •••••• 3210
     */
    const displayPhone = phone
        ? `${phone.slice(0, 3)} •••••• ${phone.slice(-4)}`
        : '+91 ••••••';

    return (
        <LinearGradient
            colors={[
                '#FFF6F8',
                '#FFFFFF',
            ]}
            style={styles.container}
        >
            <StatusBar
                barStyle="dark-content"
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <View style={styles.content}>

                    {/* BACK BUTTON */}
                    <Pressable
                        style={styles.back}
                        onPress={() => router.back()}
                        disabled={loading}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color="#18181B"
                        />
                    </Pressable>

                    {/* HEADER */}
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
                            <Text style={styles.pink}>
                                messages.
                            </Text>
                        </Text>

                        <Text style={styles.subtitle}>
                            We sent a 6-digit verification code to
                        </Text>

                        <View style={styles.numberRow}>

                            <Text style={styles.number}>
                                {displayPhone}
                            </Text>

                            <Pressable
                                onPress={() =>
                                    router.back()
                                }
                                disabled={loading}
                            >
                                <Text style={styles.edit}>
                                    Edit
                                </Text>
                            </Pressable>

                        </View>

                    </View>

                    {/* OTP INPUTS */}
                    <View style={styles.otpContainer}>

                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputs.current[index] =
                                        ref;
                                }}
                                value={digit}
                                onChangeText={(value) =>
                                    handleChange(
                                        value,
                                        index
                                    )
                                }
                                onKeyPress={(event) =>
                                    handleKeyPress(
                                        event,
                                        index
                                    )
                                }
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!loading}
                                style={[
                                    styles.otpInput,
                                    digit !== '' &&
                                    styles.activeInput,
                                ]}
                            />
                        ))}

                    </View>

                    {/* RESEND */}
                    <View
                        style={styles.resendContainer}
                    >

                        {seconds > 0 ? (

                            <Text
                                style={styles.resendText}
                            >
                                Didn't receive the code?{' '}
                                <Text
                                    style={styles.timer}
                                >
                                    Resend in {seconds}s
                                </Text>
                            </Text>

                        ) : (

                            <Pressable
                                onPress={resend}
                                disabled={loading}
                            >
                                <Text
                                    style={styles.resendButton}
                                >
                                    Didn't receive the code? Resend
                                </Text>
                            </Pressable>

                        )}

                    </View>

                    {/* VERIFY BUTTON */}
                    <Pressable
                        disabled={
                            !verified ||
                            loading
                        }
                        onPress={verifyOtp}
                        style={[
                            styles.verifyButton,
                            (!verified ||
                                loading) &&
                            styles.disabled,
                        ]}
                    >

                        <Text
                            style={styles.verifyText}
                        >
                            {loading
                                ? 'Please wait...'
                                : 'Verify & continue'}
                        </Text>

                        {!loading && (
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                color="#fff"
                            />
                        )}

                    </Pressable>

                    {/* SECURITY */}
                    <View style={styles.security}>

                        <Ionicons
                            name="shield-checkmark-outline"
                            size={18}
                            color="#71717A"
                        />

                        <Text
                            style={styles.securityText}
                        >
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