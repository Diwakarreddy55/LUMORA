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
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AboutScreen() {
  const { width } = useWindowDimensions();

  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [height, setHeight] = useState('');
  const [relationship, setRelationship] = useState('');

  const isTablet = width >= 768;

  const continueAbout = () => {
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            isTablet && styles.scrollTablet,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.content,
              isTablet && styles.contentTablet,
            ]}
          >
            {/* BACK BUTTON */}

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

            {/* PROGRESS */}

            <View style={styles.progress}>
              <View style={styles.activeProgress} />
              <View style={styles.activeProgress} />
              <View style={styles.activeProgress} />

              <View style={styles.progressLine} />
              <View style={styles.progressLine} />
              <View style={styles.progressLine} />
              <View style={styles.progressLine} />
              <View style={styles.progressLine} />
            </View>

            {/* HEADER */}

            <View style={styles.header}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="sparkles"
                  size={24}
                  color="#FF3D71"
                />
              </View>

              <Text style={styles.eyebrow}>
                ABOUT YOU
              </Text>

              <Text
                style={[
                  styles.title,
                  isTablet && styles.titleTablet,
                ]}
              >
                A little more{'\n'}
                <Text style={styles.pink}>
                  about you.
                </Text>
              </Text>

              <Text style={styles.subtitle}>
                Help people discover what makes you,
                you.
              </Text>
            </View>

            {/* FORM */}

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

              {/* RELATIONSHIP */}

              <View style={styles.relationshipSection}>
                <Text style={styles.label}>
                  RELATIONSHIP STATUS
                </Text>

                <Text style={styles.sectionHint}>
                  Choose the option that best describes you.
                </Text>

                <View style={styles.options}>
                  {[
                    ['single', 'Single', 'heart-outline'],
                    ['divorced', 'Divorced', 'heart-dislike-outline'],
                    ['widowed', 'Widowed', 'heart-half-outline'],
                    ['separated', 'Separated', 'git-compare-outline'],
                  ].map(([value, label, icon]) => {
                    const selected = relationship === value;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => setRelationship(value)}
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
                              styles.optionText,
                              selected &&
                                styles.optionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
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

              {/* CONTINUE */}

              <Pressable
                style={styles.button}
                onPress={continueAbout}
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
            </View>

            {/* TRUST */}

            <View style={styles.trust}>
              <Ionicons
                name="shield-checkmark"
                size={17}
                color="#71717A"
              />

              <Text style={styles.trustText}>
                Your information is private and secure
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ------------------------------------------------ */
/* FIELD COMPONENT */
/* ------------------------------------------------ */

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
            size={20}
            color="#71717A"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="sentences"
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 35,
  },

  scrollTablet: {
    paddingHorizontal: 35,
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

    maxWidth: 520,
  },

  /* FORM */

  form: {
    marginTop: 38,
  },

  field: {
    marginBottom: 20,
  },

  label: {
    color: '#71717A',

    fontSize: 10,
    fontWeight: '900',

    letterSpacing: 1.2,

    marginBottom: 10,
  },

  inputBox: {
    minHeight: 62,

    borderWidth: 1,
    borderColor: '#E4E4E7',

    borderRadius: 18,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 10,
  },

  inputIcon: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: '#FFF6F8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,

    minHeight: 60,

    paddingHorizontal: 13,

    color: '#18181B',

    fontSize: 16,
  },

  /* RELATIONSHIP */

  relationshipSection: {
    marginTop: 3,
  },

  sectionHint: {
    color: '#A1A1AA',

    fontSize: 12,

    marginTop: -3,
    marginBottom: 12,
  },

  options: {
    gap: 10,
  },

  option: {
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
    width: 38,
    height: 38,

    borderRadius: 13,

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

    fontWeight: '700',
  },

  optionTextSelected: {
    color: '#FF3D71',
  },

  /* RADIO */

  radio: {
    width: 22,
    height: 22,

    borderRadius: 11,

    borderWidth: 1.5,
    borderColor: '#D4D4D8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelected: {
    borderColor: '#FF3D71',
  },

  radioDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: '#FF3D71',
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