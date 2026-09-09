import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ResponsiveScreen from '../../components/ResponsiveScreen';

export default function ProfilePreviewScreen() {
  return (
    <ResponsiveScreen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#18181B" />
          </Pressable>

          <Text style={styles.step}>8 of 8</Text>
        </View>

        <View style={styles.progressBg}>
          <View style={styles.progress} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Your profile is ready</Text>
          <Text style={styles.subtitle}>
            Take a final look before you start meeting people.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.photo}>
            <Ionicons
              name="person"
              size={65}
              color="#FF3D71"
            />
          </View>

          <Text style={styles.name}>
            Your Name, 25
          </Text>

          <Text style={styles.location}>
            <Ionicons
              name="location-outline"
              size={15}
              color="#71717A"
            />
            {' '}Your Location
          </Text>

          <Text style={styles.bio}>
            Your bio will appear here.
          </Text>

          <View style={styles.tags}>
            {['Music', 'Travel', 'Movies'].map(item => (
              <View style={styles.tag} key={item}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.checkList}>
          <CheckRow text="Basic information added" />
          <CheckRow text="Photos added" />
          <CheckRow text="Interests selected" />
          <CheckRow text="Dating preferences selected" />
          <CheckRow text="Location configured" />
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>
            Start Discovering
          </Text>

          <Ionicons
            name="heart"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      </ScrollView>
    </ResponsiveScreen>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name="checkmark-circle"
        size={21}
        color="#FF3D71"
      />

      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingBottom: 35,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  progressBg: {
    height: 5,
    backgroundColor: '#FFE6ED',
    borderRadius: 10,
    marginTop: 14,
  },
  progress: {
    width: '100%',
    height: 5,
    backgroundColor: '#FF3D71',
    borderRadius: 10,
  },
  titleSection: {
    marginTop: 32,
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#18181B',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#71717A',
  },
  profileCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE6ED',
    padding: 18,
    alignItems: 'center',
  },
  photo: {
    width: 145,
    height: 175,
    borderRadius: 20,
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: '800',
    color: '#18181B',
  },
  location: {
    marginTop: 5,
    fontSize: 13,
    color: '#71717A',
  },
  bio: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#71717A',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
  },
  tag: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFF6F8',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3D71',
  },
  checkList: {
    marginTop: 20,
    gap: 11,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkText: {
    marginLeft: 9,
    fontSize: 13,
    color: '#71717A',
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF3D71',
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
