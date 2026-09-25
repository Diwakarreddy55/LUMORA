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

import SideMenu from "../../components/SideMenu";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/* ============================================================
   TYPES
============================================================ */

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

  my_action?: "like" | "dislike" | null;

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

/* ============================================================
   HOME SCREEN
============================================================ */

export default function HomeScreen() {
  const [people, setPeople] = useState<Person[]>([]);

  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState("User");

  const [currentHour, setCurrentHour] = useState(
    new Date().getHours()
  );

  const [menuVisible, setMenuVisible] = useState(false);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  const loadDashboard = async () => {
    await Promise.all([
      loadCurrentUser(),
      fetchDashboardUsers(),
    ]);
  };

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
        setUserName("User");
        return;
      }

      const user: LoggedInUser = JSON.parse(userData);

      setUserName(user.name || "User");
    } catch (error) {
      console.error(
        "Failed to load current user:",
        error
      );

      setUserName("User");
    }
  };

  /* ==========================================================
     GREETING
  ========================================================== */

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

  /* ==========================================================
     IMAGE URL
  ========================================================== */

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

  /* ==========================================================
     FETCH DASHBOARD USERS
  ========================================================== */

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
        await AsyncStorage.getItem("token");

      if (!token) {
        console.log(
          "No authentication token found"
        );

        setPeople([]);

        return;
      }

      /* ------------------------------------------------------
         DASHBOARD API
      ------------------------------------------------------ */

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

      const dashboardUsers: Person[] =
        dashboardData.users || [];

      /* ------------------------------------------------------
         USER ACTIONS
      ------------------------------------------------------ */

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

        if (
          actionsResponse.ok &&
          actionsData.success
        ) {
          actions =
            actionsData.actions || [];
        }
      } catch (error) {
        console.error(
          "Actions API error:",
          error
        );
      }

      /* ------------------------------------------------------
         ACTION MAP
      ------------------------------------------------------ */

      const actionMap =
        new Map<number, UserAction>();

      actions.forEach((action) => {
        actionMap.set(
          Number(action.to_user_id),
          action
        );
      });

      /* ------------------------------------------------------
         MERGE USERS + ACTIONS
      ------------------------------------------------------ */

      const usersWithActions =
        dashboardUsers.map((person) => {
          const action =
            actionMap.get(
              Number(person.id)
            );

          return {
            ...person,

            my_action:
              action?.action || null,

            matched:
              action?.matched || false,
          };
        });

      setPeople(usersWithActions);
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

  /* ==========================================================
     LIKE / DISLIKE
  ========================================================== */

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
        await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login again."
        );

        return;
      }

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

      const matched =
        data.data?.matched === true;

      /* ------------------------------------------------------
         UPDATE UI
      ------------------------------------------------------ */

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

      /* ------------------------------------------------------
         MATCH
      ------------------------------------------------------ */

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
                openChat(personId),
            },
          ]
        );
      }
    } catch (error) {
      console.error(
        "User action error:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong. Please try again."
      );
    }
  };

  /* ==========================================================
     LIKE
  ========================================================== */

  const handleLike = (
    personId: number
  ) => {
    handleUserAction(
      personId,
      "like"
    );
  };

  /* ==========================================================
     DISLIKE
  ========================================================== */

  const handlePass = (
    personId: number
  ) => {
    handleUserAction(
      personId,
      "dislike"
    );
  };

  /* ==========================================================
     OPEN PROFILE
  ========================================================== */

  const openProfile = (
    personId: number
  ) => {
    router.push(
      `/profile/${personId}` as any
    );
  };

  /* ==========================================================
     OPEN CHAT
  ========================================================== */

  const openChat = (
    personId: number
  ) => {
    router.push(
      `/chat/${personId}` as any
    );
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const openSearch = () => {
    router.push("/Search" as any);
  };

  /* ==========================================================
     CHATS
  ========================================================== */

  const openChats = () => {
    router.push("/chat/userlist" as any);
  };

  /* ==========================================================
     PROFILE
  ========================================================== */

  const openMyProfile = () => {
    router.push("/profile" as any);
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.container
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>

            {/* HAMBURGER */}

            <Pressable
              style={styles.menuButton}
              onPress={() =>
                setMenuVisible(true)
              }
            >
              <Ionicons
                name="menu-outline"
                size={25}
                color="#18181B"
              />
            </Pressable>

            {/* LOGO */}

            <Text style={styles.logo}>
              LUMORA
            </Text>

            {/* HEADER RIGHT */}

            <View
              style={
                styles.headerRight
              }
            >

              <Pressable
                style={
                  styles.headerIcon
                }
                onPress={() =>
                  router.push(
                    "/likes" as any
                  )
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
                onPress={() =>
                  router.push(
                    "/notifications" as any
                  )
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

          {/* ==================================================
              GREETING
          ================================================== */}

          <View style={styles.greeting}>

            <Text
              style={
                styles.greetingText
              }
            >
              {getGreeting()} 👋
            </Text>

            <Text
              style={styles.userName}
              numberOfLines={1}
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

          {/* ==================================================
              DISCOVER HEADER
          ================================================== */}

          <View
            style={
              styles.discoverHeader
            }
          >

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Discover people
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                People who may be a good
                connection for you
              </Text>
            </View>

            <Pressable
              style={
                styles.filterButton
              }
              onPress={openSearch}
            >
              <Ionicons
                name="options-outline"
                size={19}
                color="#FF3D71"
              />
            </Pressable>

          </View>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <View
              style={
                styles.loadingContainer
              }
            >
              <View
                style={
                  styles.loadingCircle
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#FF3D71"
                />
              </View>

              <Text
                style={
                  styles.loadingTitle
                }
              >
                Finding people
              </Text>

              <Text
                style={
                  styles.loadingText
                }
              >
                Looking for people
                near you...
              </Text>
            </View>
          )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading &&
            people.length === 0 && (
              <View
                style={
                  styles.emptyContainer
                }
              >

                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={40}
                    color="#FF3D71"
                  />
                </View>

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
                  anyone near you
                  right now.
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

          {/* ==================================================
              PEOPLE
          ================================================== */}

          {!loading &&
            people.map((item) => (

              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() =>
                  openProfile(item.id)
                }
              >

                {/* ==================================================
                    IMAGE
                ================================================== */}

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
                        size={65}
                        color="#FF3D71"
                      />
                    </View>
                  )}

                  {/* IMAGE GRADIENT-LIKE OVERLAY */}

                  <View
                    style={
                      styles.imageBottomOverlay
                    }
                  />

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

                  {/* PHOTO COUNT */}

                  {item.images &&
                    item.images.length >
                    1 && (
                      <View
                        style={
                          styles.photoCount
                        }
                      >
                        <Ionicons
                          name="images-outline"
                          size={13}
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.photoCountText
                          }
                        >
                          {
                            item.images.length
                          }
                        </Text>
                      </View>
                    )}

                  {/* IMAGE INFO */}

                  <View
                    style={
                      styles.imageInfo
                    }
                  >

                    <Text
                      style={
                        styles.cardName
                      }
                      numberOfLines={1}
                    >
                      {item.name}
                      {item.age
                        ? `, ${item.age}`
                        : ""}
                    </Text>

                    <View
                      style={
                        styles.locationRow
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.locationText
                        }
                        numberOfLines={1}
                      >
                        {item.distance} km
                        away
                        {item.city
                          ? ` · ${item.city}`
                          : ""}
                      </Text>
                    </View>

                  </View>
                </View>

                {/* ==================================================
                    CARD INFO
                ================================================== */}

                <View
                  style={
                    styles.cardInfo
                  }
                >

                  {/* BIO */}

                  {!!item.bio && (
                    <Text
                      style={
                        styles.cardBio
                      }
                      numberOfLines={2}
                    >
                      {item.bio}
                    </Text>
                  )}

                  {/* TAGS */}

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
                              size={13}
                              color="#FF3D71"
                            />

                            <Text
                              style={
                                styles.tagText
                              }
                              numberOfLines={1}
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
                            <Ionicons
                              name="heart-outline"
                              size={13}
                              color="#FF3D71"
                            />

                            <Text
                              style={
                                styles.tagText
                              }
                              numberOfLines={1}
                            >
                              {
                                item.relationship_status
                              }
                            </Text>
                          </View>
                        )}

                      </View>
                    )}

                  {/* MATCH */}

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
                        Matched
                      </Text>
                    </View>
                  )}

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <View
                    style={
                      styles.actionsRow
                    }
                  >

                    {/* DISLIKE */}

                    <Pressable
                      style={[
                        styles.actionButton,
                        item.my_action ===
                          "dislike"
                          ? styles.dislikedButton
                          : styles.dislikeButton,
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();

                        handlePass(
                          item.id
                        );
                      }}
                    >
                      <Ionicons
                        name={
                          item.my_action ===
                            "dislike"
                            ? "close-circle"
                            : "close-outline"
                        }
                        size={19}
                        color={
                          item.my_action ===
                            "dislike"
                            ? "#FFFFFF"
                            : "#52525B"
                        }
                      />

                      <Text
                        style={
                          item.my_action === "dislike"
                            ? styles.whiteActionText
                            : styles.darkActionText
                        }
                      >
                        {item.my_action ===
                          "dislike"
                          ? "Passed"
                          : "Pass"}
                      </Text>
                    </Pressable>

                    {/* CHAT */}

                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.chatButton,
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();

                        openChat(
                          item.id
                        );
                      }}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="#FF3D71"
                      />

                      <Text
                        style={
                          styles.chatActionText
                        }
                      >
                        Chat
                      </Text>
                    </Pressable>

                    {/* LIKE */}

                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.likeButton,
                        item.my_action ===
                          "like"
                          ? styles.likedButton
                          : null,
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();

                        handleLike(
                          item.id
                        );
                      }}
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
                          styles.likeActionText
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

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <View
          style={
            styles.bottomNav
          }
        >

          {/* HOME */}

          <BottomButton
            icon="home"
            label="Home"
            active={true}
            onPress={() =>
              router.replace(
                "/dashboard" as any
              )
            }
          />

          {/* SEARCH */}

          <BottomButton
            icon="search-outline"
            label="Search"
            active={false}
            onPress={openSearch}
          />

          {/* CHAT */}

          <BottomButton
            icon="chatbubble-outline"
            label="Chat"
            active={false}
            onPress={openChats}
          />

          {/* PROFILE */}

          <BottomButton
            icon="person-outline"
            label="Profile"
            active={false}
            onPress={
              openMyProfile
            }
          />

        </View>

        {/* ==================================================
            SIDE MENU
        ================================================== */}

        <SideMenu
          visible={menuVisible}
          onClose={() =>
            setMenuVisible(false)
          }
        />

      </View>
    </ResponsiveScreen>
  );
}

/* ============================================================
   BOTTOM BUTTON
============================================================ */

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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,
      backgroundColor: "#FFF8FA",
    },

    container: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 110,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      height: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#F4E4E9",
      alignItems: "center",
      justifyContent: "center",
    },

    logo: {
      fontSize: 19,
      fontWeight: "900",
      color: "#FF3D71",
      letterSpacing: 2,
    },

    headerRight: {
      flexDirection: "row",
      gap: 8,
    },

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#F4E4E9",
      alignItems: "center",
      justifyContent: "center",
    },

    notificationDot: {
      position: "absolute",
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#FF3D71",
      top: 9,
      right: 9,
    },

    /* ========================================================
       GREETING
    ======================================================== */

    greeting: {
      marginTop: 25,
    },

    greetingText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#71717A",
    },

    userName: {
      marginTop: 3,
      fontSize: 28,
      fontWeight: "900",
      color: "#18181B",
    },

    subtitle: {
      marginTop: 5,
      fontSize: 14,
      color: "#71717A",
    },

    /* ========================================================
       DISCOVER
    ======================================================== */

    discoverHeader: {
      marginTop: 26,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "900",
      color: "#18181B",
    },

    sectionSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: "#A1A1AA",
    },

    filterButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#F4E4E9",
      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 400,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: "#FFF0F4",
      alignItems: "center",
      justifyContent: "center",
    },

    loadingTitle: {
      marginTop: 15,
      fontSize: 17,
      fontWeight: "800",
      color: "#18181B",
    },

    loadingText: {
      marginTop: 5,
      fontSize: 12,
      color: "#A1A1AA",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      marginTop: 25,
      minHeight: 360,
      borderRadius: 25,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#F4E4E9",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: "#FFF0F4",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      marginTop: 18,
      fontSize: 20,
      fontWeight: "900",
      color: "#18181B",
    },

    emptyText: {
      marginTop: 7,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      color: "#71717A",
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 25,
      paddingVertical: 11,
      borderRadius: 22,
      backgroundColor: "#FF3D71",
    },

    retryButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop: 18,
      borderRadius: 25,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#F4E4E9",
      overflow: "hidden",

      shadowColor: "#18181B",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 2,
    },

    /* ========================================================
       CARD IMAGE
    ======================================================== */

    cardImageWrap: {
      height: 405,
      backgroundColor: "#FFF0F4",
      position: "relative",
    },

    cardImage: {
      width: "100%",
      height: "100%",
    },

    cardImagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF0F4",
    },

    imageBottomOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 150,
      backgroundColor:
        "rgba(0,0,0,0.28)",
    },

    /* ========================================================
       ONLINE
    ======================================================== */

    onlineBadge: {
      position: "absolute",
      top: 15,
      left: 15,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 18,
      backgroundColor:
        "rgba(255,255,255,0.96)",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#22C55E",
    },

    onlineText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#18181B",
    },

    /* ========================================================
       PHOTO COUNT
    ======================================================== */

    photoCount: {
      position: "absolute",
      top: 15,
      right: 15,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor:
        "rgba(24,24,27,0.55)",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    photoCountText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    /* ========================================================
       IMAGE INFO
    ======================================================== */

    imageInfo: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 17,
    },

    cardName: {
      fontSize: 25,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    locationRow: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    locationText: {
      flex: 1,
      fontSize: 12,
      color: "#FFFFFF",
    },

    /* ========================================================
       CARD INFO
    ======================================================== */

    cardInfo: {
      padding: 17,
    },

    cardBio: {
      fontSize: 13,
      lineHeight: 19,
      color: "#52525B",
    },

    cardTags: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },

    tag: {
      maxWidth: "100%",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: "#FFF5F7",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    tagText: {
      maxWidth: 150,
      fontSize: 11,
      fontWeight: "700",
      color: "#FF3D71",
    },

    /* ========================================================
       MATCH
    ======================================================== */

    matchBadge: {
      alignSelf: "flex-start",
      marginTop: 11,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: "#FFF0F4",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    matchText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#FF3D71",
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actionsRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    actionButton: {
      flex: 1,
      height: 45,
      borderRadius: 23,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    /* PASS */

    dislikeButton: {
      backgroundColor: "#F7F7F8",
      borderWidth: 1,
      borderColor: "#E4E4E7",
    },

    dislikedButton: {
      backgroundColor: "#71717A",
      borderWidth: 1,
      borderColor: "#71717A",
    },

    darkActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#52525B",
    },

    whiteActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    /* CHAT */

    chatButton: {
      backgroundColor: "#FFF5F7",
      borderWidth: 1,
      borderColor: "#FFE1E9",
    },

    chatActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#FF3D71",
    },

    /* LIKE */

    likeButton: {
      backgroundColor: "#FF3D71",

      shadowColor: "#FF3D71",
      shadowOpacity: 0.22,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    likedButton: {
      backgroundColor: "#E91E63",
    },

    likeActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    /* ========================================================
       BOTTOM NAV
    ======================================================== */

    bottomSpace: {
      height: 25,
    },

    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 76,

      backgroundColor: "#FFFFFF",

      borderTopWidth: 1,
      borderTopColor: "#F1E4E8",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",

      paddingHorizontal: 8,

      shadowColor: "#18181B",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: -3,
      },

      elevation: 10,
    },

    bottomButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    bottomIcon: {
      width: 38,
      height: 31,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    bottomIconActive: {
      backgroundColor: "#FFF0F4",
    },

    bottomLabel: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: "700",
      color: "#71717A",
    },

    bottomLabelActive: {
      color: "#FF3D71",
    },
  });
