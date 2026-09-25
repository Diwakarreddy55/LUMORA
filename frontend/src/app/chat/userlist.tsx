import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ResponsiveScreen from "../../components/ResponsiveScreen";

type ChatUser = {
  id: number;
  name: string;
  age: number;
  image: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  matched: boolean;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.8:5000";

export default function ChatUserListScreen() {
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<"all" | "unread">("all");

  const [chats, setChats] = useState<ChatUser[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /**
   * ============================================================
   * GET CURRENT USER ID
   * ============================================================
   */
  const getCurrentUserId = async (): Promise<number | null> => {
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");

      if (!storedUserId) {
        return null;
      }

      const userId = Number(storedUserId);

      if (!Number.isFinite(userId) || userId <= 0) {
        return null;
      }

      return userId;
    } catch (error) {
      console.error("Error reading user_id:", error);
      return null;
    }
  };

  /**
   * ============================================================
   * NORMALIZE IMAGE URL
   * ============================================================
   */
  const getImageUrl = (image?: string | null): string => {
    if (!image) {
      return "https://via.placeholder.com/300x300.png?text=User";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  /**
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */
  const formatMessageTime = (dateValue?: string | null): string => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference = now.getTime() - date.getTime();

    const minutes = Math.floor(difference / (1000 * 60));

    if (minutes < 1) {
      return "now";
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days}d`;
    }

    return date.toLocaleDateString();
  };

  /**
   * ============================================================
   * FETCH CHAT LIST
   *
   * Expected backend response:
   *
   * {
   *   success: true,
   *   data: [...]
   * }
   *
   * or
   *
   * {
   *   chats: [...]
   * }
   * ============================================================
   */
  const fetchChats = async (
  showLoader = true
) => {
  try {
    if (showLoader) {
      setLoading(true);
    }

    /**
     * Get JWT
     */
    const token =
      await AsyncStorage.getItem("token");

    if (!token) {
      console.warn(
        "❌ JWT token not found"
      );

      setChats([]);
      return;
    }

    /**
     * Call authenticated API
     */
    const response = await fetch(
      `${API_BASE_URL}/api/chat/list`,
      {
        method: "GET",

        headers: {
          Accept: "application/json",

          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const responseText =
      await response.text();

    let result: any = {};

    try {
      result = responseText
        ? JSON.parse(responseText)
        : {};
    } catch (error) {
      console.error(
        "❌ Invalid JSON:",
        responseText
      );

      return;
    }

    /**
     * API error
     */
    if (!response.ok) {
      console.error(
        "❌ Chat API error:",
        response.status,
        result
      );

      if (
        response.status === 401
      ) {
        console.warn(
          "JWT expired or invalid"
        );
      }

      setChats([]);
      return;
    }

    /**
     * API success
     */
    if (
      result.success !== true
    ) {
      console.error(
        "❌ Chat API failed:",
        result
      );

      setChats([]);
      return;
    }

    /**
     * Get data
     */
    const apiChats =
      Array.isArray(result.data)
        ? result.data
        : [];

    /**
     * Convert API response
     * to frontend model
     */
    const formattedChats: ChatUser[] =
      apiChats.map(
        (item: any) => ({
          id: Number(item.id),

          name:
            item.name ||
            "User",

          age:
            Number(item.age) || 0,

          image:
            getImageUrl(
              item.image
            ),

          lastMessage:
            item.lastMessage ||
            "Start a conversation",

          time:
            item.time || "",

          unread:
            Number(item.unread) || 0,

          online:
            Boolean(item.online),

          matched:
            Boolean(item.matched),
        })
      );

    /**
     * Remove invalid users
     */
    const validChats =
      formattedChats.filter(
        (chat) =>
          chat.id > 0
      );

    setChats(validChats);
  } catch (error) {
    console.error(
      "❌ fetchChats error:",
      error
    );

    setChats([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  /**
   * ============================================================
   * LOAD WHEN SCREEN OPENS
   * ============================================================
   */
  useFocusEffect(
    useCallback(() => {
      fetchChats(true);
    }, [])
  );

  /**
   * ============================================================
   * PULL TO REFRESH
   * ============================================================
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchChats(false);
  };

  /**
   * ============================================================
   * FILTER USERS
   * ============================================================
   */
  const filteredChats = useMemo(() => {
    let filtered = [...chats];

    /**
     * SEARCH
     */
    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchValue)
      );
    }

    /**
     * UNREAD
     */
    if (activeFilter === "unread") {
      filtered = filtered.filter(
        (user) => user.unread > 0
      );
    }

    return filtered;
  }, [chats, search, activeFilter]);

  /**
   * ============================================================
   * OPEN CHAT
   * ============================================================
   */
  const openChat = (userId: number) => {
    router.push(`/chat/${userId}` as any);
  };

  /**
   * ============================================================
   * TOTAL UNREAD
   * ============================================================
   */
  const totalUnread = useMemo(() => {
    return chats.reduce(
      (total, user) => total + user.unread,
      0
    );
  }, [chats]);

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#18181B"
              />
            </Pressable>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                Chats
              </Text>

              {totalUnread > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {totalUnread}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              style={styles.newChatButton}
              onPress={() =>
                router.push("/Search" as any)
              }
            >
              <Ionicons
                name="create-outline"
                size={22}
                color="#FF3D71"
              />
            </Pressable>
          </View>

          {/* SUBTITLE */}
          <Text style={styles.subtitle}>
            Your conversations and matches
          </Text>

          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#A1A1AA"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search chats..."
              placeholderTextColor="#A1A1AA"
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color="#A1A1AA"
                />
              </Pressable>
            )}
          </View>

          {/* FILTERS */}
          <View style={styles.filterRow}>
            <Pressable
              style={[
                styles.filterButton,
                activeFilter === "all" &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "all" &&
                    styles.filterTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterButton,
                activeFilter === "unread" &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setActiveFilter("unread")
              }
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "unread" &&
                    styles.filterTextActive,
                ]}
              >
                Unread
              </Text>

              {totalUnread > 0 && (
                <View style={styles.filterBadge}>
                  <Text
                    style={styles.filterBadgeText}
                  >
                    {totalUnread}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* SECTION HEADER */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Messages
              </Text>

              <Text style={styles.sectionSubtitle}>
                {filteredChats.length}{" "}
                {filteredChats.length === 1
                  ? "conversation"
                  : "conversations"}
              </Text>
            </View>
          </View>

          {/* LOADING */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#FF3D71"
              />

              <Text style={styles.loadingText}>
                Loading conversations...
              </Text>
            </View>
          ) : filteredChats.length > 0 ? (
            /* CHAT LIST */
            <View style={styles.chatList}>
              {filteredChats.map((user, index) => (
                <Pressable
                  key={`${user.id}-${index}`}
                  style={[
                    styles.chatItem,
                    index ===
                      filteredChats.length - 1 &&
                      styles.lastChatItem,
                  ]}
                  onPress={() => openChat(user.id)}
                >
                  {/* AVATAR */}
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{
                        uri: user.image,
                      }}
                      style={styles.avatar}
                    />

                    {user.online && (
                      <View
                        style={styles.onlineDot}
                      />
                    )}
                  </View>

                  {/* MESSAGE CONTENT */}
                  <View
                    style={styles.messageContent}
                  >
                    <View style={styles.nameRow}>
                      <Text
                        style={styles.userName}
                        numberOfLines={1}
                      >
                        {user.name}
                        {user.age > 0
                          ? `, ${user.age}`
                          : ""}
                      </Text>

                      <Text
                        style={styles.timeText}
                      >
                        {user.time}
                      </Text>
                    </View>

                    <View style={styles.previewRow}>
                      <Text
                        style={[
                          styles.lastMessage,
                          user.unread > 0 &&
                            styles.unreadMessage,
                        ]}
                        numberOfLines={1}
                      >
                        {user.lastMessage}
                      </Text>

                      {user.unread > 0 && (
                        <View
                          style={
                            styles.unreadBadge
                          }
                        >
                          <Text
                            style={
                              styles.unreadBadgeText
                            }
                          >
                            {user.unread}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* ARROW */}
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#D4D4D8"
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            /* EMPTY */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={38}
                  color="#FF3D71"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No conversations
              </Text>

              <Text style={styles.emptyText}>
                {activeFilter === "unread"
                  ? "You don't have any unread messages."
                  : search
                  ? "No chats found for your search."
                  : "Start connecting with people and your conversations will appear here."}
              </Text>

              {search.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setSearch("")}
                >
                  <Text
                    style={styles.clearButtonText}
                  >
                    Clear Search
                  </Text>
                </Pressable>
              )}

              {!search &&
                activeFilter === "all" && (
                  <Pressable
                    style={styles.startChatButton}
                    onPress={() =>
                      router.push(
                        "/Search" as any
                      )
                    }
                  >
                    <Ionicons
                      name="search"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.startChatButtonText
                      }
                    >
                      Find People
                    </Text>
                  </Pressable>
                )}
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* FLOATING BUTTON */}
        <Pressable
          style={styles.floatingButton}
          onPress={() =>
            router.push("/Search" as any)
          }
        >
          <Ionicons
            name="add"
            size={27}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </ResponsiveScreen>
  );
}

/**
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8FA",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 110,
  },

  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E4E9",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#18181B",
  },

  headerBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: "#FF3D71",
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E4E9",
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 13,
    color: "#71717A",
  },

  searchBox: {
    marginTop: 20,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E4E9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 9,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontWeight: "600",
    color: "#18181B",
  },

  filterRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },

  filterButton: {
    height: 36,
    paddingHorizontal: 17,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E4E9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  filterButtonActive: {
    backgroundColor: "#FF3D71",
    borderColor: "#FF3D71",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#71717A",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  filterBadge: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#FFF0F4",
    alignItems: "center",
    justifyContent: "center",
  },

  filterBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FF3D71",
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
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

  loadingContainer: {
    marginTop: 10,
    minHeight: 300,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E4E9",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#71717A",
    fontWeight: "600",
  },

  chatList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#F4E4E9",
    overflow: "hidden",
  },

  chatItem: {
    minHeight: 82,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F5",
  },

  lastChatItem: {
    borderBottomWidth: 0,
  },

  avatarWrapper: {
    width: 56,
    height: 56,
    position: "relative",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0F4",
  },

  onlineDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  messageContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#18181B",
    marginRight: 8,
  },

  timeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#A1A1AA",
  },

  previewRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  lastMessage: {
    flex: 1,
    fontSize: 12,
    color: "#71717A",
  },

  unreadMessage: {
    fontWeight: "800",
    color: "#3F3F46",
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#FF3D71",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  unreadBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  emptyContainer: {
    marginTop: 10,
    minHeight: 360,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E4E9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
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

  clearButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FF3D71",
  },

  clearButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  startChatButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#FF3D71",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  startChatButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF3D71",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF3D71",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  bottomSpace: {
    height: 30,
  },
});