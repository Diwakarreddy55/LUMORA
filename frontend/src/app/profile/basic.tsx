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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function AboutScreen() {
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [height, setHeight] = useState('');
  const [relationship, setRelationship] = useState('');

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);

  /* =========================
     ADD PHOTO
  ========================= */

  const addPhoto = async () => {
    // Maximum 4 photos
    if (photos.length >= 4) {
      Alert.alert(
        'Maximum photos',
        'You can add a maximum of 4 photos.'
      );
      return;
    }

    // Ask permission
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow photo library access to add your photos.'
      );
      return;
    }

    // Open gallery
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const selectedUri = result.assets[0].uri;

      setPhotos((currentPhotos) => [
        ...currentPhotos,
        selectedUri,
      ]);
    }
  };

  /* =========================
     REMOVE PHOTO
  ========================= */

  const removePhoto = (index: number) => {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((_, i) => i !== index)
    );
  };

  /* =========================
     CONTINUE
  ========================= */

  const continueAbout = () => {
    // Minimum 2 photos
    if (photos.length < 2) {
      Alert.alert(
        'Add more photos',
        `Please add at least ${
          2 - photos.length
        } more photo${2 - photos.length === 1 ? '' : 's'} to continue.`
      );

      return;
    }

    router.push('/profile/interests');
  };

  return (
    <LinearGradient
      colors={['#FFF6F8', '#FFFFFF']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* =========================
              TOP BAR
          ========================= */}

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
              3 OF 8
            </Text>

          </View>

          {/* =========================
              PROGRESS
          ========================= */}

          <View style={styles.progress}>

            <View style={styles.progressActive} />

            <View style={styles.progressActive} />

            <View style={styles.progressActive} />

            <View style={styles.progressInactive} />

          </View>

          {/* =========================
              HEADER
          ========================= */}

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
              Tell us a little about yourself so we can
              create a better profile for you.
            </Text>

          </View>

          {/* =========================
              FORM
          ========================= */}

          <View style={styles.form}>

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

            {/* =========================
                RELATIONSHIP
            ========================= */}

            <View style={styles.relationshipHeader}>

              <Text style={styles.label}>
                RELATIONSHIP STATUS
              </Text>

              <Text style={styles.optional}>
                OPTIONAL
              </Text>

            </View>

            <View style={styles.options}>

              {[
                ['single', 'Single'],
                ['divorced', 'Divorced'],
                ['widowed', 'Widowed'],
                ['separated', 'Separated'],
              ].map(([value, label]) => {

                const selected =
                  relationship === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() =>
                      setRelationship(value)
                    }
                    style={[
                      styles.option,
                      selected &&
                        styles.optionSelected,
                    ]}
                  >

                    <View
                      style={[
                        styles.optionIcon,
                        selected &&
                          styles.optionIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          value === 'single'
                            ? 'heart-outline'
                            : value === 'divorced'
                            ? 'heart-dislike-outline'
                            : value === 'widowed'
                            ? 'flower-outline'
                            : 'git-branch-outline'
                        }
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
                        styles.optionText,
                        selected &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {label}
                    </Text>

                    <View
                      style={[
                        styles.radio,
                        selected &&
                          styles.radioSelected,
                      ]}
                    >
                      {selected && (
                        <View
                          style={styles.radioDot}
                        />
                      )}
                    </View>

                  </Pressable>
                );
              })}

            </View>

            {/* =========================
                YOUR PHOTOS
            ========================= */}

            <View style={styles.photosSection}>

              <View style={styles.photosHeader}>

                <View style={styles.photosHeaderText}>

                  <Text style={styles.label}>
                    YOUR PHOTOS
                  </Text>

                  <Text style={styles.photoHint}>
                    Add 2 to 4 photos to show your best side.
                  </Text>

                </View>

                <View style={styles.photoCount}>

                  <Text style={styles.photoCountText}>
                    {photos.length}/4
                  </Text>

                </View>

              </View>

              {/* PHOTO GRID */}

              <View style={styles.photoGrid}>

                {/* SELECTED PHOTOS */}

                {photos.map((uri, index) => (

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
                        style={styles.mainPhotoBadge}
                      >
                        <Text
                          style={styles.mainPhotoText}
                        >
                          Main
                        </Text>
                      </View>
                    )}

                  </View>

                ))}

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
                        : `${4 - photos.length} slot${
                            4 - photos.length === 1
                              ? ''
                              : 's'
                          } left`}
                    </Text>

                  </Pressable>

                )}

              </View>

              {/* MINIMUM PHOTO WARNING */}

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
                    style={styles.photoRequiredText}
                  >
                    Please add at least{' '}
                    {2 - photos.length}{' '}
                    more photo
                    {2 - photos.length === 1
                      ? ''
                      : 's'}
                    .
                  </Text>

                </View>

              )}

            </View>

            {/* =========================
                CONTINUE
            ========================= */}

            <Pressable
              style={[
                styles.button,
                photos.length < 2 &&
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

          </View>

          {/* =========================
              FOOTER
          ========================= */}

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

  /* CONTAINER */

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

  /* TOP */

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

  /* FORM */

  form: {
    marginTop: 30,
  },

  field: {
    marginBottom: 17,
  },

  label: {
    color: '#71717A',

    fontSize: 10,
    fontWeight: '900',

    letterSpacing: 1.15,

    marginBottom: 8,
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

  /* RELATIONSHIP */

  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 3,
  },

  optional: {
    color: '#A1A1AA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  options: {
    gap: 8,
  },

  option: {
    minHeight: 55,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: '#E4E4E7',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 11,

    flexDirection: 'row',
    alignItems: 'center',
  },

  optionSelected: {
    borderColor: '#FF3D71',
    backgroundColor: '#FFF6F8',
  },

  optionIcon: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: '#F7F7F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  optionIconSelected: {
    backgroundColor: '#FFE6ED',
  },

  optionText: {
    flex: 1,

    color: '#71717A',

    fontSize: 14,
    fontWeight: '700',
  },

  optionTextSelected: {
    color: '#18181B',
    fontWeight: '800',
  },

  radio: {
    width: 21,
    height: 21,

    borderRadius: 11,

    borderWidth: 1.5,
    borderColor: '#D4D4D8',

    alignItems: 'center',
    justifyContent: 'center',
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

  /* =====================================================
     PHOTOS
  ===================================================== */

  photosSection: {
    marginTop: 28,
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

  /* BUTTON */

  button: {
    height: 60,

    borderRadius: 30,

    backgroundColor: '#FF3D71',

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 24,
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

  /* FOOTER */

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
