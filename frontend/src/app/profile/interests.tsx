import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    StatusBar,
    Alert,
    Dimensions,
    PanResponder,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const interests = [
    { name: 'Music', icon: 'musical-notes-outline' },
    { name: 'Travel', icon: 'airplane-outline' },
    { name: 'Movies', icon: 'film-outline' },
    { name: 'Fitness', icon: 'barbell-outline' },
    { name: 'Photography', icon: 'camera-outline' },
    { name: 'Food', icon: 'restaurant-outline' },
    { name: 'Reading', icon: 'book-outline' },
    { name: 'Gaming', icon: 'game-controller-outline' },
    { name: 'Dancing', icon: 'body-outline' },
    { name: 'Sports', icon: 'football-outline' },

    { name: 'Dark Romance', icon: 'moon-outline' },
    { name: 'Dark Fantasy', icon: 'moon-outline' },
    { name: 'Forbidden Fantasy', icon: 'lock-closed-outline' },
    { name: 'Secret Desires', icon: 'eye-off-outline' },
    { name: 'Midnight Chemistry', icon: 'moon-outline' },
    { name: 'After Dark', icon: 'moon-outline' },
    { name: 'Wild Side', icon: 'flame-outline' },
    { name: 'Temptation', icon: 'rose-outline' },
    { name: 'Seductive', icon: 'heart-outline' },
    { name: 'Naughty', icon: 'flame-outline' },
    { name: 'Mystery & Desire', icon: 'sparkles-outline' },
    { name: 'Intense Chemistry', icon: 'flash-outline' },
    { name: 'Dangerous Attraction', icon: 'warning-outline' },
    { name: 'Hidden Desires', icon: 'eye-off-outline' },
    { name: 'Taboo Fantasy', icon: 'lock-closed-outline' },

    { name: 'Deep Connection', icon: 'heart-circle-outline' },
    { name: 'Emotional Bond', icon: 'heart-outline' },
    { name: 'Cuddling', icon: 'heart-outline' },
    { name: 'Kissing', icon: 'heart-outline' },
    { name: 'Date Nights', icon: 'calendar-outline' },
    { name: 'Love Languages', icon: 'chatbubble-heart-outline' },
    { name: 'Quality Time', icon: 'time-outline' },
    { name: 'Affection', icon: 'heart-outline' },
    { name: 'Flirting', icon: 'chatbubble-ellipses-outline' },
];

export default function InterestsScreen() {
    const [selected, setSelected] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    const position = useRef(new Animated.Value(0)).current;

    const currentInterest = interests[currentIndex];

    const canContinue = selected.length >= 5;

    const isSelected = (name: string) => {
        return selected.includes(name);
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT INTEREST
    |--------------------------------------------------------------------------
    */

    const toggleInterest = (name: string) => {
        setSelected((previous) => {
            if (previous.includes(name)) {
                return previous.filter((item) => item !== name);
            }

            return [...previous, name];
        });
    };

    /*
    |--------------------------------------------------------------------------
    | MOVE CARD
    |--------------------------------------------------------------------------
    */

    const goToCard = (direction: 'next' | 'previous') => {
        if (direction === 'next') {
            if (currentIndex >= interests.length - 1) {
                return;
            }

            Animated.timing(position, {
                toValue: -SCREEN_WIDTH,
                duration: 220,
                useNativeDriver: true,
            }).start(() => {
                position.setValue(0);
                setCurrentIndex((prev) => prev + 1);
            });
        } else {
            if (currentIndex <= 0) {
                return;
            }

            Animated.timing(position, {
                toValue: SCREEN_WIDTH,
                duration: 220,
                useNativeDriver: true,
            }).start(() => {
                position.setValue(0);
                setCurrentIndex((prev) => prev - 1);
            });
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SWIPE GESTURE
    |--------------------------------------------------------------------------
    */

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10;
            },

            onPanResponderMove: (_, gestureState) => {
                position.setValue(gestureState.dx);
            },

            onPanResponderRelease: (_, gestureState) => {
                const swipeDistance = gestureState.dx;

                if (swipeDistance < -80) {
                    goToCard('next');
                } else if (swipeDistance > 80) {
                    goToCard('previous');
                } else {
                    Animated.spring(position, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 80,
                        friction: 10,
                    }).start();
                }
            },
        })
    ).current;

    /*
    |--------------------------------------------------------------------------
    | API
    |--------------------------------------------------------------------------
    */

    const handleContinue = async () => {
        if (!canContinue) {
            Alert.alert(
                'Select more interests',
                'Please select at least 5 interests.'
            );
            return;
        }

        if (saving) {
            return;
        }

        try {
            setSaving(true);

            const userId = await AsyncStorage.getItem('user_id');

            if (!userId) {
                Alert.alert(
                    'Error',
                    'User information not found. Please login again.'
                );

                setSaving(false);
                return;
            }

            console.log('USER ID:', userId);
            console.log('SELECTED INTERESTS:', selected);

            const response = await fetch(
                `${API_BASE_URL}/api/profile/interests`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: Number(userId),
                        interests: selected,
                    }),
                }
            );

            const data = await response.json();

            console.log('API STATUS:', response.status);
            console.log('API RESPONSE:', data);

            if (!response.ok || data.code !== 0) {
                Alert.alert(
                    'Error',
                    data.message || 'Failed to save interests'
                );

                setSaving(false);
                return;
            }

            console.log('Interests saved successfully');

            router.push('/profile/lifestyle');
        } catch (error) {
            console.error('Save interests error:', error);

            Alert.alert(
                'Connection Error',
                'Unable to connect to server. Please try again.'
            );

            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <LinearGradient
            colors={['#FFF6F8', '#FFFFFF']}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />

            <View style={styles.screen}>
                {/* ------------------------------------------------------- */}
                {/* TOP BAR */}
                {/* ------------------------------------------------------- */}

                <View style={styles.topBar}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={21}
                            color="#18181B"
                        />
                    </Pressable>

                    <View style={styles.stepPill}>
                        <View style={styles.stepDot} />

                        <Text style={styles.stepText}>
                            STEP 4 OF 8
                        </Text>
                    </View>
                </View>

                {/* ------------------------------------------------------- */}
                {/* PROGRESS */}
                {/* ------------------------------------------------------- */}

                <View style={styles.progressContainer}>
                    {Array.from({ length: 8 }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressSegment,
                                index <= 3
                                    ? styles.progressActive
                                    : styles.progressInactive,
                            ]}
                        />
                    ))}
                </View>

                {/* ------------------------------------------------------- */}
                {/* HEADER */}
                {/* ------------------------------------------------------- */}

                <View style={styles.header}>
                    <View style={styles.eyebrowRow}>
                        <View style={styles.sparkleBox}>
                            <Ionicons
                                name="sparkles"
                                size={15}
                                color="#FF3D71"
                            />
                        </View>

                        <Text style={styles.eyebrow}>
                            YOUR VIBE
                        </Text>
                    </View>

                    <Text style={styles.title}>
                        What's your{' '}
                        <Text style={styles.titlePink}>
                            vibe?
                        </Text>
                    </Text>

                    <Text style={styles.subtitle}>
                        Explore what you love and choose the
                        interests that feel most like you.
                    </Text>
                </View>

                {/* ------------------------------------------------------- */}
                {/* SELECTED STATUS */}
                {/* ------------------------------------------------------- */}

                <View style={styles.statusCard}>
                    <View style={styles.statusLeft}>
                        <View style={styles.heartCircle}>
                            <Ionicons
                                name="heart"
                                size={15}
                                color="#FF3D71"
                            />
                        </View>

                        <View>
                            <Text style={styles.statusNumber}>
                                {selected.length}
                            </Text>

                            <Text style={styles.statusLabel}>
                                interests selected
                            </Text>
                        </View>
                    </View>

                    <View style={styles.minimumBox}>
                        <Text style={styles.minimumNumber}>
                            5+
                        </Text>

                        <Text style={styles.minimumText}>
                            MINIMUM
                        </Text>
                    </View>
                </View>

                {/* ------------------------------------------------------- */}
                {/* CAROUSEL */}
                {/* ------------------------------------------------------- */}

                <View style={styles.carouselArea}>
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.carouselCard,
                            {
                                transform: [
                                    {
                                        translateX: position,
                                    },
                                    {
                                        rotate: position.interpolate({
                                            inputRange: [
                                                -SCREEN_WIDTH,
                                                0,
                                                SCREEN_WIDTH,
                                            ],
                                            outputRange: [
                                                '-8deg',
                                                '0deg',
                                                '8deg',
                                            ],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {/* CARD TOP */}
                        <View style={styles.cardTop}>
                            <View style={styles.categoryPill}>
                                <Ionicons
                                    name="sparkles-outline"
                                    size={12}
                                    color="#FF3D71"
                                />

                                <Text style={styles.categoryText}>
                                    INTEREST
                                </Text>
                            </View>

                            {isSelected(currentInterest.name) && (
                                <View style={styles.selectedBadge}>
                                    <Ionicons
                                        name="checkmark"
                                        size={15}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.selectedBadgeText}>
                                        SELECTED
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* BIG ICON */}
                        <View
                            style={[
                                styles.bigIconOuter,
                                isSelected(currentInterest.name) &&
                                styles.bigIconOuterSelected,
                            ]}
                        >
                            <View
                                style={[
                                    styles.bigIconInner,
                                    isSelected(currentInterest.name) &&
                                    styles.bigIconInnerSelected,
                                ]}
                            >
                                <Ionicons
                                    name={currentInterest.icon as any}
                                    size={48}
                                    color="#FF3D71"
                                />
                            </View>
                        </View>

                        {/* CARD CONTENT */}
                        <Text style={styles.cardTitle}>
                            {currentInterest.name}
                        </Text>

                        <Text style={styles.cardDescription}>
                            A little piece of what makes
                            your personality unique.
                        </Text>

                        {/* CARD INDEX */}
                        <View style={styles.cardIndex}>
                            <Text style={styles.cardIndexCurrent}>
                                {String(currentIndex + 1).padStart(2, '0')}
                            </Text>

                            <View style={styles.cardIndexLine} />

                            <Text style={styles.cardIndexTotal}>
                                {String(interests.length).padStart(2, '0')}
                            </Text>
                        </View>

                        {/* SELECT */}
                        <Pressable
                            onPress={() =>
                                toggleInterest(currentInterest.name)
                            }
                            style={[
                                styles.selectButton,
                                isSelected(currentInterest.name) &&
                                styles.selectButtonSelected,
                            ]}
                        >
                            <Ionicons
                                name={
                                    isSelected(currentInterest.name)
                                        ? 'checkmark-circle'
                                        : 'heart-outline'
                                }
                                size={21}
                                color="#FFFFFF"
                            />

                            <Text style={styles.selectButtonText}>
                                {isSelected(currentInterest.name)
                                    ? 'SELECTED'
                                    : 'SELECT THIS INTEREST'}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>

                {/* ------------------------------------------------------- */}
                {/* CAROUSEL CONTROLS */}
                {/* ------------------------------------------------------- */}

                <View style={styles.carouselControls}>
                    <Pressable
                        style={[
                            styles.controlButton,
                            currentIndex === 0 &&
                            styles.controlDisabled,
                        ]}
                        disabled={currentIndex === 0}
                        onPress={() => goToCard('previous')}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={19}
                            color={
                                currentIndex === 0
                                    ? '#D4D4D8'
                                    : '#18181B'
                            }
                        />
                    </Pressable>

                    <View style={styles.pagination}>
                        {interests
                            .slice(
                                Math.max(0, currentIndex - 2),
                                Math.min(
                                    interests.length,
                                    currentIndex + 3
                                )
                            )
                            .map((_, index) => {
                                const actualIndex =
                                    Math.max(0, currentIndex - 2) + index;

                                return (
                                    <View
                                        key={actualIndex}
                                        style={[
                                            styles.paginationDot,
                                            actualIndex === currentIndex &&
                                            styles.paginationActive,
                                        ]}
                                    />
                                );
                            })}
                    </View>

                    <Pressable
                        style={[
                            styles.controlButton,
                            currentIndex === interests.length - 1 &&
                            styles.controlDisabled,
                        ]}
                        disabled={
                            currentIndex === interests.length - 1
                        }
                        onPress={() => goToCard('next')}
                    >
                        <Ionicons
                            name="arrow-forward"
                            size={19}
                            color={
                                currentIndex === interests.length - 1
                                    ? '#D4D4D8'
                                    : '#18181B'
                            }
                        />
                    </Pressable>
                </View>

                <Text style={styles.swipeHint}>
                    <Ionicons
                        name="swap-horizontal-outline"
                        size={13}
                        color="#A1A1AA"
                    />{' '}
                    Swipe to explore more interests
                </Text>

                {/* ------------------------------------------------------- */}
                {/* BOTTOM ACTION */}
                {/* ------------------------------------------------------- */}

                <View style={styles.bottomArea}>
                    <Pressable
                        onPress={handleContinue}
                        disabled={!canContinue || saving}
                        style={[
                            styles.continueButton,
                            (!canContinue || saving) &&
                            styles.continueDisabled,
                        ]}
                    >
                        <View style={styles.continueIcon}>
                            <Ionicons
                                name={
                                    saving
                                        ? 'hourglass-outline'
                                        : 'arrow-forward'
                                }
                                size={19}
                                color={
                                    canContinue && !saving
                                        ? '#FF3D71'
                                        : '#A1A1AA'
                                }
                            />
                        </View>

                        <View style={styles.continueTextContainer}>
                            <Text
                                style={[
                                    styles.continueTitle,
                                    (!canContinue || saving) &&
                                    styles.continueTitleDisabled,
                                ]}
                            >
                                {saving
                                    ? 'Saving...'
                                    : canContinue
                                        ? 'Continue'
                                        : `Select ${5 - selected.length} more`}
                            </Text>

                            <Text style={styles.continueSubtitle}>
                                {canContinue
                                    ? 'Continue to lifestyle'
                                    : 'Choose at least 5 interests'}
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={
                                canContinue && !saving
                                    ? '#FFFFFF'
                                    : '#A1A1AA'
                            }
                        />
                    </Pressable>
                </View>
            </View>
        </LinearGradient>
    );
}

/* ====================================================================== */
/* STYLES */
/* ====================================================================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF6F8',
    },

    screen: {
        flex: 1,
        width: '100%',
        maxWidth: 620,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 22,
    },

    /* ------------------------------------------------------- */
    /* TOP BAR */
    /* ------------------------------------------------------- */

    topBar: {
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFE6ED',
        shadowColor: '#18181B',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        elevation: 3,
    },

    stepPill: {
        height: 34,
        paddingHorizontal: 13,
        borderRadius: 17,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FFE6ED',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    stepDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#FF3D71',
    },

    stepText: {
        color: '#71717A',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },

    /* ------------------------------------------------------- */
    /* PROGRESS */
    /* ------------------------------------------------------- */

    progressContainer: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 21,
    },

    progressSegment: {
        flex: 1,
        height: 4,
        borderRadius: 5,
    },

    progressActive: {
        backgroundColor: '#FF3D71',
    },

    progressInactive: {
        backgroundColor: '#E4E4E7',
    },

    /* ------------------------------------------------------- */
    /* HEADER */
    /* ------------------------------------------------------- */

    header: {
        marginTop: 25,
    },

    eyebrowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 11,
    },

    sparkleBox: {
        width: 28,
        height: 28,
        borderRadius: 9,
        backgroundColor: '#FFE6ED',
        alignItems: 'center',
        justifyContent: 'center',
    },

    eyebrow: {
        color: '#FF3D71',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },

    title: {
        color: '#18181B',
        fontSize: 34,
        lineHeight: 40,
        fontWeight: '900',
        letterSpacing: -1,
    },

    titlePink: {
        color: '#FF3D71',
    },

    subtitle: {
        color: '#71717A',
        fontSize: 13,
        lineHeight: 20,
        marginTop: 8,
        maxWidth: 470,
    },

    /* ------------------------------------------------------- */
    /* STATUS CARD */
    /* ------------------------------------------------------- */

    statusCard: {
        marginTop: 17,
        height: 68,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FFE6ED',
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#18181B',
        shadowOpacity: 0.04,
        shadowRadius: 15,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        elevation: 2,
    },

    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    heartCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFE6ED',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statusNumber: {
        color: '#18181B',
        fontSize: 15,
        fontWeight: '900',
    },

    statusLabel: {
        color: '#71717A',
        fontSize: 10,
        marginTop: 1,
    },

    minimumBox: {
        alignItems: 'flex-end',
    },

    minimumNumber: {
        color: '#FF3D71',
        fontSize: 13,
        fontWeight: '900',
    },

    minimumText: {
        color: '#A1A1AA',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.7,
        marginTop: 1,
    },

    /* ------------------------------------------------------- */
    /* CAROUSEL */
    /* ------------------------------------------------------- */

    carouselArea: {
        flex: 1,
        minHeight: 310,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
    },

    carouselCard: {
        width: '100%',
        maxWidth: 470,
        minHeight: 365,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FFE6ED',
        padding: 20,
        alignItems: 'center',
        shadowColor: '#FF3D71',
        shadowOpacity: 0.10,
        shadowRadius: 28,
        shadowOffset: {
            width: 0,
            height: 13,
        },
        elevation: 5,
    },

    cardTop: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    categoryPill: {
        height: 27,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: '#FFF6F8',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    categoryText: {
        color: '#FF3D71',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },

    selectedBadge: {
        height: 27,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: '#FF3D71',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    selectedBadgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.7,
    },

    /* ------------------------------------------------------- */
    /* BIG ICON */
    /* ------------------------------------------------------- */

    bigIconOuter: {
        width: 125,
        height: 125,
        borderRadius: 42,
        backgroundColor: '#FFF6F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    bigIconOuterSelected: {
        backgroundColor: '#FFE6ED',
        transform: [
            {
                scale: 1.04,
            },
        ],
    },

    bigIconInner: {
        width: 91,
        height: 91,
        borderRadius: 31,
        backgroundColor: '#FFE6ED',
        alignItems: 'center',
        justifyContent: 'center',
    },

    bigIconInnerSelected: {
        backgroundColor: '#FFFFFF',
    },

    /* ------------------------------------------------------- */
    /* CARD CONTENT */
    /* ------------------------------------------------------- */

    cardTitle: {
        color: '#18181B',
        fontSize: 25,
        fontWeight: '900',
        marginTop: 16,
        textAlign: 'center',
    },

    cardDescription: {
        color: '#71717A',
        fontSize: 11,
        lineHeight: 17,
        textAlign: 'center',
        maxWidth: 270,
        marginTop: 5,
    },

    cardIndex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },

    cardIndexCurrent: {
        color: '#FF3D71',
        fontSize: 10,
        fontWeight: '900',
    },

    cardIndexLine: {
        width: 28,
        height: 1,
        backgroundColor: '#E4E4E7',
    },

    cardIndexTotal: {
        color: '#A1A1AA',
        fontSize: 9,
        fontWeight: '800',
    },

    /* ------------------------------------------------------- */
    /* SELECT BUTTON */
    /* ------------------------------------------------------- */

    selectButton: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FF3D71',
        marginTop: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    selectButtonSelected: {
        backgroundColor: '#18181B',
    },

    selectButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    /* ------------------------------------------------------- */
    /* CONTROLS */
    /* ------------------------------------------------------- */

    carouselControls: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },

    controlButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    controlDisabled: {
        opacity: 0.55,
    },

    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        minWidth: 60,
        justifyContent: 'center',
    },

    paginationDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#D4D4D8',
    },

    paginationActive: {
        width: 18,
        backgroundColor: '#FF3D71',
    },

    swipeHint: {
        color: '#A1A1AA',
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 9,
    },

    /* ------------------------------------------------------- */
    /* BOTTOM */
    /* ------------------------------------------------------- */

    bottomArea: {
        width: '100%',
    },

    continueButton: {
        width: '100%',
        minHeight: 62,
        borderRadius: 22,
        backgroundColor: '#FF3D71',
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#FF3D71',
        shadowOpacity: 0.18,
        shadowRadius: 15,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        elevation: 4,
    },

    continueDisabled: {
        backgroundColor: '#E4E4E7',
        shadowOpacity: 0,
        elevation: 0,
    },

    continueIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    continueTextContainer: {
        flex: 1,
        marginLeft: 10,
    },

    continueTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
    },

    continueTitleDisabled: {
        color: '#71717A',
    },

    continueSubtitle: {
        color: '#FFE6ED',
        fontSize: 9,
        marginTop: 2,
    },
});