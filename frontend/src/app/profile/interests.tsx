import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const interests = [
    {
        name: 'Music',
        icon: 'musical-notes-outline',
    },
    {
        name: 'Travel',
        icon: 'airplane-outline',
    },
    {
        name: 'Movies',
        icon: 'film-outline',
    },
    {
        name: 'Fitness',
        icon: 'barbell-outline',
    },
    {
        name: 'Photography',
        icon: 'camera-outline',
    },
    {
        name: 'Food',
        icon: 'restaurant-outline',
    },
    {
        name: 'Reading',
        icon: 'book-outline',
    },
    {
        name: 'Gaming',
        icon: 'game-controller-outline',
    },
    {
        name: 'Dancing',
        icon: 'body-outline',
    },
    {
        name: 'Sports',
        icon: 'football-outline',
    },
    {
        name: 'Dark Romance',
        icon: 'moon-outline',
    },
    {
        name: 'Dark Fantasy',
        icon: 'moon-outline',
    },
    {
        name: 'Forbidden Fantasy',
        icon: 'lock-closed-outline',
    },
    {
        name: 'Secret Desires',
        icon: 'eye-off-outline',
    },
    {
        name: 'Midnight Chemistry',
        icon: 'moon-outline',
    },
    {
        name: 'After Dark',
        icon: 'moon-outline',
    },
    {
        name: 'Wild Side',
        icon: 'flame-outline',
    },
    {
        name: 'Temptation',
        icon: 'rose-outline',
    },
    {
        name: 'Seductive',
        icon: 'heart-outline',
    },
    {
        name: 'Naughty',
        icon: 'flame-outline',
    },
    {
        name: 'Mystery & Desire',
        icon: 'sparkles-outline',
    },
    {
        name: 'Intense Chemistry',
        icon: 'flash-outline',
    },
    {
        name: 'Dangerous Attraction',
        icon: 'warning-outline',
    },
    {
        name: 'Hidden Desires',
        icon: 'eye-off-outline',
    },
    {
        name: 'Taboo Fantasy',
        icon: 'lock-closed-outline',
    },
    {
        name: 'Deep Connection',
        icon: 'heart-circle-outline',
    },
    {
        name: 'Emotional Bond',
        icon: 'heart-outline',
    },
    {
        name: 'Cuddling',
        icon: 'heart-outline',
    },
    {
        name: 'Kissing',
        icon: 'heart-outline',
    },
    {
        name: 'Date Nights',
        icon: 'calendar-outline',
    },
    {
        name: 'Love Languages',
        icon: 'chatbubble-heart-outline',
    },
    {
        name: 'Quality Time',
        icon: 'time-outline',
    },
    {
        name: 'Affection',
        icon: 'heart-outline',
    },
    {
        name: 'Flirting',
        icon: 'chatbubble-ellipses-outline',
    },
];

export default function InterestsScreen() {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleInterest = (item: string) => {
        if (selected.includes(item)) {
            setSelected(selected.filter((x) => x !== item));
            return;
        }

        // NO MAXIMUM LIMIT
        setSelected([...selected, item]);
    };

    // MINIMUM 5 REQUIRED
    const canContinue = selected.length >= 5;

    const handleContinue = () => {
        if (!canContinue) {
            return;
        }

        router.push('/profile/photos');
    };

    return (
        <LinearGradient
            colors={['#FFF6F8', '#FFFFFF']}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >

                {/* TOP BAR */}

                <View style={styles.topBar}>
                    <Pressable
                        style={styles.back}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={21}
                            color="#18181B"
                        />
                    </Pressable>

                    <Text style={styles.step}>
                        4 OF 8
                    </Text>
                </View>

                {/* PROGRESS */}

                <View style={styles.progress}>
                    <View style={styles.progressActive} />
                    <View style={styles.progressActive} />
                    <View style={styles.progressActive} />
                    <View style={styles.progressActive} />
                    <View style={styles.progressInactive} />
                    <View style={styles.progressInactive} />
                    <View style={styles.progressInactive} />
                    <View style={styles.progressInactive} />
                </View>

                {/* HEADER */}

                <View style={styles.header}>

                    <View style={styles.iconBox}>
                        <Ionicons
                            name="heart-outline"
                            size={23}
                            color="#FF3D71"
                        />
                    </View>

                    <Text style={styles.eyebrow}>
                        YOUR INTERESTS
                    </Text>

                    <Text style={styles.title}>
                        What are{' '}
                        <Text style={styles.pink}>
                            you into?
                        </Text>
                    </Text>

                    <Text style={styles.subtitle}>
                        Choose the things you love. This helps us
                        find people who share your interests.
                    </Text>

                </View>

                {/* SELECTED COUNT */}

                <View style={styles.countRow}>

                    <View style={styles.countLeft}>
                        <View style={styles.countDot} />

                        <Text style={styles.countText}>
                            {selected.length} selected
                        </Text>
                    </View>

                    <Text style={styles.minimum}>
                        MINIMUM 5
                    </Text>

                </View>

                {/* INTERESTS */}

                <View style={styles.grid}>

                    {interests.map((item) => {
                        const active = selected.includes(item.name);

                        return (
                            <Pressable
                                key={item.name}
                                onPress={() =>
                                    toggleInterest(item.name)
                                }
                                style={[
                                    styles.card,
                                    active &&
                                        styles.cardActive,
                                ]}
                            >

                                {/* ICON */}

                                <View
                                    style={[
                                        styles.interestIcon,
                                        active &&
                                            styles.interestIconActive,
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={18}
                                        color={
                                            active
                                                ? '#FF3D71'
                                                : '#71717A'
                                        }
                                    />
                                </View>

                                {/* NAME */}

                                <Text
                                    style={[
                                        styles.cardText,
                                        active &&
                                            styles.cardTextActive,
                                    ]}
                                >
                                    {item.name}
                                </Text>

                                {/* CHECK */}

                                <View
                                    style={[
                                        styles.checkCircle,
                                        active &&
                                            styles.checkCircleActive,
                                    ]}
                                >
                                    {active && (
                                        <Ionicons
                                            name="checkmark"
                                            size={13}
                                            color="#FFFFFF"
                                        />
                                    )}
                                </View>

                            </Pressable>
                        );
                    })}

                </View>

                {/* CONTINUE BUTTON */}

                <Pressable
                    onPress={handleContinue}
                    disabled={!canContinue}
                    style={[
                        styles.button,
                        !canContinue &&
                            styles.buttonDisabled,
                    ]}
                >
                    <Text style={styles.buttonText}>
                        Continue
                    </Text>

                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                    />
                </Pressable>

                {/* FOOTER */}

                <View style={styles.trust}>

                    <Ionicons
                        name="sparkles-outline"
                        size={15}
                        color="#71717A"
                    />

                    <Text style={styles.trustText}>
                        Select at least 5 interests that represent you
                    </Text>

                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({

    /* CONTAINER */

    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFF6F8',
    },

    scroll: {
        flexGrow: 1,
        width: '100%',
        paddingHorizontal: 24,
        paddingTop: 52,
        paddingBottom: 32,
    },

    /* TOP BAR */

    topBar: {
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    back: {
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
        shadowRadius: 10,

        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 3,
    },

    step: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
        color: '#71717A',
    },

    /* PROGRESS */

    progress: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 23,
    },

    progressActive: {
        flex: 1,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#FF3D71',
    },

    progressInactive: {
        flex: 1,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#E4E4E7',
    },

    /* HEADER */

    header: {
        marginTop: 30,
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FFE6ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },

    eyebrow: {
        color: '#FF3D71',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },

    title: {
        color: '#18181B',
        fontSize: 34,
        lineHeight: 40,
        fontWeight: '900',
        letterSpacing: -0.8,
    },

    pink: {
        color: '#FF3D71',
    },

    subtitle: {
        color: '#71717A',
        fontSize: 14,
        lineHeight: 21,
        marginTop: 11,
        maxWidth: 390,
    },

    /* COUNT */

    countRow: {
        marginTop: 25,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    countLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    countDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3D71',
    },

    countText: {
        color: '#18181B',
        fontSize: 13,
        fontWeight: '800',
    },

    minimum: {
        color: '#A1A1AA',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    /* GRID */

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 9,
    },

    /* INTEREST CARD */

    card: {
        width: '48.5%',
        minHeight: 57,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    cardActive: {
        borderColor: '#FF3D71',
        backgroundColor: '#FFF6F8',
    },

    interestIcon: {
        width: 35,
        height: 35,
        borderRadius: 11,
        backgroundColor: '#F7F7F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },

    interestIconActive: {
        backgroundColor: '#FFE6ED',
    },

    cardText: {
        flex: 1,
        color: '#71717A',
        fontSize: 13,
        fontWeight: '700',
    },

    cardTextActive: {
        color: '#18181B',
        fontWeight: '800',
    },

    checkCircle: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#D4D4D8',
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkCircleActive: {
        backgroundColor: '#FF3D71',
        borderColor: '#FF3D71',
    },

    /* CONTINUE BUTTON */

    button: {
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF3D71',
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    buttonDisabled: {
        backgroundColor: '#D4D4D8',
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    /* FOOTER */

    trust: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 22,
    },

    trustText: {
        color: '#71717A',
        fontSize: 11,
    },

});
