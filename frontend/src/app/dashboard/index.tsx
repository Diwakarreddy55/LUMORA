import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import ResponsiveScreen from "../../components/ResponsiveScreen";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

type Person = {
  id: number;
  name: string;
  age: number;
  gender: string;
  bio: string;
  occupation: string;
  education: string | null;
  height_cm: number | null;
  relationship_status: string | null;
  image: string | null;
  images: string[];
  distance: number;
  location_match: string;
  city: string | null;
  state: string | null;
  country: string | null;
  online: boolean;
  likes_count: number;
  comments_count: number;

  /**
   * Current user's action
   */
  my_action?: "like" | "dislike" | null;

  /**
   * True when both users liked each other
   */
  matched?: boolean;
};

type LoggedInUser = {
  id: number;
  name: string;
  phone: string;
  phone_verified: boolean;
};

type UserAction = {
  to_user_id: number;
  action: "like" | "dislike";
  matched?: boolean;
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] =
    useState("nearby");

  const [people, setPeople] =
    useState<Person[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [userName, setUserName] =
    useState("User");

  const [currentHour, setCurrentHour] =
    useState(new Date().getHours());

  /**
   * ------------------------------------------------
   * INITIAL LOAD
   * ------------------------------------------------
   */

  useEffect(() => {
    loadDashboard();

    /**
     * Update greeting every 60 seconds.
     */
    const timer = setInterval(() => {
      setCurrentHour(
        new Date().getHours()
      );
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /**
   * ------------------------------------------------
   * LOAD EVERYTHING
   * ------------------------------------------------
   */

  const loadDashboard = async () => {
    await Promise.all([
      loadCurrentUser(),
      fetchDashboardUsers(),
    ]);
  };

  /**
   * ------------------------------------------------
   * CURRENT USER
   * ------------------------------------------------
   */

  const loadCurrentUser = async () => {
    try {
      const userData =
        await AsyncStorage.getItem(
          "user"
        );

      if (!userData) {
        console.log(
          "No logged-in user data found"
        );

        setUserName("User");

        return;
      }

      const user: LoggedInUser =
        JSON.parse(userData);

      console.log(
        "Logged-in user:",
        user
      );

      setUserName(
        user.name || "User"
      );
    } catch (error) {
      console.error(
        "Failed to load current user:",
        error
      );

      setUserName("User");
    }
  };

  /**
   * ------------------------------------------------
   * GREETING
   * ------------------------------------------------
   */

  const getGreeting = () => {
    const hour = currentHour;

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good evening";
    }

    return "Good night";
  };

  /**
   * ------------------------------------------------
   * IMAGE URL
   * ------------------------------------------------
   */

  const getImageUrl = (
    image: string | null
  ): string | null => {
    if (!image) {
      return null;
    }

    if (!API_URL) {
      return image;
    }

    return image.replace(
      "http://localhost:5000",
      API_URL
    );
  };

  /**
   * ------------------------------------------------
   * FETCH DASHBOARD USERS
   * ------------------------------------------------
   */

  const fetchDashboardUsers = async () => {
    try {
      setLoading(true);

      if (!API_URL) {
        console.error(
          "EXPO_PUBLIC_API_URL is not configured"
        );

        setPeople([]);

        return;
      }

      const token =
        await AsyncStorage.getItem(
          "token"
        );

      if (!token) {
        console.log(
          "No authentication token found"
        );

        setPeople([]);

        return;
      }

      /**
       * Get dashboard users
       */
      const dashboardResponse =
        await fetch(
          `${API_URL}/api/users/dashboard`,
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const dashboardData =
        await dashboardResponse.json();

      console.log(
        "Dashboard response:",
        dashboardData
      );

      if (
        !dashboardResponse.ok ||
        !dashboardData.success
      ) {
        console.error(
          "Dashboard API failed:",
          dashboardData?.message
        );

        setPeople([]);

        return;
      }

      /**
       * Dashboard users
       */
      const dashboardUsers: Person[] =
        dashboardData.users || [];

      /**
       * Get current user's
       * Like / Dislike actions
       */
      let actions: UserAction[] = [];

      try {
        const actionsResponse =
          await fetch(
            `${API_URL}/api/users/actions`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const actionsData =
          await actionsResponse.json();

        console.log(
          "User actions response:",
          actionsData
        );

        if (
          actionsResponse.ok &&
          actionsData.success
        ) {
          actions =
            actionsData.actions || [];
        }
      } catch (error) {
        /**
         * If actions API is not available,
         * dashboard still works.
         */
        console.error(
          "Actions API error:",
          error
        );
      }

      /**
       * Create action map
       */
      const actionMap =
        new Map<
          number,
          UserAction
        >();

      actions.forEach(
        (action) => {
          actionMap.set(
            Number(
              action.to_user_id
            ),
            action
          );
        }
      );

      /**
       * Merge dashboard users
       * with current user's actions
       */
      const usersWithActions =
        dashboardUsers.map(
          (person) => {
            const action =
              actionMap.get(
                Number(person.id)
              );

            return {
              ...person,

              my_action:
                action?.action ||
                null,

              matched:
                action?.matched ||
                false,
            };
          }
        );

      setPeople(
        usersWithActions
      );
    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );

      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ------------------------------------------------
   * LIKE / DISLIKE API
   * ------------------------------------------------
   */

  const handleUserAction = async (
    personId: number,
    action: "like" | "dislike"
  ) => {
    try {
      if (!API_URL) {
        console.error(
          "EXPO_PUBLIC_API_URL is missing"
        );

        return;
      }

      const token =
        await AsyncStorage.getItem(
          "token"
        );

      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login again."
        );

        return;
      }

      console.log(
        `➡️ ${action} user:`,
        personId
      );

      /**
       * API
       *
       * POST /api/users/action
       */
      const response =
        await fetch(
          `${API_URL}/api/users/action`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              target_user_id:
                personId,

              action:
                action,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Action API response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        Alert.alert(
          "Action Failed",
          data?.message ||
            "Unable to update action."
        );

        return;
      }

      /**
       * Backend returns:
       *
       * data: {
       *   from_user_id,
       *   to_user_id,
       *   action,
       *   matched,
       *   match_id
       * }
       */

      const matched =
        data.data?.matched === true;

      /**
       * Update UI immediately.
       */
      setPeople(
        (currentPeople) =>
          currentPeople.map(
            (person) =>
              person.id === personId
                ? {
                    ...person,

                    my_action:
                      action,

                    matched:
                      matched,
                  }
                : person
          )
      );

      /**
       * MATCH
       */
      if (matched) {
        Alert.alert(
          "It's a Match! 🎉❤️",
          "You both liked each other.",
          [
            {
              text: "Later",
              style: "cancel",
            },
            {
              text: "Chat",
              onPress: () =>
                openChat(
                  personId
                ),
            },
          ]
        );
      }
    } catch (error) {
      console.error(
        "❌ User action error:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong. Please try again."
      );
    }
  };

  /**
   * ------------------------------------------------
   * LIKE
   * ------------------------------------------------
   */

  const handleLike = (
    personId: number
  ) => {
    handleUserAction(
      personId,
      "like"
    );
  };

  /**
   * ------------------------------------------------
   * DISLIKE
   * ------------------------------------------------
   */

  const handlePass = (
    personId: number
  ) => {
    handleUserAction(
      personId,
      "dislike"
    );
  };

  /**
   * ------------------------------------------------
   * OPEN PROFILE
   * ------------------------------------------------
   */

  const openProfile = (
    personId: number
  ) => {
    router.push(
      `/profile/${personId}` as any
    );
  };

  /**
   * ------------------------------------------------
   * OPEN CHAT
   * ------------------------------------------------
   */

  const openChat = (
    personId: number
  ) => {
    router.push(
      `/chat/${personId}` as any
    );
  };

  /**
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
   */

  return (
    <ResponsiveScreen>
      <View
        style={styles.screen}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.container
          }
        >
          {/* HEADER */}

          <View
            style={styles.header}
          >
            <Pressable
              style={
                styles.menuButton
              }
            >
              <Ionicons
                name="menu-outline"
                size={24}
                color="#18181B"
              />
            </Pressable>

            <Text
              style={styles.logo}
            >
              LUMORA
            </Text>

            <View
              style={
                styles.headerRight
              }
            >
              <Pressable
                style={
                  styles.headerIcon
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={22}
                  color="#FF3D71"
                />
              </Pressable>

              <Pressable
                style={
                  styles.headerIcon
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#18181B"
                />

                <View
                  style={
                    styles.notificationDot
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* GREETING */}

          <View
            style={styles.greeting}
          >
            <Text
              style={
                styles.greetingText
              }
            >
              {getGreeting()} 👋
            </Text>

            <Text
              style={
                styles.userName
              }
            >
              {userName}
            </Text>

            <Text
              style={styles.subtitle}
            >
              Find someone who feels
              right.
            </Text>
          </View>

          {/* TABS */}

          <View
            style={styles.tabs}
          >
            <TabButton
              title="Nearby"
              active={
                activeTab ===
                "nearby"
              }
              onPress={() =>
                setActiveTab(
                  "nearby"
                )
              }
            />

            <TabButton
              title="New"
              active={
                activeTab ===
                "new"
              }
              onPress={() =>
                setActiveTab(
                  "new"
                )
              }
            />

            <TabButton
              title="For You"
              active={
                activeTab ===
                "foryou"
              }
              onPress={() =>
                setActiveTab(
                  "foryou"
                )
              }
            />
          </View>

          {/* SECTION HEADER */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {activeTab ===
                "nearby"
                  ? "People near you"
                  : activeTab ===
                    "new"
                  ? "New people"
                  : "Picked for you"}
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Discover your next
                connection
              </Text>
            </View>
          </View>

          {/* LOADING */}

          {loading && (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
                color="#FF3D71"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Finding people near
                you...
              </Text>
            </View>
          )}

          {/* EMPTY */}

          {!loading &&
            people.length === 0 && (
              <View
                style={
                  styles.emptyContainer
                }
              >
                <Ionicons
                  name="people-outline"
                  size={60}
                  color="#FF3D71"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No people found
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  We couldn't find
                  anyone near you right
                  now.
                </Text>

                <Pressable
                  style={
                    styles.retryButton
                  }
                  onPress={
                    loadDashboard
                  }
                >
                  <Text
                    style={
                      styles.retryButtonText
                    }
                  >
                    Try Again
                  </Text>
                </Pressable>
              </View>
            )}

          {/* PEOPLE */}

          {!loading &&
            people.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() =>
                  openProfile(
                    item.id
                  )
                }
              >
                {/* IMAGE */}

                <View
                  style={
                    styles.cardImageWrap
                  }
                >
                  {item.image ? (
                    <Image
                      source={{
                        uri:
                          getImageUrl(
                            item.image
                          ) ||
                          undefined,
                      }}
                      style={
                        styles.cardImage
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={
                        styles.cardImagePlaceholder
                      }
                    >
                      <Ionicons
                        name="person"
                        size={70}
                        color="#FF3D71"
                      />
                    </View>
                  )}

                  {/* ONLINE */}

                  {item.online && (
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

                  {/* IMAGE OVERLAY */}

                  <View
                    style={
                      styles.cardOverlay
                    }
                  >
                    <Text
                      style={
                        styles.cardName
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {item.name}
                      {item.age
                        ? `, ${item.age}`
                        : ""}
                    </Text>

                    <View
                      style={
                        styles.cardLocationRow
                      }
                    >
                      <Ionicons
                        name="location"
                        size={13}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.cardLocationText
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {item.distance}{" "}
                        km away
                        {item.city
                          ? ` · ${item.city}`
                          : ""}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* CARD INFO */}

                <View
                  style={
                    styles.cardInfo
                  }
                >
                  {!!item.bio && (
                    <Text
                      style={
                        styles.cardBio
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {item.bio}
                    </Text>
                  )}

                  {(item.occupation ||
                    item.relationship_status) && (
                    <View
                      style={
                        styles.cardTags
                      }
                    >
                      {!!item.occupation && (
                        <View
                          style={
                            styles.tag
                          }
                        >
                          <Ionicons
                            name="briefcase-outline"
                            size={12}
                            color="#FF3D71"
                          />

                          <Text
                            style={
                              styles.tagText
                            }
                          >
                            {
                              item.occupation
                            }
                          </Text>
                        </View>
                      )}

                      {!!item.relationship_status && (
                        <View
                          style={
                            styles.tag
                          }
                        >
                          <Text
                            style={
                              styles.tagText
                            }
                          >
                            {
                              item.relationship_status
                            }
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* MATCH STATUS */}

                  {item.matched && (
                    <View
                      style={
                        styles.matchBadge
                      }
                    >
                      <Ionicons
                        name="heart"
                        size={13}
                        color="#FF3D71"
                      />

                      <Text
                        style={
                          styles.matchText
                        }
                      >
                        Matched ❤️
                      </Text>
                    </View>
                  )}

                  {/* ACTION BUTTONS */}

                  <View
                    style={
                      styles.actionsRow
                    }
                  >
                    {/* DISLIKE */}

                    <Pressable
                      style={[
                        styles.actionBtn,

                        item.my_action ===
                        "dislike"
                          ? styles.dislikedBtn
                          : styles.dislikeBtn,
                      ]}
                      onPress={(
                        event
                      ) => {
                        event.stopPropagation();

                        handlePass(
                          item.id
                        );
                      }}
                      hitSlop={6}
                    >
                      <Ionicons
                        name={
                          item.my_action ===
                          "dislike"
                            ? "close-circle"
                            : "close"
                        }
                        size={18}
                        color={
                          item.my_action ===
                          "dislike"
                            ? "#FFFFFF"
                            : "#71717A"
                        }
                      />

                      <Text
                        style={[
                          styles.dislikeText,

                          item.my_action ===
                          "dislike"
                            ? styles.dislikedText
                            : null,
                        ]}
                      >
                        {item.my_action ===
                        "dislike"
                          ? "Disliked"
                          : "Dislike"}
                      </Text>
                    </Pressable>

                    {/* CHAT */}

                    <Pressable
                      style={[
                        styles.actionBtn,
                        styles.chatBtn,
                      ]}
                      onPress={(
                        event
                      ) => {
                        event.stopPropagation();

                        openChat(
                          item.id
                        );
                      }}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="#FF3D71"
                      />

                      <Text
                        style={
                          styles.chatText
                        }
                      >
                        Chat
                      </Text>
                    </Pressable>

                    {/* LIKE */}

                    <Pressable
                      style={[
                        styles.actionBtn,

                        item.my_action ===
                        "like"
                          ? styles.likedBtn
                          : styles.likeBtn,
                      ]}
                      onPress={(
                        event
                      ) => {
                        event.stopPropagation();

                        handleLike(
                          item.id
                        );
                      }}
                      hitSlop={6}
                    >
                      <Ionicons
                        name={
                          item.my_action ===
                          "like"
                            ? "heart"
                            : "heart-outline"
                        }
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.likeText
                        }
                      >
                        {item.my_action ===
                        "like"
                          ? "Liked"
                          : "Like"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}

          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>

        {/* BOTTOM NAVIGATION */}

        <View
          style={
            styles.bottomNav
          }
        >
          <BottomButton
            icon="heart-outline"
            active={false}
            label="Likes"
            onPress={() =>
              router.push(
                "/" as any
              )
            }
          />

          <BottomButton
            icon="location-outline"
            active={true}
            label="Nearby"
            onPress={() =>
              setActiveTab(
                "nearby"
              )
            }
          />

          <BottomButton
            icon="chatbubble-outline"
            active={false}
            label="Chat"
            onPress={() =>
              router.push(
                "/" as any
              )
            }
          />

          <BottomButton
            icon="person-outline"
            active={false}
            label="Profile"
            onPress={() =>
              router.push(
                "/" as any
              )
            }
          />
        </View>
      </View>
    </ResponsiveScreen>
  );
}

/**
 * ============================================================
 * TAB BUTTON
 * ============================================================
 */

function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active &&
          styles.tabActive,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active &&
            styles.tabTextActive,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/**
 * ============================================================
 * BOTTOM BUTTON
 * ============================================================
 */

function BottomButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={
        styles.bottomButton
      }
      onPress={onPress}
    >
      <View
        style={[
          styles.bottomIcon,
          active &&
            styles.bottomIconActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            active
              ? "#FF3D71"
              : "#71717A"
          }
        />
      </View>

      <Text
        style={[
          styles.bottomLabel,
          active &&
            styles.bottomLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#FFF6F8",
    },

    container: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 100,
    },

    /* HEADER */

    header: {
      height: 48,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    menuButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#FFE6ED",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    logo: {
      fontSize: 19,
      fontWeight: "900",
      color: "#FF3D71",
      letterSpacing: 2,
    },

    headerRight: {
      flexDirection:
        "row",
      gap: 8,
    },

    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#FFE6ED",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    notificationDot: {
      position:
        "absolute",
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#FF3D71",
      top: 9,
      right: 9,
    },

    /* GREETING */

    greeting: {
      marginTop: 28,
    },

    greetingText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#71717A",
    },

    userName: {
      marginTop: 2,
      fontSize: 28,
      fontWeight: "900",
      color: "#18181B",
    },

    subtitle: {
      marginTop: 5,
      fontSize: 14,
      color: "#71717A",
    },

    /* TABS */

    tabs: {
      flexDirection:
        "row",
      marginTop: 26,
      gap: 9,
    },

    tab: {
      paddingHorizontal: 17,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#FFE6ED",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    tabActive: {
      backgroundColor:
        "#FF3D71",
      borderColor:
        "#FF3D71",
    },

    tabText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#71717A",
    },

    tabTextActive: {
      color: "#FFFFFF",
    },

    /* SECTION */

    sectionHeader: {
      marginTop: 27,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: "#18181B",
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color: "#A1A1AA",
    },

    /* LOADING */

    loadingContainer: {
      marginTop: 30,
      minHeight: 350,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: "#71717A",
    },

    /* EMPTY */

    emptyContainer: {
      marginTop: 30,
      minHeight: 350,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#FFE6ED",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    emptyTitle: {
      marginTop: 15,
      fontSize: 20,
      fontWeight: "900",
      color: "#18181B",
    },

    emptyText: {
      marginTop: 7,
      textAlign:
        "center",
      fontSize: 13,
      color: "#71717A",
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 25,
      paddingVertical: 11,
      borderRadius: 20,
      backgroundColor:
        "#FF3D71",
    },

    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },

    /* CARD */

    card: {
      marginTop: 18,
      borderRadius: 26,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#FFE6ED",
      overflow: "hidden",
      shadowColor:
        "#18181B",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 2,
    },

    cardImageWrap: {
      height: 420,
      backgroundColor:
        "#FFF6F8",
      position:
        "relative",
    },

    cardImage: {
      width: "100%",
      height: "100%",
    },

    cardImagePlaceholder: {
      width: "100%",
      height: "100%",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    /* ONLINE */

    onlineBadge: {
      position:
        "absolute",
      top: 16,
      left: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#22C55E",
    },

    onlineText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#18181B",
    },

    /* IMAGE OVERLAY */

    cardOverlay: {
      position:
        "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 18,
      paddingTop: 44,
      backgroundColor:
        "rgba(24,24,27,0.35)",
    },

    cardName: {
      fontSize: 24,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    cardLocationRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 4,
      gap: 4,
    },

    cardLocationText: {
      fontSize: 12,
      color: "#FFFFFF",
    },

    /* CARD INFO */

    cardInfo: {
      padding: 18,
    },

    cardBio: {
      fontSize: 13,
      lineHeight: 18,
      color: "#52525B",
    },

    cardTags: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 7,
      marginTop: 12,
    },

    tag: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor:
        "#FFF6F8",
    },

    tagText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#FF3D71",
    },

    /* MATCH */

    matchBadge: {
      alignSelf:
        "flex-start",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      marginTop: 12,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor:
        "#FFF0F4",
    },

    matchText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#FF3D71",
    },

    /* ACTIONS */

    actionsRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginTop: 16,
    },

    actionBtn: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
      height: 46,
      borderRadius: 23,
    },

    /* DISLIKE */

    dislikeBtn: {
      backgroundColor:
        "#F7F7F8",
      borderWidth: 1,
      borderColor:
        "#E4E4E7",
    },

    dislikedBtn: {
      backgroundColor:
        "#71717A",
      borderWidth: 1,
      borderColor:
        "#71717A",
    },

    dislikeText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#71717A",
    },

    dislikedText: {
      color: "#FFFFFF",
    },

    /* CHAT */

    chatBtn: {
      backgroundColor:
        "#FFF6F8",
      borderWidth: 1,
      borderColor:
        "#FFE6ED",
    },

    chatText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#FF3D71",
    },

    /* LIKE */

    likeBtn: {
      backgroundColor:
        "#FF3D71",
      shadowColor:
        "#FF3D71",
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },

    likedBtn: {
      backgroundColor:
        "#E91E63",
      borderWidth: 1,
      borderColor:
        "#E91E63",
    },

    likeText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    bottomSpace: {
      height: 20,
    },

    /* BOTTOM NAV */

    bottomNav: {
      position:
        "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 78,
      backgroundColor:
        "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor:
        "#FFE6ED",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-around",
      paddingHorizontal: 10,
    },

    bottomButton: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    bottomIcon: {
      width: 35,
      height: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    bottomIconActive: {
      backgroundColor:
        "#FFF6F8",
      borderRadius: 15,
    },

    bottomLabel: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: "700",
      color: "#71717A",
    },

    bottomLabelActive: {
      color: "#FF3D71",
    },
  });
