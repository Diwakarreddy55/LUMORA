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
  Image,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
export default function AboutScreen() {

  /* =====================================================
    BASIC INFORMATION
  ===================================================== */

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  /* =====================================================
    ABOUT INFORMATION
  ===================================================== */

  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [height, setHeight] = useState('');
  const [relationship, setRelationship] = useState('');
  const [bio, setBio] = useState('');

  /* =====================================================
    DATE PICKER
  ===================================================== */

  const [showDatePicker, setShowDatePicker] = useState(false);

  /* =====================================================
    PHOTOS
  ===================================================== */

  const [photos, setPhotos] = useState<string[]>([]);

  /* =====================================================
    DATE FORMAT
  ===================================================== */

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  /* =====================================================
    DATE PICKER CHANGE
  ===================================================== */

  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {

    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDateOfBirth(formatDate(selectedDate));
    }
  };

  /* =====================================================
    SAVE ABOUT DATA
  ===================================================== */

  const saveAboutData = async () => {

    try {

      const userId =
        await AsyncStorage.getItem('user_id');

      console.log('===== SAVE ABOUT =====');

      console.log('User ID:', userId);

      console.log(
        'API URL:',
        `${API_BASE_URL}/api/profile/about`
      );

      console.log('About Data:', {

        user_id: Number(userId),

        first_name: firstName.trim(),

        last_name: lastName.trim(),

        date_of_birth: dateOfBirth || null,

        gender: gender || null,

        occupation: occupation.trim(),

        education: education.trim(),

        height_cm:
          height
            ? Number(height)
            : null,

        relationship_status:
          relationship || null,

        bio: bio.trim(),

      });

      /* =====================================================
        USER ID VALIDATION
      ===================================================== */

      if (!userId) {

        Alert.alert(
          'Error',
          'User information not found. Please login again.'
        );

        return false;
      }

      /* =====================================================
        API REQUEST
      ===================================================== */

      const response = await fetch(
        `${API_BASE_URL}/api/profile/about`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({

            user_id: Number(userId),

            first_name:
              firstName.trim(),

            last_name:
              lastName.trim(),

            date_of_birth:
              dateOfBirth || null,

            gender:
              gender || null,

            occupation:
              occupation.trim(),

            education:
              education.trim(),

            height_cm:
              height
                ? Number(height)
                : null,

            relationship_status:
              relationship || null,

            bio:
              bio.trim(),

          }),
        }
      );

      console.log(
        'HTTP Status:',
        response.status
      );

      console.log(
        'Response OK:',
        response.ok
      );

      const data =
        await response.json();

      console.log(
        'API Response:',
        data
      );

      /* =====================================================
        ERROR
      ===================================================== */

      if (!response.ok || !data.success) {

        Alert.alert(
          'Error',
          data.message ||
          'Failed to save information'
        );

        return false;
      }

      /* =====================================================
        SUCCESS
      ===================================================== */

      Alert.alert(
        'Profile Updated',
        'Your information has been saved successfully.'
      );

      return true;

    } catch (error) {

      console.error(
        'saveAboutData error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to connect to server'
      );

      return false;
    }
  };

  /* =====================================================
    ADD PHOTO
  ===================================================== */

  const addPhoto = async () => {

    if (photos.length >= 4) {

      Alert.alert(
        'Maximum photos',
        'You can add a maximum of 4 photos.'
      );

      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {

      Alert.alert(
        'Permission required',
        'Please allow photo library access to add your photos.'
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ['images'],

        allowsEditing: true,

        aspect: [1, 1],

        quality: 0.8,

      });

    if (
      !result.canceled &&
      result.assets?.[0]?.uri
    ) {

      const selectedUri =
        result.assets[0].uri;

      setPhotos((currentPhotos) => [
        ...currentPhotos,
        selectedUri,
      ]);
    }
  };

  /* =====================================================
    REMOVE PHOTO
  ===================================================== */

  const removePhoto = (index: number) => {

    setPhotos((currentPhotos) =>
      currentPhotos.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =====================================================
    CONTINUE
  ===================================================== */


  const continueAbout = async () => {
    try {
      // ==========================================
      // REQUIRED VALIDATION
      // ==========================================

      if (!firstName.trim()) {
        Alert.alert(
          'First name required',
          'Please enter your first name.'
        );
        return;
      }

      if (!lastName.trim()) {
        Alert.alert(
          'Last name required',
          'Please enter your last name.'
        );
        return;
      }

      if (!dateOfBirth) {
        Alert.alert(
          'Date of birth required',
          'Please select your date of birth.'
        );
        return;
      }

      if (!gender) {
        Alert.alert(
          'Gender required',
          'Please select your gender.'
        );
        return;
      }

      if (photos.length < 2) {
        Alert.alert(
          'Add more photos',
          'Please add at least 2 photos.'
        );
        return;
      }

      if (photos.length > 4) {
        Alert.alert(
          'Maximum photos',
          'You can upload maximum 4 photos.'
        );
        return;
      }

      // ==========================================
      // SAVE ABOUT INFORMATION
      // ==========================================

      const saved = await saveAboutData();

      if (!saved) {
        return;
      }

      // ==========================================
      // UPLOAD PROFILE PHOTOS
      // ==========================================

      const photosUploaded = await uploadProfilePhotos();

      if (!photosUploaded) {
        return;
      }

      // ==========================================
      // MOVE TO NEXT STEP
      // ==========================================

      router.push('/profile/interests');

    } catch (error) {
      console.error(
        'continueAbout error:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong. Please try again.'
      );
    }
  };




  const uploadProfilePhotos = async (): Promise<boolean> => {
    try {
      // ==========================================
      // GET DYNAMIC USER ID
      // ==========================================

      const userId = await AsyncStorage.getItem('user_id');

      console.log('👤 User ID:', userId);

      if (!userId) {
        Alert.alert(
          'Session expired',
          'User information was not found. Please login again.'
        );

        return false;
      }

      // ==========================================
      // PHOTO VALIDATION
      // ==========================================

      if (!photos || photos.length < 2) {
        Alert.alert(
          'Add more photos',
          'Please add at least 2 photos.'
        );

        return false;
      }

      if (photos.length > 4) {
        Alert.alert(
          'Maximum photos',
          'You can upload maximum 4 photos.'
        );

        return false;
      }

      console.log('📸 Photo count:', photos.length);

      // ==========================================
      // CREATE FORMDATA
      // ==========================================

      const formData = new FormData();

      // IMPORTANT:
      // user_id MUST be added BEFORE photos
      // because backend/Multer uses user_id
      // to determine the upload folder.

      formData.append(
        'user_id',
        String(userId)
      );

      console.log(
        '✅ user_id added:',
        String(userId)
      );

      // ==========================================
      // ADD PHOTOS
      // ==========================================

      for (let index = 0; index < photos.length; index++) {
        const uri = photos[index];

        console.log('---------------------------------');
        console.log(
          `📷 Processing photo ${index + 1}`
        );
        console.log('URI:', uri);

        if (!uri) {
          console.log(
            `❌ Photo ${index + 1} URI missing`
          );

          continue;
        }

        try {
          // ========================================
          // CREATE EXPO FILE
          // ========================================

          const file = new FileSystem.File(uri);

          console.log(
            `📁 Expo File created for photo ${index + 1}`
          );

          console.log(
            'File URI:',
            file.uri
          );

          console.log(
            'File name:',
            file.name
          );

          // ========================================
          // APPEND PHOTO ONLY ONCE
          // ========================================

          formData.append(
            'photos',
            file as any
          );

          console.log(
            `✅ Photo ${index + 1} added to FormData`
          );

        } catch (fileError) {

          console.error(
            `❌ Photo ${index + 1} error:`,
            fileError
          );

          Alert.alert(
            'Photo error',
            `Unable to prepare photo ${index + 1}.`
          );

          return false;
        }
      }

      // ==========================================
      // API URL
      // ==========================================

      const uploadUrl =
        `${API_BASE_URL}/api/profile/photos`;

      console.log('=================================');
      console.log('🚀 UPLOADING PHOTOS');
      console.log('=================================');

      console.log(
        '👤 User ID:',
        userId
      );

      console.log(
        '📸 Photos:',
        photos.length
      );

      console.log(
        '🌐 URL:',
        uploadUrl
      );

      // ==========================================
      // SEND REQUEST
      // ==========================================

      const response = await fetch(
        uploadUrl,
        {
          method: 'POST',

          headers: {
            Accept: 'application/json',
          },

          // IMPORTANT:
          // Do NOT manually set Content-Type.
          // React Native must create the multipart
          // boundary automatically.

          body: formData,
        }
      );

      // ==========================================
      // HTTP STATUS
      // ==========================================

      console.log(
        '📡 HTTP Status:',
        response.status
      );

      console.log(
        '📡 Response OK:',
        response.ok
      );

      // ==========================================
      // READ SERVER RESPONSE
      // ==========================================

      const responseText =
        await response.text();

      console.log(
        '📦 Server response:',
        responseText
      );

      // ==========================================
      // PARSE JSON
      // ==========================================

      let data: any;

      try {
        data = JSON.parse(responseText);

      } catch (parseError) {

        console.error(
          '❌ Invalid JSON response:',
          parseError
        );

        Alert.alert(
          'Upload failed',
          'Server returned an invalid response.'
        );

        return false;
      }

      // ==========================================
      // API ERROR
      // ==========================================

      if (!response.ok || data.code !== 0) {

        console.error(
          '❌ Photo upload failed:',
          data
        );

        Alert.alert(
          'Upload failed',
          data.message ||
          'Unable to upload photos.'
        );

        return false;
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      console.log('=================================');
      console.log('✅ PHOTO UPLOAD SUCCESS');
      console.log('=================================');

      console.log(
        '👤 User ID:',
        userId
      );

      console.log(
        '📸 Saved photos:',
        data.response?.photos
      );

      // ==========================================
      // RETURN SUCCESS
      // ==========================================

      return true;

    } catch (error) {

      console.error('=================================');
      console.error(
        '❌ PHOTO UPLOAD ERROR'
      );
      console.error('=================================');

      console.error(
        'Error:',
        error
      );

      Alert.alert(
        'Upload failed',
        error instanceof Error
          ? error.message
          : 'Unable to upload photos.'
      );

      return false;
    }
  };

  /* =====================================================
    RENDER
  ===================================================== */

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

        <ScrollView

          contentContainerStyle={
            styles.scroll
          }

          keyboardShouldPersistTaps="handled"

          showsVerticalScrollIndicator={
            false
          }
        >

          {/* =====================================================
                TOP BAR
            ===================================================== */}

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

            <View style={styles.stepContainer}>

              <Text style={styles.step}>
                3 OF 8
              </Text>

              <Text style={styles.stepCaption}>
                ABOUT YOU
              </Text>

            </View>

          </View>


          {/* =====================================================
                PROGRESS
            ===================================================== */}

          <View style={styles.progress}>

            <View
              style={styles.progressActive}
            />

            <View
              style={styles.progressActive}
            />

            <View
              style={styles.progressActive}
            />

            <View
              style={styles.progressInactive}
            />

          </View>


          {/* =====================================================
                HEADER
            ===================================================== */}

          <View style={styles.header}>

            <View style={styles.iconBox}>

              <Ionicons
                name="person-outline"
                size={23}
                color="#FF3D71"
              />

            </View>

            <Text style={styles.eyebrow}>
              ABOUT YOU
            </Text>

            <Text style={styles.title}>

              A little more{' '}

              <Text style={styles.pink}>
                about you.
              </Text>

            </Text>

            <Text style={styles.subtitle}>
              Tell us a little about yourself so
              we can create a profile that feels
              genuinely you.
            </Text>

          </View>


          {/* =====================================================
                BASIC INFORMATION
            ===================================================== */}

          <View style={styles.sectionBlock}>

            <View style={styles.sectionHeader}>

              <View style={styles.sectionHeaderLeft}>

                <Text style={styles.sectionEyebrow}>
                  BASIC INFORMATION
                </Text>

                <Text style={styles.sectionTitle}>
                  Let’s get to know you
                </Text>

                <Text style={styles.sectionDescription}>
                  Start with the basics of your profile.
                </Text>

              </View>

              <View style={styles.sectionNumber}>

                <Text style={styles.sectionNumberText}>
                  01
                </Text>

              </View>

            </View>


            {/* =====================================================
                  NAME CARD
              ===================================================== */}

            <View style={styles.nameCard}>

              <View style={styles.nameIcon}>

                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#FF3D71"
                />

              </View>

              <View style={styles.nameContent}>

                <Text style={styles.smallLabel}>
                  YOUR NAME
                </Text>

                <View style={styles.nameRow}>

                  <TextInput
                    style={styles.nameInput}
                    placeholder="First name"
                    placeholderTextColor="#A1A1AA"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />

                  <View
                    style={styles.nameDivider}
                  />

                  <TextInput
                    style={styles.nameInput}
                    placeholder="Last name"
                    placeholderTextColor="#A1A1AA"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />

                </View>

              </View>

            </View>


            {/* =====================================================
                  DOB
              ===================================================== */}

            <View style={styles.advancedField}>

              <Text style={styles.label}>
                DATE OF BIRTH
              </Text>

              <Pressable
                style={styles.dateInput}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >

                <View style={styles.inputIcon}>

                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color="#FF3D71"
                  />

                </View>

                <View
                  style={styles.dateTextContainer}
                >

                  <Text
                    style={[
                      styles.dateText,
                      !dateOfBirth &&
                      styles.placeholderText,
                    ]}
                  >
                    {dateOfBirth ||
                      'Select your date of birth'}
                  </Text>

                  <Text style={styles.inputHint}>
                    Your age will be calculated
                    automatically
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A1A1AA"
                />

              </Pressable>

              {showDatePicker && (

                <DateTimePicker
                  value={
                    dateOfBirth
                      ? new Date(
                        dateOfBirth
                          .split('/')
                          .reverse()
                          .join('-')
                      )
                      : new Date(
                        2000,
                        0,
                        1
                      )
                  }
                  mode="date"
                  display={
                    Platform.OS === 'ios'
                      ? 'spinner'
                      : 'default'
                  }
                  maximumDate={
                    new Date()
                  }
                  onChange={
                    handleDateChange
                  }
                />

              )}

            </View>


            {/* =====================================================
                  GENDER
              ===================================================== */}

            <View style={styles.advancedField}>

              <View style={styles.fieldHeaderRow}>

                <Text style={styles.label}>
                  GENDER
                </Text>

                <Text style={styles.optional}>
                  OPTIONAL
                </Text>

              </View>


              <View style={styles.genderGrid}>

                {[
                  {
                    value: 'male',
                    label: 'Man',
                    icon: 'male-outline',
                  },
                  {
                    value: 'female',
                    label: 'Woman',
                    icon: 'female-outline',
                  },
                  {
                    value: 'non_binary',
                    label: 'Non-binary',
                    icon: 'transgender-outline',
                  },
                  {
                    value: 'prefer_not',
                    label: 'Prefer not',
                    icon: 'ellipsis-horizontal-outline',
                  },
                ].map((item) => {

                  const selected =
                    gender === item.value;

                  return (

                    <Pressable

                      key={item.value}

                      onPress={() =>
                        setGender(
                          item.value
                        )
                      }

                      style={[
                        styles.genderCard,

                        selected &&
                        styles.genderCardSelected,
                      ]}
                    >

                      <View
                        style={[
                          styles.genderIcon,

                          selected &&
                          styles.genderIconSelected,
                        ]}
                      >

                        <Ionicons
                          name={
                            item.icon as any
                          }
                          size={20}
                          color={
                            selected
                              ? '#FF3D71'
                              : '#71717A'
                          }
                        />

                      </View>

                      <View
                        style={
                          styles.genderTextContainer
                        }
                      >

                        <Text
                          style={[
                            styles.genderTitle,

                            selected &&
                            styles.genderTitleSelected,
                          ]}
                        >
                          {item.label}
                        </Text>

                      </View>

                      <View
                        style={[
                          styles.genderRadio,

                          selected &&
                          styles.genderRadioSelected,
                        ]}
                      >

                        {selected && (

                          <View
                            style={
                              styles.genderRadioDot
                            }
                          />

                        )}

                      </View>

                    </Pressable>

                  );

                })}

              </View>

            </View>

          </View>


          {/* =====================================================
                YOUR STORY
            ===================================================== */}

          <View style={styles.sectionBlock}>

            <View style={styles.sectionHeader}>

              <View
                style={styles.sectionHeaderLeft}
              >

                <Text style={styles.sectionEyebrow}>
                  YOUR STORY
                </Text>

                <Text style={styles.sectionTitle}>
                  What makes you, you?
                </Text>

                <Text style={styles.sectionDescription}>
                  Give people a glimpse of your personality.
                </Text>

              </View>

              <View style={styles.sectionNumber}>

                <Text
                  style={styles.sectionNumberText}
                >
                  02
                </Text>

              </View>

            </View>


            {/* =====================================================
                  BIO
              ===================================================== */}

            <View style={styles.bioCard}>

              <View style={styles.bioTop}>

                <View style={styles.bioIcon}>

                  <Ionicons
                    name="create-outline"
                    size={20}
                    color="#FF3D71"
                  />

                </View>

                <View
                  style={styles.bioTitleContainer}
                >

                  <Text style={styles.bioTitle}>
                    ABOUT ME
                  </Text>

                  <Text style={styles.bioSubtitle}>
                    Tell us something interesting
                  </Text>

                </View>

                <View style={styles.bioSparkle}>

                  <Ionicons
                    name="sparkles-outline"
                    size={16}
                    color="#FF3D71"
                  />

                </View>

              </View>


              <TextInput

                style={styles.bioInput}

                placeholder="I’m someone who loves..."
                placeholderTextColor="#A1A1AA"

                value={bio}

                onChangeText={(text) => {

                  if (text.length <= 300) {
                    setBio(text);
                  }

                }}

                multiline

                maxLength={300}

                textAlignVertical="top"

              />


              <View style={styles.bioFooter}>

                <View style={styles.bioTip}>

                  <Ionicons
                    name="bulb-outline"
                    size={14}
                    color="#FF3D71"
                  />

                  <Text style={styles.bioTipText}>
                    Keep it authentic
                  </Text>

                </View>

                <Text style={styles.bioCounter}>
                  {bio.length}/300
                </Text>

              </View>

            </View>

          </View>


          {/* =====================================================
                LIFESTYLE
            ===================================================== */}

          <View style={styles.sectionBlock}>

            <View style={styles.sectionHeader}>

              <View
                style={styles.sectionHeaderLeft}
              >

                <Text style={styles.sectionEyebrow}>
                  LIFESTYLE
                </Text>

                <Text style={styles.sectionTitle}>
                  A little more about you
                </Text>

                <Text style={styles.sectionDescription}>
                  These details help make your profile complete.
                </Text>

              </View>

              <View style={styles.sectionNumber}>

                <Text
                  style={styles.sectionNumberText}
                >
                  03
                </Text>

              </View>

            </View>


            {/* OCCUPATION */}

            <Field
              label="OCCUPATION"
              icon="briefcase-outline"
              placeholder="What do you do?"
              value={occupation}
              onChangeText={setOccupation}
            />


            {/* EDUCATION */}

            <Field
              label="EDUCATION"
              icon="school-outline"
              placeholder="Where did you study?"
              value={education}
              onChangeText={setEducation}
            />


            {/* HEIGHT */}

            <Field
              label="HEIGHT"
              icon="resize-outline"
              placeholder="Height in cm"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />

          </View>


          {/* =====================================================
                RELATIONSHIP
            ===================================================== */}

          <View style={styles.sectionBlock}>

            <View style={styles.relationshipHeading}>

              <View>

                <Text style={styles.sectionEyebrow}>
                  RELATIONSHIP
                </Text>

                <Text style={styles.sectionTitle}>
                  Where are you right now?
                </Text>

              </View>

              <Text style={styles.optional}>
                OPTIONAL
              </Text>

            </View>


            <View
              style={styles.relationshipAdvanced}
            >

              {[
                [
                  'single',
                  'Single',
                  'heart-outline',
                ],
                [
                  'divorced',
                  'Divorced',
                  'heart-dislike-outline',
                ],
                [
                  'widowed',
                  'Widowed',
                  'flower-outline',
                ],
                [
                  'separated',
                  'Separated',
                  'git-branch-outline',
                ],
              ].map(
                ([value, label, icon]) => {

                  const selected =
                    relationship === value;

                  return (

                    <Pressable

                      key={value}

                      onPress={() =>
                        setRelationship(
                          value
                        )
                      }

                      style={[
                        styles.relationshipCard,

                        selected &&
                        styles.relationshipCardSelected,
                      ]}
                    >

                      <View
                        style={[
                          styles.relationshipIcon,

                          selected &&
                          styles.relationshipIconSelected,
                        ]}
                      >

                        <Ionicons
                          name={icon as any}
                          size={18}
                          color={
                            selected
                              ? '#FF3D71'
                              : '#71717A'
                          }
                        />

                      </View>

                      <Text
                        style={[
                          styles.relationshipText,

                          selected &&
                          styles.relationshipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>

                      {selected && (

                        <View
                          style={
                            styles.selectedCheck
                          }
                        >

                          <Ionicons
                            name="checkmark"
                            size={13}
                            color="#FFFFFF"
                          />

                        </View>

                      )}

                    </Pressable>

                  );

                }
              )}

            </View>

          </View>


          {/* =====================================================
                PHOTOS
            ===================================================== */}

          <View style={styles.photosSection}>

            <View style={styles.photosHeader}>

              <View
                style={styles.photosHeaderText}
              >

                <Text style={styles.label}>
                  YOUR PHOTOS
                </Text>

                <Text style={styles.photoHint}>
                  Add 2 to 4 photos to show your best side.
                </Text>

              </View>

              <View style={styles.photoCount}>

                <Text
                  style={styles.photoCountText}
                >
                  {photos.length}/4
                </Text>

              </View>

            </View>


            {/* PHOTO GRID */}

            <View style={styles.photoGrid}>

              {photos.map(
                (uri, index) => (

                  <View
                    key={`${uri}-${index}`}
                    style={styles.photoCard}
                  >

                    <Image
                      source={{ uri }}
                      style={styles.photoImage}
                    />


                    {/* REMOVE */}

                    <Pressable
                      style={styles.removePhoto}
                      onPress={() =>
                        removePhoto(index)
                      }
                    >

                      <Ionicons
                        name="close"
                        size={16}
                        color="#FFFFFF"
                      />

                    </Pressable>


                    {/* MAIN PHOTO */}

                    {index === 0 && (

                      <View
                        style={
                          styles.mainPhotoBadge
                        }
                      >

                        <Ionicons
                          name="star"
                          size={10}
                          color="#FF3D71"
                        />

                        <Text
                          style={
                            styles.mainPhotoText
                          }
                        >
                          Main photo
                        </Text>

                      </View>

                    )}

                  </View>

                )
              )}


              {/* ADD PHOTO */}

              {photos.length < 4 && (

                <Pressable
                  style={styles.addPhotoCard}
                  onPress={addPhoto}
                >

                  <View
                    style={styles.addPhotoIcon}
                  >

                    <Ionicons
                      name="add"
                      size={28}
                      color="#FF3D71"
                    />

                  </View>

                  <Text
                    style={styles.addPhotoText}
                  >
                    Add Photo
                  </Text>

                  <Text
                    style={styles.addPhotoSubtext}
                  >

                    {photos.length === 0
                      ? 'Choose a profile photo'
                      : `${4 - photos.length} slot${4 - photos.length === 1
                        ? ''
                        : 's'
                      } left`}

                  </Text>

                </Pressable>

              )}

            </View>


            {/* PHOTO WARNING */}

            {photos.length < 2 && (

              <View
                style={styles.photoRequired}
              >

                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#FF3D71"
                />

                <Text
                  style={
                    styles.photoRequiredText
                  }
                >

                  Please add at least{' '}
                  {2 - photos.length}{' '}
                  more photo
                  {2 - photos.length === 1
                    ? ''
                    : 's'}.

                </Text>

              </View>

            )}

          </View>


          {/* =====================================================
                CONTINUE
            ===================================================== */}

          <Pressable

            style={[
              styles.button,

              (
                photos.length < 2 ||
                !firstName.trim() ||
                !lastName.trim() ||
                !dateOfBirth ||
                !gender
              ) &&
              styles.buttonDisabled,
            ]}

            onPress={continueAbout}
          >

            <Text style={styles.buttonText}>
              Continue
            </Text>

            <View style={styles.buttonIcon}>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FF3D71"
              />

            </View>

          </Pressable>


          {/* =====================================================
                FOOTER
            ===================================================== */}

          <View style={styles.trust}>

            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#71717A"
            />

            <Text style={styles.trustText}>
              Your information is private and secure
            </Text>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </LinearGradient>
  );
}


/* =====================================================
  FIELD COMPONENT
===================================================== */

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: any) {

  return (

    <View style={styles.field}>

      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.inputBox}>

        <View style={styles.inputIcon}>

          <Ionicons
            name={icon}
            size={19}
            color="#FF3D71"
          />

        </View>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />

      </View>

    </View>
  );
}


/* =====================================================
  STYLES
===================================================== */

const styles = StyleSheet.create({

  /* =====================================================
    CONTAINER
  ===================================================== */

  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 32,
  },


  /* =====================================================
    TOP BAR
  ===================================================== */

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

  stepContainer: {
    alignItems: 'flex-end',
  },

  step: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#71717A',
  },

  stepCaption: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#A1A1AA',
    marginTop: 2,
  },


  /* =====================================================
    PROGRESS
  ===================================================== */

  progress: {
    flexDirection: 'row',
    gap: 5,
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


  /* =====================================================
    HEADER
  ===================================================== */

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


  /* =====================================================
    SECTIONS
  ===================================================== */

  sectionBlock: {
    marginTop: 34,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionHeaderLeft: {
    flex: 1,
  },

  sectionEyebrow: {
    color: '#FF3D71',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 6,
  },

  sectionTitle: {
    color: '#18181B',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  sectionDescription: {
    color: '#A1A1AA',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 290,
  },

  sectionNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFF6F8',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  sectionNumberText: {
    color: '#FF3D71',
    fontSize: 10,
    fontWeight: '900',
  },


  /* =====================================================
    NAME
  ===================================================== */

  nameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDEF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#18181B',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  nameIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nameContent: {
    flex: 1,
    marginLeft: 12,
  },

  smallLabel: {
    color: '#A1A1AA',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nameInput: {
    flex: 1,
    height: 32,
    padding: 0,
    color: '#18181B',
    fontSize: 14,
    fontWeight: '700',
  },

  nameDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E4E4E7',
    marginHorizontal: 8,
  },


  /* =====================================================
    ADVANCED FIELD
  ===================================================== */

  advancedField: {
    marginTop: 20,
  },

  label: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.15,
    marginBottom: 8,
  },

  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  optional: {
    color: '#A1A1AA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },


  /* =====================================================
    DATE
  ===================================================== */

  dateInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  dateTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  dateText: {
    color: '#18181B',
    fontSize: 14,
    fontWeight: '700',
  },

  placeholderText: {
    color: '#A1A1AA',
    fontWeight: '500',
  },

  inputHint: {
    color: '#A1A1AA',
    fontSize: 9,
    marginTop: 3,
  },


  /* =====================================================
    INPUT
  ===================================================== */

  field: {
    marginBottom: 17,
  },

  inputBox: {
    height: 58,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  inputIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#18181B',
    fontSize: 15,
  },


  /* =====================================================
    GENDER
  ===================================================== */

  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  genderCard: {
    width: '48%',
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  genderCardSelected: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
  },

  genderIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  genderIconSelected: {
    backgroundColor: '#FFE6ED',
  },

  genderTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  genderTitle: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '700',
  },

  genderTitleSelected: {
    color: '#18181B',
    fontWeight: '900',
  },

  genderRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  genderRadioSelected: {
    borderColor: '#FF3D71',
  },

  genderRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF3D71',
  },


  /* =====================================================
    BIO
  ===================================================== */

  bioCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 20,
    padding: 14,
  },

  bioTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bioIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bioTitleContainer: {
    flex: 1,
    marginLeft: 11,
  },

  bioTitle: {
    color: '#18181B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  bioSubtitle: {
    color: '#A1A1AA',
    fontSize: 9,
    marginTop: 3,
  },

  bioSparkle: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bioInput: {
    minHeight: 125,
    marginTop: 13,
    borderRadius: 15,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F2',
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#18181B',
    fontSize: 14,
    lineHeight: 21,
  },

  bioFooter: {
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bioTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  bioTipText: {
    color: '#A1A1AA',
    fontSize: 9,
    fontWeight: '600',
  },

  bioCounter: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '800',
  },


  /* =====================================================
    RELATIONSHIP
  ===================================================== */

  relationshipHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  relationshipAdvanced: {
    gap: 8,
  },

  relationshipCard: {
    minHeight: 58,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  relationshipCardSelected: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
  },

  relationshipIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  relationshipIconSelected: {
    backgroundColor: '#FFE6ED',
  },

  relationshipText: {
    flex: 1,
    color: '#71717A',
    fontSize: 13,
    fontWeight: '700',
  },

  relationshipTextSelected: {
    color: '#18181B',
    fontWeight: '900',
  },

  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3D71',
    alignItems: 'center',
    justifyContent: 'center',
  },


  /* =====================================================
    PHOTOS
  ===================================================== */

  photosSection: {
    marginTop: 32,
  },

  photosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  photosHeaderText: {
    flex: 1,
  },

  photoHint: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: -4,
  },

  photoCount: {
    minWidth: 42,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  photoCountText: {
    color: '#FF3D71',
    fontSize: 11,
    fontWeight: '900',
  },

  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  photoCard: {
    width: '47%',
    aspectRatio: 0.82,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F7F7F8',
    position: 'relative',
  },

  photoImage: {
    width: '100%',
    height: '100%',
  },

  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      'rgba(24,24,27,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  mainPhotoText: {
    color: '#FF3D71',
    fontSize: 9,
    fontWeight: '900',
  },

  addPhotoCard: {
    width: '47%',
    aspectRatio: 0.82,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFD1DE',
    borderStyle: 'dashed',
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  addPhotoIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  addPhotoText: {
    color: '#18181B',
    fontSize: 13,
    fontWeight: '800',
  },

  addPhotoSubtext: {
    color: '#A1A1AA',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },

  photoRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },

  photoRequiredText: {
    color: '#FF3D71',
    fontSize: 10,
    fontWeight: '700',
  },


  /* =====================================================
    BUTTON
  ===================================================== */

  button: {
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3D71',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },


  /* =====================================================
    FOOTER
  ===================================================== */

  trust: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 23,
  },

  trustText: {
    color: '#71717A',
    fontSize: 11,
  },

});