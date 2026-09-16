import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ResponsiveScreen from "../../components/ResponsiveScreen";
import { API_BASE_URL } from "../../../config/api";

type ProfileData = {
  user_id: number;

  name?: string;
  age?: number | null;

  first_name?: string;
  last_name?: string;
  date_of_birth?: string;

  city?: string | null;
  country?: string | null;

  gender?: string;
  bio?: string;
  occupation?: string;
  education?: string;
  height_cm?: number;
  relationship_status?: string;
  smoking?: string;

  interests?: string[];
  photos?: string[];

  profile_completed?: number;
  status?: string;
};

export default function ProfilePreviewScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // =========================================================
  // LOAD PROFILE PREVIEW
  // =========================================================

  useEffect(() => {
    loadProfilePreview();
  }, []);

  const loadProfilePreview = async () => {
    try {
      setLoading(true);

      // Get logged-in user dynamically
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert(
          "Error",
          "User information not found. Please login again."
        );
        return;
      }

      // =====================================================
      // PROFILE PREVIEW API
      // =====================================================

      const response = await fetch(
        `${API_BASE_URL}/api/profile/preview/${userId}`
      );

      const data = await response.json();

      console.log("PROFILE PREVIEW RESPONSE:", data);

      if (!response.ok || !data.success) {
        Alert.alert(
          "Error",
          data.message || "Failed to load profile"
        );
        return;
      }

      setProfile(data.data);

    } catch (error) {
      console.error("loadProfilePreview error:", error);

      Alert.alert(
        "Error",
        "Unable to connect to server"
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // COMPLETE PROFILE
  // =========================================================

  const handleStartDiscovering = async () => {
    try {
      setCompleting(true);

      // Get logged-in user dynamically
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert(
          "Error",
          "User information not found. Please login again."
        );
        return;
      }

      // =====================================================
      // COMPLETE PROFILE API
      // =====================================================

      const response = await fetch(
        `${API_BASE_URL}/api/profile/complete`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
          }),
        }
      );

      const data = await response.json();

      console.log("COMPLETE PROFILE RESPONSE:", data);

      if (!response.ok || !data.success) {
        Alert.alert(
          "Error",
          data.message || "Failed to complete profile"
        );
        return;
      }

      // Profile completed successfully
      router.replace("/dashboard");

    } catch (error) {
      console.error("completeProfile error:", error);

      Alert.alert(
        "Error",
        "Unable to connect to server"
      );

    } finally {
      setCompleting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <ResponsiveScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#FF3D71"
          />

          <Text style={styles.loadingText}>
            Loading your profile...
          </Text>
        </View>
      </ResponsiveScreen>
    );
  }

  // =========================================================
  // PROFILE NOT FOUND
  // =========================================================

  if (!profile) {
    return (
      <ResponsiveScreen>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Unable to load your profile.
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={loadProfilePreview}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </ResponsiveScreen>
    );
  }

  // =========================================================
  // DYNAMIC PROFILE DATA
  // =========================================================

  const displayName =
    profile.name ||
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Your Name";

  const displayAge =
    profile.age !== undefined &&
      profile.age !== null
      ? `, ${profile.age}`
      : "";

  const location =
    [profile.city, profile.country]
      .filter(Boolean)
      .join(", ") ||
    "Your Location";

  const bio =
    profile.bio ||
    "Your bio will appear here.";

  const interests =
    Array.isArray(profile.interests)
      ? profile.interests
      : [];

  const photos =
    Array.isArray(profile.photos)
      ? profile.photos.filter(Boolean)
      : [];

  // First uploaded photo
  const profilePhoto =
    photos.length > 0
      ? photos[0]
      : null;

  // =========================================================
  // UI
  // =========================================================

  return (
    <ResponsiveScreen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>
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

          <Text style={styles.step}>
            8 of 8
          </Text>
        </View>

        {/* PROGRESS */}

        <View style={styles.progressBg}>
          <View style={styles.progress} />
        </View>

        {/* TITLE */}

        <View style={styles.titleSection}>
          <Text style={styles.title}>
            Your profile is ready
          </Text>

          <Text style={styles.subtitle}>
            Take a final look before you start
            meeting people.
          </Text>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>

          {/* DYNAMIC PHOTO */}

          {profilePhoto ? (
            <Image
              source={{
                uri: profilePhoto,
              }}
              style={styles.photo}
              resizeMode="cover"
              onError={(error) => {
                console.log(
                  "Profile image loading error:",
                  error.nativeEvent
                );
              }}
            />
          ) : (
            <View style={styles.photo}>
              <Ionicons
                name="person"
                size={65}
                color="#FF3D71"
              />
            </View>
          )}

          {/* NAME */}

          <Text style={styles.name}>
            {displayName}
            {displayAge}
          </Text>

          {/* LOCATION */}

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={15}
              color="#71717A"
            />

            <Text style={styles.location}>
              {location}
            </Text>
          </View>

          {/* BIO */}

          <Text style={styles.bio}>
            {bio}
          </Text>

          {/* INTERESTS */}

          {interests.length > 0 && (
            <View style={styles.tags}>
              {interests.map(
                (item, index) => (
                  <View
                    style={styles.tag}
                    key={`${item}-${index}`}
                  >
                    <Text
                      style={styles.tagText}
                    >
                      {item}
                    </Text>
                  </View>
                )
              )}
            </View>
          )}
        </View>

        {/* CHECK LIST */}

        <View style={styles.checkList}>
          <CheckRow text="Basic information added" />
          <CheckRow text="Photos added" />
          <CheckRow text="Interests selected" />
          <CheckRow text="Dating preferences selected" />
          <CheckRow text="Location configured" />
        </View>

        {/* START DISCOVERING */}

        <Pressable
          style={[
            styles.button,
            completing && styles.buttonDisabled,
          ]}
          onPress={handleStartDiscovering}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Text style={styles.buttonText}>
                Start Discovering
              </Text>

              <Ionicons
                name="heart"
                size={20}
                color="#FFFFFF"
              />
            </>
          )}
        </Pressable>

      </ScrollView>
    </ResponsiveScreen>
  );
}

// =========================================================
// CHECK ROW
// =========================================================

function CheckRow({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name="checkmark-circle"
        size={21}
        color="#FF3D71"
      />

      <Text style={styles.checkText}>
        {text}
      </Text>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#71717A",
  },

  errorText: {
    fontSize: 15,
    color: "#71717A",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#FF3D71",
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    alignItems: "center",
    justifyContent: "center",
  },

  step: {
    fontSize: 14,
    fontWeight: "600",
    color: "#71717A",
  },

  progressBg: {
    height: 5,
    backgroundColor: "#FFE6ED",
    borderRadius: 10,
    marginTop: 14,
  },

  progress: {
    width: "100%",
    height: 5,
    backgroundColor: "#FF3D71",
    borderRadius: 10,
  },

  titleSection: {
    marginTop: 32,
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#18181B",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#71717A",
  },

  profileCard: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    padding: 18,
    alignItems: "center",
  },

  photo: {
    width: 145,
    height: 175,
    borderRadius: 20,
    backgroundColor: "#FFF6F8",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: "800",
    color: "#18181B",
  },

  locationRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  location: {
    marginLeft: 4,
    fontSize: 13,
    color: "#71717A",
  },

  bio: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#71717A",
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 15,
  },

  tag: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#FFF6F8",
  },

  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3D71",
  },

  checkList: {
    marginTop: 20,
    gap: 11,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkText: {
    marginLeft: 9,
    fontSize: 13,
    color: "#71717A",
  },

  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF3D71",
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

