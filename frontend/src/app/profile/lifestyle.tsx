import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const choices = [
  {
    value: 'Non-smoker',
    label: 'Non-smoker',
    icon: 'leaf-outline',
  },
  {
    value: 'Occasionally',
    label: 'Occasionally',
    icon: 'partly-sunny-outline',
  },
  {
    value: 'Social smoker',
    label: 'Social smoker',
    icon: 'people-outline',
  },
  {
    value: 'Prefer not to say',
    label: 'Prefer not to say',
    icon: 'eye-off-outline',
  },
];

export default function LifestyleScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [smoking, setSmoking] = useState('');

  const canContinue = smoking !== '';

  const handleContinue = () => {
    if (!canContinue) return;

    router.push('/profile/location');
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
        <View
          style={[
            styles.content,
            isTablet && styles.contentTablet,
          ]}
        >
          {/* BACK */}

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

          {/* PROGRESS - STEP 6 */}

          <View style={styles.progress}>
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />

            <View style={styles.progressLine} />
            <View style={styles.progressLine} />
          </View>

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons
                name="sparkles-outline"
                size={24}
                color="#FF3D71"
              />
            </View>

            <Text style={styles.eyebrow}>
              YOUR LIFESTYLE
            </Text>

            <Text
              style={[
                styles.title,
                isTablet && styles.titleTablet,
              ]}
            >
              Your{' '}
              <Text style={styles.pink}>
                lifestyle.
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              A few lifestyle details help us show you
              people who are more compatible with you.
            </Text>
          </View>

          {/* SECTION */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Smoking
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Tell us what best describes you.
                </Text>
              </View>

              {canContinue && (
                <View style={styles.completedBadge}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#FF3D71"
                  />

                  <Text style={styles.completedText}>
                    Selected
                  </Text>
                </View>
              )}
            </View>

            {/* OPTIONS */}

            <View style={styles.options}>
              {choices.map((item) => {
                const selected = smoking === item.value;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setSmoking(item.value)}
                    style={[
                      styles.option,
                      selected && styles.optionSelected,
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={19}
                          color={
                            selected
                              ? '#FF3D71'
                              : '#71717A'
                          }
                        />
                      </View>

                      <View>
                        <Text
                          style={[
                            styles.optionText,
                            selected &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>

                        {selected && (
                          <Text style={styles.optionSelectedHint}>
                            Your preference
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                      ]}
                    >
                      {selected && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* INFO */}

          <View style={styles.info}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#FF3D71"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Your privacy matters
              </Text>

              <Text style={styles.infoText}>
                You control what appears on your
                profile. You can update these details
                later.
              </Text>
            </View>
          </View>

          {/* CONTINUE */}

          <Pressable
            style={[
              styles.button,
              !canContinue && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
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

          {/* TRUST */}

          <View style={styles.trust}>
            <Ionicons
              name="lock-closed-outline"
              size={15}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 35,
  },

  content: {
    width: '100%',
    alignSelf: 'center',
  },

  contentTablet: {
    maxWidth: 700,
  },

  /* BACK */

  back: {
    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#FFE6ED',

    shadowColor: '#18181B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  /* PROGRESS */

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

  /* HEADER */

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

  titleTablet: {
    fontSize: 44,
    lineHeight: 50,
  },

  pink: {
    color: '#FF3D71',
  },

  subtitle: {
    color: '#71717A',

    fontSize: 15,
    lineHeight: 23,

    marginTop: 14,

    maxWidth: 560,
  },

  /* SECTION */

  section: {
    marginTop: 36,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 14,
  },

  sectionTitle: {
    color: '#18181B',

    fontSize: 17,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#A1A1AA',

    fontSize: 12,

    marginTop: 4,
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    backgroundColor: '#FFE6ED',

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 15,
  },

  completedText: {
    color: '#FF3D71',

    fontSize: 10,
    fontWeight: '800',
  },

  /* OPTIONS */

  options: {
    gap: 10,
  },

  option: {
    minHeight: 64,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#E4E4E7',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionSelected: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,
  },

  optionIcon: {
    width: 40,
    height: 40,

    borderRadius: 14,

    backgroundColor: '#F7F7F8',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  optionIconSelected: {
    backgroundColor: '#FFE6ED',
  },

  optionText: {
    color: '#71717A',

    fontSize: 14,
    fontWeight: '800',
  },

  optionTextSelected: {
    color: '#FF3D71',
  },

  optionSelectedHint: {
    color: '#A1A1AA',

    fontSize: 10,

    marginTop: 3,
  },

  /* RADIO */

  radio: {
    width: 23,
    height: 23,

    borderRadius: 12,

    borderWidth: 1.5,
    borderColor: '#D4D4D8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelected: {
    borderColor: '#FF3D71',
  },

  radioDot: {
    width: 11,
    height: 11,

    borderRadius: 6,

    backgroundColor: '#FF3D71',
  },

  /* INFO */

  info: {
    marginTop: 22,

    borderRadius: 18,

    backgroundColor: '#FFF6F8',

    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 40,
    height: 40,

    borderRadius: 14,

    backgroundColor: '#FFE6ED',

    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    color: '#18181B',

    fontSize: 13,
    fontWeight: '900',
  },

  infoText: {
    color: '#71717A',

    fontSize: 12,
    lineHeight: 18,

    marginTop: 3,
  },

  /* BUTTON */

  button: {
    height: 60,

    borderRadius: 30,

    backgroundColor: '#FF3D71',

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    gap: 10,

    marginTop: 28,

    shadowColor: '#FF3D71',
    shadowOpacity: 0.20,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  buttonDisabled: {
    backgroundColor: '#E4E4E7',
    shadowOpacity: 0,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 16,
    fontWeight: '800',
  },

  /* TRUST */

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

    textAlign: 'center',
  },
});