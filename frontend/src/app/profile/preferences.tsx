import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../../../config/api';

const genderOptions = [
  {
    value: 'female',
    label: 'Women',
    icon: 'woman-outline',
  },
  {
    value: 'male',
    label: 'Men',
    icon: 'man-outline',
  },
  {
    value: 'everyone',
    label: 'Everyone',
    icon: 'people-outline',
  },
];

const ageOptions = [
  '18–24',
  '24–32',
  '32–40',
  '40+',
];

const goalOptions = [
  {
    value: 'relationship',
    label: 'A relationship',
    icon: 'heart-outline',
  },
  {
    value: 'marriage',
    label: 'Marriage',
    icon: 'heart-circle-outline',
  },
  {
    value: 'dating',
    label: 'Dating',
    icon: 'cafe-outline',
  },
  {
    value: 'friendship',
    label: 'Friendship',
    icon: 'people-outline',
  },
];

const distanceOptions = [
  '5 km',
  '25 km',
  '50 km',
  '100 km',
];

export default function PreferencesScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [gender, setGender] = useState('female');
  const [goal, setGoal] = useState('relationship');
  const [age, setAge] = useState('24–32');
  const [distance, setDistance] = useState('25 km');

  const canContinue =
    gender !== '' &&
    goal !== '' &&
    age !== '' &&
    distance !== '';

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }

    try {
      // ---------------------------------------
      // GET DYNAMIC USER ID
      // ---------------------------------------

      const userId =
        await AsyncStorage.getItem('user_id');

      console.log('Preferences user_id:', userId);

      if (!userId) {
        Alert.alert(
          'Error',
          'User information not found. Please login again.'
        );
        return;
      }

      // ---------------------------------------
      // CONVERT AGE RANGE
      // ---------------------------------------

      let minAge = 18;
      let maxAge = 100;

      if (age === '18–24') {
        minAge = 18;
        maxAge = 24;
      } else if (age === '24–32') {
        minAge = 24;
        maxAge = 32;
      } else if (age === '32–40') {
        minAge = 32;
        maxAge = 40;
      } else if (age === '40+') {
        minAge = 40;
        maxAge = 100;
      }

      // ---------------------------------------
      // CONVERT DISTANCE
      // ---------------------------------------

      const maxDistanceKm =
        Number(distance.replace(' km', ''));

      // ---------------------------------------
      // PREPARE API DATA
      // ---------------------------------------

      const preferencesData = {
        user_id: Number(userId),

        preferred_gender: gender,

        min_age: minAge,

        max_age: maxAge,

        max_distance_km: maxDistanceKm,

        relationship_goal: goal,
      };

      console.log(
        'Preferences API data:',
        preferencesData
      );

      // ---------------------------------------
      // API CALL
      // ---------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/profile/preferences`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(
            preferencesData
          ),
        }
      );

      // ---------------------------------------
      // RESPONSE
      // ---------------------------------------

      const data =
        await response.json();

      console.log(
        'Preferences API status:',
        response.status
      );

      console.log(
        'Preferences API response:',
        data
      );

      // ---------------------------------------
      // ERROR
      // ---------------------------------------

      if (
        !response.ok ||
        data.success !== true
      ) {
        Alert.alert(
          'Error',
          data?.message ||
            data?.error ||
            'Failed to save preferences'
        );

        return;
      }

      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      console.log(
        'Preferences saved successfully'
      );

      console.log(
        'Inserted preference ID:',
        data?.data?.id
      );

      // ---------------------------------------
      // OPEN PREVIEW PAGE
      // WITH DYNAMIC USER ID
      // ---------------------------------------

      console.log(
        'Opening profile preview...',
        userId
      );

      router.push({
        pathname: '/profile/preview',
        params: {
          user_id: userId,
        },
      });

    } catch (error) {

      console.error(
        'Save preferences error:',
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

          {/* PROGRESS - STEP 8 OF 8 */}

          <View style={styles.progress}>
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
          </View>

          {/* STEP */}

          <View style={styles.stepRow}>
            <Text style={styles.stepText}>
            </Text>

            <View style={styles.completedBadge}>
              <Ionicons
                name="checkmark"
                size={13}
                color="#FF3D71"
              />

              <Text style={styles.completedText}>
                Almost there
              </Text>
            </View>
          </View>

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons
                name="options-outline"
                size={25}
                color="#FF3D71"
              />
            </View>

            <Text style={styles.eyebrow}>
              YOUR PREFERENCES
            </Text>

            <Text
              style={[
                styles.title,
                isTablet && styles.titleTablet,
              ]}
            >
              Who are you{' '}
              <Text style={styles.pink}>
                looking for?
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Tell us what kind of connection you're
              hoping to find. We'll use this to help
              personalize your matches.
            </Text>
          </View>

          {/* INTERESTED IN */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.smallIcon}>
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color="#FF3D71"
                  />
                </View>

                <View style={styles.sectionTitleContent}>
                  <Text style={styles.sectionTitle}>
                    Interested in
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Who would you like to meet?
                  </Text>
                </View>
              </View>

              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>
                  1 selected
                </Text>
              </View>
            </View>

            <View style={styles.optionList}>
              {genderOptions.map((item) => {
                const selected =
                  gender === item.value;

                return (
                  <SelectButton
                    key={item.value}
                    label={item.label}
                    icon={item.icon}
                    selected={selected}
                    onPress={() =>
                      setGender(item.value)
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* AGE RANGE */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.smallIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#FF3D71"
                  />
                </View>

                <View style={styles.sectionTitleContent}>
                  <Text style={styles.sectionTitle}>
                    Age range
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Choose your preferred age range.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.chipRow}>
              {ageOptions.map((item) => {
                const selected = age === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setAge(item)}
                    style={[
                      styles.chip,
                      selected &&
                        styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#FF3D71"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* LOOKING FOR */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.smallIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={18}
                    color="#FF3D71"
                  />
                </View>

                <View style={styles.sectionTitleContent}>
                  <Text style={styles.sectionTitle}>
                    Looking for
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    What kind of connection do you want?
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.optionList}>
              {goalOptions.map((item) => {
                const selected =
                  goal === item.value;

                return (
                  <SelectButton
                    key={item.value}
                    label={item.label}
                    icon={item.icon}
                    selected={selected}
                    onPress={() =>
                      setGoal(item.value)
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* MAXIMUM DISTANCE */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.smallIcon}>
                  <Ionicons
                    name="navigate-outline"
                    size={18}
                    color="#FF3D71"
                  />
                </View>

                <View style={styles.sectionTitleContent}>
                  <Text style={styles.sectionTitle}>
                    Maximum distance
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    How far are you willing to connect?
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.chipRow}>
              {distanceOptions.map((item) => {
                const selected =
                  distance === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setDistance(item)
                    }
                    style={[
                      styles.chip,
                      selected &&
                        styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#FF3D71"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* MATCH INFO */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="sparkles-outline"
                size={21}
                color="#FF3D71"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Better matches start here
              </Text>

              <Text style={styles.infoText}>
                Your preferences help LUMORA show
                you people who are more likely to
                match your interests.
              </Text>
            </View>
          </View>

          {/* CONTINUE */}

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
              You can change these preferences anytime
            </Text>
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

/* ------------------------------------------------ */
/* SELECT BUTTON */
/* ------------------------------------------------ */

function SelectButton({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.selectButton,
        selected &&
          styles.selectButtonSelected,
      ]}
    >
      <View style={styles.selectLeft}>
        <View
          style={[
            styles.selectIcon,
            selected &&
              styles.selectIconSelected,
          ]}
        >
          <Ionicons
            name={icon as any}
            size={19}
            color={
              selected
                ? '#FF3D71'
                : '#71717A'
            }
          />
        </View>

        <Text
          style={[
            styles.selectText,
            selected &&
              styles.selectTextSelected,
          ]}
        >
          {label}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          selected &&
            styles.radioSelected,
        ]}
      >
        {selected && (
          <View style={styles.radioDot} />
        )}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------ */

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

  /* STEP */

  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  stepText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '700',
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE6ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  completedText: {
    color: '#FF3D71',
    fontSize: 10,
    fontWeight: '800',
  },

  /* HEADER */

  header: {
    marginTop: 30,
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
    fontSize: 36,
    lineHeight: 43,
    fontWeight: '900',
    letterSpacing: -1,
  },

  titleTablet: {
    fontSize: 43,
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
    marginTop: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  smallIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFE6ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  sectionTitleContent: {
    flex: 1,
  },

  sectionTitle: {
    color: '#18181B',
    fontSize: 15,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 3,
  },

  selectedCount: {
    backgroundColor: '#FFF6F8',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  selectedCountText: {
    color: '#FF3D71',
    fontSize: 9,
    fontWeight: '800',
  },

  /* OPTIONS */

  optionList: {
    gap: 10,
  },

  selectButton: {
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectButtonSelected: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
  },

  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  selectIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F7F7F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  selectIconSelected: {
    backgroundColor: '#FFE6ED',
  },

  selectText: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '800',
  },

  selectTextSelected: {
    color: '#FF3D71',
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

  /* CHIPS */

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  chip: {
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  chipSelected: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
  },

  chipText: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '700',
  },

  chipTextSelected: {
    color: '#FF3D71',
  },

  /* INFO */

  infoCard: {
    marginTop: 28,
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