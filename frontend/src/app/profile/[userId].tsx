import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

const { width } = Dimensions.get("window");

// =========================================================
// API CONFIGURATION
// =========================================================
//
// LOCAL:
// EXPO_PUBLIC_API_URL=http://192.168.1.8:5000
//
// UAT:
// EXPO_PUBLIC_API_URL=https://uat-api.example.com
//
// PRODUCTION:
// EXPO_PUBLIC_API_URL=https://api.example.com
//
// Do NOT change this file when moving environments.
// Only change the environment variable.
// =========================================================

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured"
  );
}

// Remove accidental trailing slash
const API_URL =
  API_BASE_URL.replace(/\/+$/, "");

// =========================================================
// USER PROFILE TYPE
// =========================================================

interface UserProfile {
  id: number;

  name: string;

  age: number | null;

  gender: string;

  city: string;

  state: string;

  country: string;

  country_code: string;

  latitude?: number | null;

  longitude?: number | null;

  about: string;

  education: string;

  occupation: string;

  relationship: string;

  height_cm: number | null;

  height: string;

  interests: string[];

  lifestyle: string[];

  photos: string[];

  image: string | null;

  online: boolean;
}

// =========================================================
// API RESPONSE TYPE
// =========================================================

interface ProfileApiResponse {
  success: boolean;

  data?: UserProfile;

  message?: string;
}

// =========================================================
// SCREEN
// =========================================================

export default function UserProfileScreen() {

  // =======================================================
  // GET USER ID FROM ROUTE
  // =======================================================

  const { userId } =
    useLocalSearchParams<{
      userId: string;
    }>();

  // =======================================================
  // STATES
  // =======================================================

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const [isLiked, setIsLiked] =
    useState<boolean>(false);

  // =======================================================
  // LOAD PROFILE
  // =======================================================

  useEffect(() => {

    if (!userId) {

      setError(
        "User ID is missing"
      );

      setLoading(false);

      return;
    }

    fetchUserProfile();

  }, [userId]);

  // =======================================================
  // FETCH PROFILE
  // =======================================================

  const fetchUserProfile =
    async () => {

      try {

        setLoading(true);

        setError("");

        // Expo Router can theoretically
        // return string | string[]

        const id =
          Array.isArray(userId)
            ? userId[0]
            : userId;

        // Validate ID

        if (
          !id ||
          isNaN(Number(id))
        ) {

          setError(
            "Invalid user ID"
          );

          return;
        }

        // =================================================
        // DYNAMIC API URL
        // =================================================

        const apiUrl =
          `${API_URL}/api/profile/${id}`;

        console.log(
          "================================"
        );

        console.log(
          "PROFILE API"
        );

        console.log(
          "API URL:",
          apiUrl
        );

        console.log(
          "USER ID:",
          id
        );

        console.log(
          "================================"
        );

        // =================================================
        // API CALL
        // =================================================

        const response =
          await fetch(apiUrl, {
            method: "GET",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },
          });

        // =================================================
        // READ RESPONSE
        // =================================================

        const result:
          ProfileApiResponse =
          await response.json();

        console.log(
          "Profile API response:",
          result
        );

        // =================================================
        // HTTP ERROR
        // =================================================

        if (!response.ok) {

          throw new Error(
            result?.message ||
            `Request failed with status ${response.status}`
          );
        }

        // =================================================
        // API ERROR
        // =================================================

        if (
          !result.success ||
          !result.data
        ) {

          throw new Error(
            result?.message ||
            "Profile not found"
          );
        }

        // =================================================
        // SAVE USER
        // =================================================

        setUser(
          result.data
        );

      } catch (err: any) {

        console.error(
          "Fetch profile error:",
          err
        );

        setError(
          err?.message ||
          "Failed to load profile"
        );

      } finally {

        setLoading(false);

      }
    };

  // =======================================================
  // LIKE
  // =======================================================

  const handleLike = () => {

    if (!user) {
      return;
    }

    setIsLiked(
      previous =>
        !previous
    );

    console.log(
      "Like user:",
      user.id
    );

    // Later:
    //
    // await fetch(
    //   `${API_URL}/api/likes`,
    //   {
    //     method: "POST",
    //     ...
    //   }
    // );
  };

  // =======================================================
  // CHAT
  // =======================================================

  const handleChat = () => {

    if (!user) {
      return;
    }

    router.push(
      `/chat/${user.id}`
    );
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <SafeAreaView
        style={styles.container}
      >

        <View
          style={
            styles.centerContainer
          }
        >

          <ActivityIndicator
            size="large"
            color="#FF3D71"
          />

          <Text
            style={styles.loadingText}
          >
            Loading profile...
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (
    error ||
    !user
  ) {

    return (
      <SafeAreaView
        style={styles.container}
      >

        <View
          style={
            styles.centerContainer
          }
        >

          <Ionicons
            name="person-outline"
            size={55}
            color="#FF3D71"
          />

          <Text
            style={
              styles.errorTitle
            }
          >
            Profile not found
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            {error ||
              "Unable to load this profile."}
          </Text>

          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >

            <Text
              style={
                styles.backButtonText
              }
            >
              Go Back
            </Text>

          </Pressable>

        </View>

      </SafeAreaView>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <Pressable
          style={
            styles.headerButton
          }
          onPress={() =>
            router.back()
          }
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color="#222"
          />

        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          Profile
        </Text>

        <Pressable
          style={
            styles.headerButton
          }
        >

          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#222"
          />

        </Pressable>

      </View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            MAIN PHOTO
        ================================================= */}

        <View
          style={
            styles.mainPhotoWrapper
          }
        >

          {user.photos &&
          user.photos.length > 0 ? (

            <Image
              source={{
                uri:
                  user.photos[0],
              }}
              style={
                styles.mainPhoto
              }
            />

          ) : (

            <View
              style={
                styles.noPhotoContainer
              }
            >

              <Ionicons
                name="person-outline"
                size={70}
                color="#BBBBBB"
              />

              <Text
                style={
                  styles.noPhotoText
                }
              >
                No photo
              </Text>

            </View>
          )}

          {/* ONLINE */}

          {user.online && (

            <View
              style={
                styles.onlineBadge
              }
            >

              <View
                style={
                  styles.onlineDot
                }
              />

              <Text
                style={
                  styles.onlineText
                }
              >
                Online
              </Text>

            </View>
          )}

          {/* PHOTO COUNT */}

          <View
            style={
              styles.photoCounter
            }
          >

            <Ionicons
              name="images-outline"
              size={15}
              color="#fff"
            />

            <Text
              style={
                styles.photoCounterText
              }
            >
              {user.photos?.length ||
                0}
            </Text>

          </View>

        </View>

        {/* =================================================
            NAME / LOCATION
        ================================================= */}

        <View
          style={
            styles.nameSection
          }
        >

          <View
            style={
              styles.nameContent
            }
          >

            <Text
              style={styles.name}
            >

              {user.name}

              {user.age
                ? `, ${user.age}`
                : ""}

            </Text>

            <View
              style={
                styles.locationRow
              }
            >

              <Ionicons
                name="location-outline"
                size={17}
                color="#FF3D71"
              />

              <Text
                style={
                  styles.locationText
                }
              >

                {[
                  user.city,
                  user.state,
                ]
                  .filter(Boolean)
                  .join(", ")}

              </Text>

            </View>

          </View>

          {/* LIKE */}

          <Pressable
            style={[
              styles.favoriteButton,

              isLiked &&
                styles.favoriteButtonActive,
            ]}
            onPress={
              handleLike
            }
          >

            <Ionicons
              name={
                isLiked
                  ? "heart"
                  : "heart-outline"
              }
              size={23}
              color="#FF3D71"
            />

          </Pressable>

        </View>

        {/* =================================================
            ABOUT
        ================================================= */}

        <View
          style={styles.section}
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            About
          </Text>

          <View
            style={styles.card}
          >

            <Text
              style={
                styles.aboutText
              }
            >

              {user.about ||
                "No information available."}

            </Text>

          </View>

        </View>

        {/* =================================================
            INTERESTS
        ================================================= */}

        {user.interests &&
          user.interests.length >
            0 && (

            <View
              style={
                styles.section
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Interests
              </Text>

              <View
                style={
                  styles.chipContainer
                }
              >

                {user.interests.map(
                  (
                    interest,
                    index
                  ) => (

                    <View
                      key={
                        `${interest}-${index}`
                      }
                      style={
                        styles.interestChip
                      }
                    >

                      <Text
                        style={
                          styles.interestText
                        }
                      >
                        {interest}
                      </Text>

                    </View>
                  )
                )}

              </View>

            </View>
          )}

        {/* =================================================
            LIFESTYLE
        ================================================= */}

        {user.lifestyle &&
          user.lifestyle.length >
            0 && (

            <View
              style={
                styles.section
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Lifestyle
              </Text>

              <View
                style={
                  styles.chipContainer
                }
              >

                {user.lifestyle.map(
                  (
                    item,
                    index
                  ) => (

                    <View
                      key={
                        `${item}-${index}`
                      }
                      style={
                        styles.lifestyleChip
                      }
                    >

                      <Text
                        style={
                          styles.lifestyleText
                        }
                      >
                        {item}
                      </Text>

                    </View>
                  )
                )}

              </View>

            </View>
          )}

        {/* =================================================
            DETAILS
        ================================================= */}

        <View
          style={styles.section}
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            About {user.name}
          </Text>

          <View
            style={
              styles.detailsCard
            }
          >

            {user.education && (

              <DetailRow
                icon="school-outline"
                label="Education"
                value={
                  user.education
                }
              />

            )}

            {user.occupation && (

              <DetailRow
                icon="briefcase-outline"
                label="Occupation"
                value={
                  user.occupation
                }
              />

            )}

            {user.relationship && (

              <DetailRow
                icon="heart-outline"
                label="Relationship"
                value={
                  user.relationship
                }
              />

            )}

            {user.height && (

              <DetailRow
                icon="resize-outline"
                label="Height"
                value={
                  user.height
                }
              />

            )}

            <DetailRow
              icon="location-outline"
              label="Location"
              value={[
                user.city,
                user.state,
                user.country,
              ]
                .filter(Boolean)
                .join(", ")}
            />

          </View>

        </View>

        {/* =================================================
            PHOTOS
        ================================================= */}

        {user.photos &&
          user.photos.length >
            0 && (

            <View
              style={
                styles.section
              }
            >

              <View
                style={
                  styles.photoHeader
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Photos
                </Text>

                <Text
                  style={
                    styles.photoCount
                  }
                >

                  {user.photos.length}{" "}

                  {user.photos.length ===
                  1
                    ? "photo"
                    : "photos"}

                </Text>

              </View>

              <View
                style={
                  styles.photoGrid
                }
              >

                {user.photos
                  .slice(1)
                  .map(
                    (
                      photo,
                      index
                    ) => (

                      <Pressable
                        key={
                          `${photo}-${index}`
                        }
                        style={
                          styles.photoItem
                        }
                      >

                        <Image
                          source={{
                            uri: photo,
                          }}
                          style={
                            styles.photo
                          }
                        />

                      </Pressable>

                    )
                  )}

              </View>

            </View>
          )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <View
          style={styles.actions}
        >

          <Pressable
            style={
              styles.likeButton
            }
            onPress={
              handleLike
            }
          >

            <Ionicons
              name={
                isLiked
                  ? "heart"
                  : "heart-outline"
              }
              size={23}
              color="#FF3D71"
            />

            <Text
              style={
                styles.likeText
              }
            >

              {isLiked
                ? "Liked"
                : "Like"}

            </Text>

          </Pressable>

          <Pressable
            style={
              styles.chatButton
            }
            onPress={
              handleChat
            }
          >

            <Ionicons
              name="chatbubble-outline"
              size={21}
              color="#fff"
            />

            <Text
              style={
                styles.chatText
              }
            >
              Chat
            </Text>

          </Pressable>

        </View>

        <View
          style={{
            height: 35,
          }}
        />

      </ScrollView>

    </SafeAreaView>
  );
}

// =========================================================
// DETAIL ROW
// =========================================================

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {

  return (

    <View
      style={
        styles.detailRow
      }
    >

      <View
        style={
          styles.detailIcon
        }
      >

        <Ionicons
          name={icon}
          size={20}
          color="#FF3D71"
        />

      </View>

      <View
        style={
          styles.detailContent
        }
      >

        <Text
          style={
            styles.detailLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.detailValue
          }
        >
          {value || "-"}
        </Text>

      </View>

    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#FFF8FA",
    },

    scrollContent: {
      paddingBottom: 20,
    },

    // =====================================================
    // CENTER
    // =====================================================

    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: "#777777",
    },

    errorTitle: {
      marginTop: 15,
      fontSize: 20,
      fontWeight: "800",
      color: "#222222",
    },

    errorText: {
      marginTop: 8,
      fontSize: 14,
      color: "#777777",
      textAlign: "center",
    },

    backButton: {
      marginTop: 20,
      backgroundColor:
        "#FF3D71",
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 12,
    },

    backButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
      height: 62,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFF8FA",
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#222222",
    },

    // =====================================================
    // MAIN PHOTO
    // =====================================================

    mainPhotoWrapper: {
      marginHorizontal: 18,
      height: width * 1.08,
      maxHeight: 430,
      minHeight: 350,
      borderRadius: 26,
      overflow: "hidden",
      position: "relative",
      backgroundColor:
        "#EEEEEE",
    },

    mainPhoto: {
      width: "100%",
      height: "100%",
    },

    noPhotoContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EEEEEE",
    },

    noPhotoText: {
      marginTop: 8,
      fontSize: 14,
      color: "#999999",
    },

    onlineBadge: {
      position: "absolute",
      top: 15,
      left: 15,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
    },

    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#32D74B",
      marginRight: 6,
    },

    onlineText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },

    photoCounter: {
      position: "absolute",
      right: 15,
      bottom: 15,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    photoCounterText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },

    // =====================================================
    // NAME
    // =====================================================

    nameSection: {
      paddingHorizontal: 20,
      paddingTop: 18,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    nameContent: {
      flex: 1,
    },

    name: {
      fontSize: 27,
      fontWeight: "900",
      color: "#222222",
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
    },

    locationText: {
      marginLeft: 5,
      color: "#777777",
      fontSize: 14,
    },

    favoriteButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        "#FFE8EF",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 12,
    },

    favoriteButtonActive: {
      backgroundColor:
        "#FFE0EA",
    },

    // =====================================================
    // SECTION
    // =====================================================

    section: {
      paddingHorizontal: 20,
      marginTop: 25,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#222222",
      marginBottom: 12,
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor:
        "#F0E5E8",
    },

    aboutText: {
      fontSize: 14,
      color: "#666666",
      lineHeight: 22,
    },

    // =====================================================
    // CHIPS
    // =====================================================

    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
    },

    interestChip: {
      backgroundColor:
        "#FFE8EF",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
    },

    interestText: {
      color: "#D92F60",
      fontSize: 13,
      fontWeight: "700",
    },

    lifestyleChip: {
      backgroundColor:
        "#FFFFFF",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#EADDE1",
    },

    lifestyleText: {
      color: "#666666",
      fontSize: 13,
      fontWeight: "600",
    },

    // =====================================================
    // DETAILS
    // =====================================================

    detailsCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        "#F0E5E8",
    },

    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },

    detailIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FFF0F4",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    detailContent: {
      flex: 1,
    },

    detailLabel: {
      fontSize: 12,
      color: "#999999",
      marginBottom: 3,
    },

    detailValue: {
      fontSize: 14,
      color: "#333333",
      fontWeight: "700",
    },

    // =====================================================
    // PHOTOS
    // =====================================================

    photoHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    photoCount: {
      color: "#999999",
      fontSize: 13,
    },

    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    photoItem: {
      width: "31.8%",
      aspectRatio: 1,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor:
        "#EEEEEE",
    },

    photo: {
      width: "100%",
      height: "100%",
    },

    // =====================================================
    // ACTIONS
    // =====================================================

    actions: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
      marginTop: 30,
    },

    likeButton: {
      flex: 1,
      height: 54,
      borderRadius: 17,
      backgroundColor:
        "#FFE8EF",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 8,
    },

    likeText: {
      color: "#FF3D71",
      fontSize: 15,
      fontWeight: "800",
    },

    chatButton: {
      flex: 1,
      height: 54,
      borderRadius: 17,
      backgroundColor:
        "#FF3D71",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 8,
    },

    chatText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

  });