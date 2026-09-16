import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Alert,
  Animated,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../../../config/api';

const choices = [
  {
    value: 'Non-smoker',
    label: 'Non-smoker',
    description: "I don't smoke",
    icon: 'leaf-outline',
  },
  {
    value: 'Occasionally',
    label: 'Occasionally',
    description: 'From time to time',
    icon: 'partly-sunny-outline',
  },
  {
    value: 'Social smoker',
    label: 'Social smoker',
    description: "Mostly when I'm out",
    icon: 'people-outline',
  },
  {
    value: 'Prefer not to say',
    label: 'Prefer not to say',
    description: "I'd rather keep this private",
    icon: 'eye-off-outline',
  },
];

export default function LifestyleScreen() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmall = width < 380;

  const [smoking, setSmoking] = useState('');

  const scaleAnimations = useRef(
    choices.reduce((acc, item) => {
      acc[item.value] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  const canContinue = smoking !== '';

  const selectChoice = (value: string) => {
    setSmoking(value);

    Animated.sequence([
      Animated.spring(scaleAnimations[value], {
        toValue: 1.025,
        useNativeDriver: true,
        speed: 25,
        bounciness: 6,
      }),
      Animated.spring(scaleAnimations[value], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }

    try {
      const userId =
        await AsyncStorage.getItem('user_id');

      if (!userId) {
        Alert.alert(
          'Error',
          'User information not found. Please login again.'
        );

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/profile/lifestyle`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            user_id: Number(userId),
            smoking: smoking,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Error',
          data.message || 'Failed to save lifestyle'
        );

        return;
      }

      router.push('/profile/location');

    } catch (error) {
      console.error(
        'handleContinue error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to connect to server'
      );
    }
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
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.content,
            isTablet && styles.contentTablet,
          ]}
        >

          {/* =====================================
              TOP BAR
          ===================================== */}

          <View style={styles.topRow}>

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#18181B"
              />
            </Pressable>

            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>
                6 OF 8
              </Text>
            </View>

          </View>


          {/* =====================================
              PROGRESS
          ===================================== */}

          <View style={styles.progressContainer}>

            {Array.from({ length: 8 }).map(
              (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressItem,
                    index < 6
                      ? styles.progressActive
                      : styles.progressInactive,
                  ]}
                />
              )
            )}

          </View>


          {/* =====================================
              LUMORA BRAND
          ===================================== */}

          <View style={styles.brandContainer}>

            <Text style={styles.brand}>
              L U M O R A
            </Text>

            <View style={styles.brandLineContainer}>

              <View style={styles.brandLine} />

              <Ionicons
                name="heart"
                size={13}
                color="#FF3D71"
                style={styles.brandHeart}
              />

              <View style={styles.brandLine} />

            </View>

          </View>


          {/* =====================================
              HERO
          ===================================== */}

          <View style={styles.hero}>

            <Text style={styles.sparkleText}>
              ✦
            </Text>

            <Text style={styles.eyebrow}>
              YOUR LIFESTYLE
            </Text>

            <Text
              style={[
                styles.title,
                isSmall && styles.titleSmall,
                isTablet && styles.titleTablet,
              ]}
            >
              Your{' '}
              <Text style={styles.titlePink}>
                Lifestyle
              </Text>
            </Text>

            <Text style={styles.heroQuestion}>
              What feels like you?
            </Text>

            <Text style={styles.subtitle}>
              Your everyday choices tell a little story
              {'\n'}
              about who you are.
            </Text>

          </View>


          {/* =====================================
              SMOKING SECTION
          ===================================== */}

          <View style={styles.section}>

            <View style={styles.sectionTop}>

              <View>
                <Text style={styles.sectionLabel}>
                  ABOUT YOUR VIBE
                </Text>

                <Text style={styles.sectionTitle}>
                  Smoking
                </Text>
              </View>

              {canContinue && (
                <View style={styles.selectedBadge}>

                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color="#FF3D71"
                  />

                  <Text style={styles.selectedBadgeText}>
                    SELECTED
                  </Text>

                </View>
              )}

            </View>


            {/* =================================
                SELECTED HERO
            ================================= */}

            {smoking &&
              choices
                .filter(
                  item => item.value === smoking
                )
                .map(item => (

                  <Animated.View
                    key={item.value}
                    style={{
                      transform: [
                        {
                          scale:
                            scaleAnimations[
                              item.value
                            ],
                        },
                      ],
                    }}
                  >

                    <Pressable
                      onPress={() =>
                        selectChoice(item.value)
                      }
                      style={styles.selectedCard}
                    >

                      {/* Decorative circles */}

                      <View
                        style={styles.selectedGlowOne}
                      />

                      <View
                        style={styles.selectedGlowTwo}
                      />


                      {/* Icon */}

                      <View style={styles.selectedIcon}>

                        <Ionicons
                          name={item.icon as any}
                          size={34}
                          color="#FF3D71"
                        />

                      </View>


                      {/* Content */}

                      <View style={styles.selectedContent}>

                        <Text style={styles.selectedTitle}>
                          {item.label}
                        </Text>

                        <Text
                          style={
                            styles.selectedDescription
                          }
                        >
                          {item.description}
                        </Text>

                        <View style={styles.yourChoice}>

                          <Ionicons
                            name="heart"
                            size={9}
                            color="#FF3D71"
                          />

                          <Text
                            style={styles.yourChoiceText}
                          >
                            YOUR CHOICE
                          </Text>

                        </View>

                      </View>


                      {/* Check */}

                      <View style={styles.selectedCheck}>

                        <Ionicons
                          name="checkmark"
                          size={19}
                          color="#FFFFFF"
                        />

                      </View>

                    </Pressable>

                  </Animated.View>
                ))}


            {/* =================================
                NOTHING SELECTED
            ================================= */}

            {!smoking && (
              <View style={styles.emptyHero}>

                <View style={styles.emptyIcon}>

                  <Ionicons
                    name="sparkles-outline"
                    size={27}
                    color="#FF3D71"
                  />

                </View>

                <View style={styles.emptyTextContainer}>

                  <Text style={styles.emptyTitle}>
                    Choose your lifestyle
                  </Text>

                  <Text
                    style={styles.emptyDescription}
                  >
                    Select the option that feels
                    most like you.
                  </Text>

                </View>

              </View>
            )}


            {/* =================================
                OTHER OPTIONS
            ================================= */}

            <View style={styles.otherOptions}>

              {choices
                .filter(
                  item => item.value !== smoking
                )
                .map((item) => (

                  <Animated.View
                    key={item.value}
                    style={[
                      styles.optionWrapper,
                      {
                        transform: [
                          {
                            scale:
                              scaleAnimations[
                                item.value
                              ],
                          },
                        ],
                      },
                    ]}
                  >

                    <Pressable
                      onPress={() =>
                        selectChoice(item.value)
                      }
                      style={styles.optionCard}
                    >

                      {/* Icon */}

                      <View style={styles.optionIcon}>

                        <Ionicons
                          name={item.icon as any}
                          size={21}
                          color="#18181B"
                        />

                      </View>


                      {/* Text */}

                      <View style={styles.optionContent}>

                        <Text style={styles.optionTitle}>
                          {item.label}
                        </Text>

                        <Text
                          style={
                            styles.optionDescription
                          }
                        >
                          {item.description}
                        </Text>

                      </View>


                      {/* Radio */}

                      <View style={styles.radio} />

                    </Pressable>

                  </Animated.View>

                ))}

            </View>

          </View>


          {/* =====================================
              PRIVACY
          ===================================== */}

          <View style={styles.privacy}>

            <View style={styles.privacyIcon}>

              <Ionicons
                name="lock-closed"
                size={15}
                color="#FF3D71"
              />

            </View>

            <View
              style={styles.privacyTextContainer}
            >

              <Text style={styles.privacyTitle}>
                Your answer stays private
              </Text>

              <Text style={styles.privacyText}>
                You control what appears on your profile.
              </Text>

            </View>

          </View>


          {/* =====================================
              SMALL DECORATION
          ===================================== */}

          <View style={styles.footerDecoration}>

            <Text style={styles.footerScript}>
              Better{'\n'}
              People
            </Text>

            <Ionicons
              name="heart-outline"
              size={39}
              color="#FF3D71"
              style={styles.footerHeart}
            />

          </View>


          {/* =====================================
              FOOTER BRAND
          ===================================== */}

          <View style={styles.footerBrand}>

            <Text style={styles.footerBrandName}>
              L U M O R A
            </Text>

            <Text style={styles.footerTagline}>
              REAL CONNECTIONS. BRIGHTER TOMORROWS.
            </Text>

          </View>


          {/* =====================================
              CONTINUE BUTTON
          ===================================== */}

          <Pressable
            style={[
              styles.button,
              !canContinue &&
                styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >

            <Text style={styles.buttonText}>
              Continue
            </Text>

            <View style={styles.buttonArrow}>

              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />

            </View>

          </Pressable>


          {/* =====================================
              SECURITY
          ===================================== */}

          <View style={styles.trust}>

            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color="#71717A"
            />

            <Text style={styles.trustText}>
              Your information is private and secure
            </Text>

          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },


  /* =====================================
     SCROLL
  ===================================== */

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 25,
  },

  content: {
    width: '100%',
    alignSelf: 'center',
  },

  contentTablet: {
    maxWidth: 700,
  },


  /* =====================================
     TOP
  ===================================== */

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE6ED',
  },

  stepNumber: {
    paddingHorizontal: 8,
  },

  stepNumberText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
  },


  /* =====================================
     PROGRESS
  ===================================== */

  progressContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 14,
  },

  progressItem: {
    flex: 1,
    height: 4,
    borderRadius: 10,
  },

  progressActive: {
    backgroundColor: '#FF3D71',
  },

  progressInactive: {
    backgroundColor: '#E4E4E7',
  },


  /* =====================================
     BRAND
  ===================================== */

  brandContainer: {
    alignItems: 'center',
    marginTop: 17,
  },

  brand: {
    color: '#18181B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
  },

  brandLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  brandLine: {
    width: 42,
    height: 1,
    backgroundColor: '#FF3D71',
    opacity: 0.35,
  },

  brandHeart: {
    marginHorizontal: 7,
  },


  /* =====================================
     HERO
  ===================================== */

  hero: {
    alignItems: 'center',
    marginTop: 17,
  },

  sparkleText: {
    color: '#FF3D71',
    fontSize: 19,
    height: 24,
  },

  eyebrow: {
    color: '#FF3D71',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginTop: 0,
  },

  title: {
    color: '#18181B',
    fontFamily:
      Platform.OS === 'android'
        ? 'serif'
        : 'Georgia',
    fontSize: 34,
    lineHeight: 39,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '700',
  },

  titleSmall: {
    fontSize: 31,
    lineHeight: 36,
  },

  titleTablet: {
    fontSize: 46,
    lineHeight: 52,
  },

  titlePink: {
    color: '#FF3D71',
  },

  heroQuestion: {
    color: '#18181B',
    fontFamily:
      Platform.OS === 'android'
        ? 'serif'
        : 'Georgia',
    fontSize: 19,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  subtitle: {
    color: '#71717A',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },


  /* =====================================
     SECTION
  ===================================== */

  section: {
    marginTop: 20,
  },

  sectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionLabel: {
    color: '#A1A1AA',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
  },

  sectionTitle: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 3,
  },

  selectedBadgeText: {
    color: '#FF3D71',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },


  /* =====================================
     SELECTED CARD
  ===================================== */

  selectedCard: {
    minHeight: 130,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    position: 'relative',

    shadowColor: '#FF3D71',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  selectedGlowOne: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 70,
    backgroundColor: '#FFE6ED',
    left: -45,
    top: -25,
    opacity: 0.7,
  },

  selectedGlowTwo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#FFE6ED',
    right: -30,
    bottom: -50,
    opacity: 0.6,
  },

  selectedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    zIndex: 2,
  },

  selectedContent: {
    flex: 1,
    marginLeft: 13,
    zIndex: 2,
    paddingRight: 30,
  },

  selectedTitle: {
    color: '#18181B',
    fontSize: 17,
    fontWeight: '900',
  },

  selectedDescription: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 3,
  },

  yourChoice: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE6ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 7,
  },

  yourChoiceText: {
    color: '#FF3D71',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  selectedCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF3D71',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 3,
  },


  /* =====================================
     EMPTY HERO
  ===================================== */

  emptyHero: {
    minHeight: 90,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  emptyTitle: {
    color: '#18181B',
    fontSize: 14,
    fontWeight: '900',
  },

  emptyDescription: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 3,
  },


  /* =====================================
     OTHER OPTIONS
  ===================================== */

  otherOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  optionWrapper: {
    width: '48.5%',
    flexGrow: 1,
  },

  optionCard: {
    minHeight: 91,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 11,
    justifyContent: 'space-between',
  },

  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionContent: {
    marginTop: 5,
  },

  optionTitle: {
    color: '#18181B',
    fontSize: 12,
    fontWeight: '900',
  },

  optionDescription: {
    color: '#71717A',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },

  radio: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    position: 'absolute',
    right: 9,
    top: 9,
  },


  /* =====================================
     PRIVACY
  ===================================== */

  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FFE6ED',
    padding: 10,
    marginTop: 13,
  },

  privacyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  privacyTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  privacyTitle: {
    color: '#18181B',
    fontSize: 11,
    fontWeight: '900',
  },

  privacyText: {
    color: '#71717A',
    fontSize: 9,
    marginTop: 2,
  },


  /* =====================================
     DECORATION
  ===================================== */

  footerDecoration: {
    height: 42,
    marginTop: 7,
    position: 'relative',
  },

  footerScript: {
    color: '#FF3D71',
    fontFamily:
      Platform.OS === 'android'
        ? 'serif'
        : 'Georgia',
    fontSize: 9,
    lineHeight: 11,
    fontStyle: 'italic',
    opacity: 0.55,
    marginLeft: 5,
  },

  footerHeart: {
    position: 'absolute',
    right: 8,
    bottom: 0,
    opacity: 0.35,
  },


  /* =====================================
     FOOTER BRAND
  ===================================== */

  footerBrand: {
    alignItems: 'center',
    marginTop: 0,
  },

  footerBrandName: {
    color: '#18181B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
  },

  footerTagline: {
    color: '#71717A',
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 4,
    textAlign: 'center',
  },


  /* =====================================
     CONTINUE BUTTON
  ===================================== */

  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF3D71',
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

    shadowColor: '#FF3D71',
    shadowOpacity: 0.20,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  buttonDisabled: {
    backgroundColor: '#E4E4E7',
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  buttonArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 9,
  },


  /* =====================================
     TRUST
  ===================================== */

  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },

  trustText: {
    color: '#71717A',
    fontSize: 9,
  },

});