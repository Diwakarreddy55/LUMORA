import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LocationScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const canContinue =
    city.trim().length > 0 &&
    country.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;

    router.push('/profile/preferences');
  };

  return (
    <LinearGradient
      colors={['#FFF6F8', '#FFFFFF']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
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

          {/* PROGRESS - STEP 7 */}

          <View style={styles.progress}>
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />
            <View style={styles.activeProgress} />

            <View style={styles.progressLine} />
          </View>

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons
                name="location-outline"
                size={25}
                color="#FF3D71"
              />
            </View>

            <Text style={styles.eyebrow}>
              YOUR LOCATION
            </Text>

            <Text
              style={[
                styles.title,
                isTablet && styles.titleTablet,
              ]}
            >
              Where are{' '}
              <Text style={styles.pink}>
                you?
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Your location helps us discover compatible
              people who are nearby.
            </Text>
          </View>

          {/* LOCATION CARD */}

          <View style={styles.locationCard}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={20}
                  color="#FF3D71"
                />
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>
                  Your location
                </Text>

                <Text style={styles.cardSubtitle}>
                  Add your current city and country.
                </Text>
              </View>
            </View>

            {/* CITY */}

            <View style={styles.field}>
              <Text style={styles.label}>
                CITY
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#71717A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your city"
                  placeholderTextColor="#A1A1AA"
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* COUNTRY */}

            <View style={styles.field}>
              <Text style={styles.label}>
                COUNTRY
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color="#71717A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your country"
                  placeholderTextColor="#A1A1AA"
                  value={country}
                  onChangeText={setCountry}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* LOCATION PRIVACY */}

          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#FF3D71"
              />
            </View>

            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>
                Location stays private
              </Text>

              <Text style={styles.privacyText}>
                We use your location to improve matching.
                Your exact address is never displayed.
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

  /* LOCATION CARD */

  locationCard: {
    marginTop: 35,

    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    borderWidth: 1,
    borderColor: '#E4E4E7',

    padding: 18,

    shadowColor: '#18181B',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 24,
  },

  cardIcon: {
    width: 44,
    height: 44,

    borderRadius: 15,

    backgroundColor: '#FFE6ED',

    justifyContent: 'center',
    alignItems: 'center',
  },

  cardText: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    color: '#18181B',

    fontSize: 16,
    fontWeight: '900',
  },

  cardSubtitle: {
    color: '#A1A1AA',

    fontSize: 12,

    marginTop: 4,
  },

  /* FIELDS */

  field: {
    marginBottom: 18,
  },

  label: {
    color: '#71717A',

    fontSize: 10,
    fontWeight: '900',

    letterSpacing: 1.2,

    marginBottom: 10,
  },

  inputBox: {
    height: 62,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#E4E4E7',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,
  },

  input: {
    flex: 1,

    height: 60,

    marginLeft: 12,

    color: '#18181B',

    fontSize: 16,
  },

  /* PRIVACY */

  privacyCard: {
    marginTop: 20,

    backgroundColor: '#FFF6F8',

    borderRadius: 18,

    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',
  },

  privacyIcon: {
    width: 40,
    height: 40,

    borderRadius: 14,

    backgroundColor: '#FFE6ED',

    justifyContent: 'center',
    alignItems: 'center',
  },

  privacyContent: {
    flex: 1,
    marginLeft: 11,
  },

  privacyTitle: {
    color: '#18181B',

    fontSize: 13,
    fontWeight: '900',
  },

  privacyText: {
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