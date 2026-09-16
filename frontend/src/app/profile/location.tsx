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
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../../../config/api';

export default function LocationScreen() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  // -----------------------------------------
  // STATE
  // -----------------------------------------

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const hasLocation =
    city.trim().length > 0 &&
    country.trim().length > 0 &&
    latitude !== null &&
    longitude !== null;

  // -----------------------------------------
  // DETECT LOCATION
  // -----------------------------------------

  const detectLocation = async () => {
    try {
      setLoadingLocation(true);

      // ---------------------------------------
      // 1. REQUEST LOCATION PERMISSION
      // ---------------------------------------

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please allow location permission to continue.'
        );

        setLoadingLocation(false);
        return;
      }

      // ---------------------------------------
      // 2. GET CURRENT GPS LOCATION
      // ---------------------------------------

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const currentLatitude =
        location.coords.latitude;

      const currentLongitude =
        location.coords.longitude;

      console.log('GPS latitude:', currentLatitude);
      console.log('GPS longitude:', currentLongitude);

      // ---------------------------------------
      // 3. REVERSE GEOCODE
      // ---------------------------------------

      const address =
        await Location.reverseGeocodeAsync({
          latitude: currentLatitude,
          longitude: currentLongitude,
        });

      if (!address || address.length === 0) {
        Alert.alert(
          'Location Error',
          'Unable to detect your address.'
        );

        setLoadingLocation(false);
        return;
      }

      const place = address[0];

      // ---------------------------------------
      // 4. GET CITY
      // ---------------------------------------

      const currentCity =
        place.city ||
        place.subregion ||
        place.region ||
        '';

      // ---------------------------------------
      // 5. GET STATE
      // ---------------------------------------

      const currentState =
        place.region ||
        place.subregion ||
        '';

      // ---------------------------------------
      // 6. GET COUNTRY
      // ---------------------------------------

      const currentCountry =
        place.country ||
        '';

      // ---------------------------------------
      // 7. GET COUNTRY CODE
      // ---------------------------------------

      const currentCountryCode =
        place.isoCountryCode ||
        '';

      // ---------------------------------------
      // 8. VALIDATE
      // ---------------------------------------

      if (
        !currentCity ||
        !currentCountry
      ) {
        Alert.alert(
          'Location Error',
          'Unable to detect your city and country.'
        );

        setLoadingLocation(false);
        return;
      }

      // ---------------------------------------
      // 9. UPDATE UI
      // ---------------------------------------

      setLatitude(currentLatitude);
      setLongitude(currentLongitude);

      setCity(currentCity);
      setState(currentState);
      setCountry(currentCountry);
      setCountryCode(currentCountryCode);

      console.log(
        'Detected location:',
        {
          city: currentCity,
          state: currentState,
          country: currentCountry,
          countryCode: currentCountryCode,
          latitude: currentLatitude,
          longitude: currentLongitude,
        }
      );

      setLoadingLocation(false);

    } catch (error) {
      console.error(
        'Location detection error:',
        error
      );

      setLoadingLocation(false);

      Alert.alert(
        'Location Error',
        'Unable to detect your current location.'
      );
    }
  };

  // -----------------------------------------
  // SAVE LOCATION
  // -----------------------------------------

  const handleContinue = async () => {
    console.log('=================================');
    console.log('CONTINUE BUTTON CLICKED');
    console.log('=================================');

    // ---------------------------------------
    // CHECK LOCATION
    // ---------------------------------------

    if (!hasLocation) {
      Alert.alert(
        'Location Required',
        'Please detect your current location first.'
      );

      return;
    }

    try {
      setLoadingLocation(true);

      // ---------------------------------------
      // GET DYNAMIC USER ID
      // ---------------------------------------

      const userId =
        await AsyncStorage.getItem('user_id');

      console.log(
        'Location user_id:',
        userId
      );

      if (!userId) {
        Alert.alert(
          'Error',
          'User information not found. Please login again.'
        );

        setLoadingLocation(false);
        return;
      }

      // ---------------------------------------
      // PREPARE DATA
      // ---------------------------------------

      const locationData = {
        user_id: Number(userId),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        country_code:
          countryCode.trim().toUpperCase(),
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      console.log(
        'Sending location data:',
        locationData
      );

      // ---------------------------------------
      // API CALL
      // ---------------------------------------

      const apiUrl =
        `${API_BASE_URL}/api/profile/location`;

      console.log(
        'Location API URL:',
        apiUrl
      );

      const response = await fetch(
        apiUrl,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            locationData
          ),
        }
      );

      // ---------------------------------------
      // READ RESPONSE
      // ---------------------------------------

      const data =
        await response.json();

      console.log(
        'Location API status:',
        response.status
      );

      console.log(
        'Location API response:',
        data
      );

      // ---------------------------------------
      // API ERROR
      // ---------------------------------------

      if (
        !response.ok ||
        data.success !== true
      ) {
        Alert.alert(
          'Error',
          data?.message ||
            'Failed to save location'
        );

        setLoadingLocation(false);
        return;
      }

      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      console.log(
        '================================='
      );

      console.log(
        'LOCATION SAVED SUCCESSFULLY'
      );

      console.log(
        'USER ID:',
        userId
      );

      console.log(
        'CITY:',
        city
      );

      console.log(
        'STATE:',
        state
      );

      console.log(
        'COUNTRY:',
        country
      );

      console.log(
        '================================='
      );

      setLoadingLocation(false);

      // ---------------------------------------
      // GO TO PREFERENCES
      // ---------------------------------------

      console.log(
        '➡️ Navigating to /profile/preferences'
      );

      router.push('/profile/preferences');

    } catch (error) {
      console.error(
        'Location save error:',
        error
      );

      setLoadingLocation(false);

      Alert.alert(
        'Error',
        'Unable to save your location. Please try again.'
      );
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

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

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isTablet &&
            styles.scrollTablet,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.content,
            isTablet &&
              styles.contentTablet,
          ]}
        >

          {/* ================================= */}
          {/* TOP BAR */}
          {/* ================================= */}

          <View style={styles.topBar}>

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color="#18181B"
              />
            </Pressable>

            <View style={styles.stepBadge}>
              <Text
                style={styles.stepBadgeText}
              >
                7 OF 8
              </Text>
            </View>

          </View>

          {/* ================================= */}
          {/* PROGRESS */}
          {/* ================================= */}

          <View
            style={styles.progressContainer}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <View
                  key={item}
                  style={[
                    styles.progressBar,
                    item <= 7
                      ? styles.progressActive
                      : styles.progressInactive,
                  ]}
                />
              )
            )}
          </View>

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <View style={styles.header}>

            <View style={styles.iconWrapper}>

              <Ionicons
                name="location"
                size={25}
                color="#FF3D71"
              />

              <View
                style={styles.iconDot}
              />

            </View>

            <Text style={styles.eyebrow}>
              YOUR LOCATION
            </Text>

            <Text
              style={[
                styles.title,
                isTablet &&
                  styles.titleTablet,
              ]}
            >
              Where are{' '}
              <Text style={styles.pink}>
                you?
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Let LUMORA know where you are
              so we can show you meaningful
              connections nearby.
            </Text>

          </View>

          {/* ================================= */}
          {/* LOCATION CARD */}
          {/* ================================= */}

          <View style={styles.locationCard}>

            {/* CARD HEADER */}

            <View style={styles.cardHeader}>

              <View style={styles.cardIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={21}
                  color="#FF3D71"
                />
              </View>

              <View
                style={styles.cardHeaderText}
              >

                <Text
                  style={styles.cardTitle}
                >
                  Current location
                </Text>

                <Text
                  style={styles.cardSubtitle}
                >
                  Use GPS to automatically
                  detect your location.
                </Text>

              </View>

            </View>

            {/* ================================= */}
            {/* DETECT BUTTON */}
            {/* ================================= */}

            <Pressable
              style={[
                styles.detectButton,
                hasLocation &&
                  styles.detectButtonSuccess,
              ]}
              onPress={detectLocation}
              disabled={loadingLocation}
            >

              <View
                style={styles.detectButtonIcon}
              >

                {loadingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color="#FF3D71"
                  />
                ) : (
                  <Ionicons
                    name={
                      hasLocation
                        ? 'checkmark'
                        : 'locate-outline'
                    }
                    size={22}
                    color="#FF3D71"
                  />
                )}

              </View>

              <View
                style={
                  styles.detectButtonContent
                }
              >

                <Text
                  style={
                    styles.detectButtonTitle
                  }
                >
                  {loadingLocation
                    ? 'Detecting location...'
                    : hasLocation
                    ? 'Location detected'
                    : 'Use my current location'}
                </Text>

                <Text
                  style={
                    styles.detectButtonSubtitle
                  }
                >
                  {hasLocation
                    ? 'Tap to refresh your location'
                    : 'GPS will find your city automatically'}
                </Text>

              </View>

              {!loadingLocation && (
                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#A1A1AA"
                />
              )}

            </Pressable>

            {/* ================================= */}
            {/* RESULT */}
            {/* ================================= */}

            {hasLocation && (
              <View style={styles.resultArea}>

                <View
                  style={styles.divider}
                />

                <Text
                  style={styles.resultLabel}
                >
                  YOUR LOCATION
                </Text>

                <View
                  style={styles.locationResult}
                >

                  <View
                    style={styles.resultIcon}
                  >
                    <Ionicons
                      name="location"
                      size={22}
                      color="#FF3D71"
                    />
                  </View>

                  <View
                    style={styles.resultInfo}
                  >

                    <Text
                      style={styles.cityText}
                    >
                      {city}
                    </Text>

                    <Text
                      style={
                        styles.stateCountryText
                      }
                    >
                      {state
                        ? `${state}, ${country}`
                        : country}
                    </Text>

                  </View>

                  <View
                    style={styles.verified}
                  >

                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#FF3D71"
                    />

                    <Text
                      style={styles.verifiedText}
                    >
                      VERIFIED
                    </Text>

                  </View>

                </View>

                {/* ================================= */}
                {/* COORDINATES */}
                {/* ================================= */}

                {latitude !== null &&
                  longitude !== null && (
                    <View
                      style={
                        styles.coordinates
                      }
                    >

                      <View
                        style={
                          styles.coordinateBox
                        }
                      >

                        <Text
                          style={
                            styles.coordinateLabel
                          }
                        >
                          LATITUDE
                        </Text>

                        <Text
                          style={
                            styles.coordinateValue
                          }
                        >
                          {latitude.toFixed(5)}
                        </Text>

                      </View>

                      <View
                        style={
                          styles.coordinateDivider
                        }
                      />

                      <View
                        style={
                          styles.coordinateBox
                        }
                      >

                        <Text
                          style={
                            styles.coordinateLabel
                          }
                        >
                          LONGITUDE
                        </Text>

                        <Text
                          style={
                            styles.coordinateValue
                          }
                        >
                          {longitude.toFixed(5)}
                        </Text>

                      </View>

                    </View>
                  )}

              </View>
            )}

          </View>

          {/* ================================= */}
          {/* PRIVACY */}
          {/* ================================= */}

          <View
            style={styles.privacyCard}
          >

            <View
              style={styles.privacyIcon}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#FF3D71"
              />
            </View>

            <View
              style={styles.privacyContent}
            >

              <Text
                style={styles.privacyTitle}
              >
                Your location stays private
              </Text>

              <Text
                style={styles.privacyText}
              >
                LUMORA uses your location to
                improve nearby matching.
                Your exact coordinates are never
                shown to other users.
              </Text>

            </View>

          </View>

          {/* ================================= */}
          {/* CONTINUE */}
          {/* ================================= */}

          <Pressable
            style={[
              styles.continueButton,
              !hasLocation &&
                styles.continueDisabled,
            ]}
            onPress={handleContinue}
            disabled={
              loadingLocation ||
              !hasLocation
            }
          >

            {loadingLocation ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text
                  style={[
                    styles.continueText,
                    !hasLocation &&
                      styles.continueTextDisabled,
                  ]}
                >
                  Continue
                </Text>

                <View
                  style={[
                    styles.arrowCircle,
                    !hasLocation &&
                      styles.arrowCircleDisabled,
                  ]}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color={
                      hasLocation
                        ? '#FFFFFF'
                        : '#A1A1AA'
                    }
                  />
                </View>
              </>
            )}

          </Pressable>

          {/* ================================= */}
          {/* TRUST */}
          {/* ================================= */}

          <View style={styles.trust}>

            <Ionicons
              name="lock-closed-outline"
              size={14}
              color="#71717A"
            />

            <Text
              style={styles.trustText}
            >
              Private and secure
            </Text>

            <View
              style={styles.trustDot}
            />

            <Text
              style={styles.trustText}
            >
              Step 7 of 8
            </Text>

          </View>

          {/* ================================= */}
          {/* BRAND */}
          {/* ================================= */}

          <View
            style={styles.brandFooter}
          >

            <View
              style={styles.brandLine}
            />

            <Text style={styles.brand}>
              LUMORA
            </Text>

            <View
              style={styles.brandLine}
            />

          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 30,
  },

  scrollTablet: {
    paddingHorizontal: 30,
  },

  content: {
    width: '100%',
    alignSelf: 'center',
  },

  contentTablet: {
    maxWidth: 680,
  },

  // =========================================
  // TOP
  // =========================================

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18181B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  stepBadge: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#FFE6ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepBadgeText: {
    color: '#FF3D71',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // =========================================
  // PROGRESS
  // =========================================

  progressContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 18,
  },

  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },

  progressActive: {
    backgroundColor: '#FF3D71',
  },

  progressInactive: {
    backgroundColor: '#E4E4E7',
  },

  // =========================================
  // HEADER
  // =========================================

  header: {
    marginTop: 29,
  },

  iconWrapper: {
    width: 51,
    height: 51,
    borderRadius: 17,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 17,
  },

  iconDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3D71',
    top: 3,
    right: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FF3D71',
    marginBottom: 8,
  },

  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.1,
    color: '#18181B',
  },

  titleTablet: {
    fontSize: 42,
    lineHeight: 48,
  },

  pink: {
    color: '#FF3D71',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#71717A',
    maxWidth: 570,
  },

  // =========================================
  // LOCATION CARD
  // =========================================

  locationCard: {
    marginTop: 25,
    padding: 17,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#18181B',
    shadowOpacity: 0.055,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#18181B',
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#A1A1AA',
  },

  // =========================================
  // DETECT
  // =========================================

  detectButton: {
    minHeight: 69,
    borderRadius: 18,
    backgroundColor: '#FFF6F8',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  detectButtonSuccess: {
    backgroundColor: '#FFF6F8',
    borderColor: '#FFE6ED',
  },

  detectButtonIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detectButtonContent: {
    flex: 1,
    marginLeft: 11,
  },

  detectButtonTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18181B',
  },

  detectButtonSubtitle: {
    marginTop: 3,
    fontSize: 10.5,
    color: '#71717A',
  },

  // =========================================
  // RESULT
  // =========================================

  resultArea: {
    marginTop: 15,
  },

  divider: {
    height: 1,
    backgroundColor: '#F4F4F5',
    marginBottom: 14,
  },

  resultLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#A1A1AA',
    marginBottom: 9,
  },

  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
  },

  resultIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultInfo: {
    flex: 1,
    marginLeft: 11,
  },

  cityText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#18181B',
  },

  stateCountryText: {
    marginTop: 2,
    fontSize: 11,
    color: '#71717A',
  },

  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: '#FFF6F8',
  },

  verifiedText: {
    marginLeft: 3,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#FF3D71',
  },

  // =========================================
  // COORDINATES
  // =========================================

  coordinates: {
    flexDirection: 'row',
    marginTop: 11,
    paddingHorizontal: 3,
  },

  coordinateBox: {
    flex: 1,
  },

  coordinateDivider: {
    width: 1,
    backgroundColor: '#E4E4E7',
    marginHorizontal: 15,
  },

  coordinateLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#A1A1AA',
  },

  coordinateValue: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
  },

  // =========================================
  // PRIVACY
  // =========================================

  privacyCard: {
    marginTop: 15,
    padding: 14,
    borderRadius: 19,
    backgroundColor: '#FFF6F8',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    flexDirection: 'row',
  },

  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  privacyContent: {
    flex: 1,
    marginLeft: 11,
  },

  privacyTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#18181B',
  },

  privacyText: {
    marginTop: 4,
    fontSize: 10.8,
    lineHeight: 17,
    color: '#71717A',
  },

  // =========================================
  // CONTINUE
  // =========================================

  continueButton: {
    height: 57,
    marginTop: 19,
    borderRadius: 29,
    backgroundColor: '#FF3D71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3D71',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  continueDisabled: {
    backgroundColor: '#E4E4E7',
    shadowOpacity: 0,
  },

  continueText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  continueTextDisabled: {
    color: '#71717A',
  },

  arrowCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor:
      'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  arrowCircleDisabled: {
    backgroundColor: '#FFFFFF',
  },

  // =========================================
  // TRUST
  // =========================================

  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  trustText: {
    fontSize: 10,
    color: '#71717A',
    marginLeft: 5,
  },

  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#A1A1AA',
    marginHorizontal: 8,
  },

  // =========================================
  // BRAND
  // =========================================

  brandFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 21,
  },

  brandLine: {
    width: 34,
    height: 1,
    backgroundColor: '#E4E4E7',
  },

  brand: {
    marginHorizontal: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#A1A1AA',
  },

});