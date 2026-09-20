import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  message_type: "text" | "image";
  is_read: number;
  created_at: string;
};

type TargetUser = {
  id: number;
  name: string;
  age?: number;
  image?: string | null;
  online?: number | boolean;
};

export default function ChatScreen() {
  const { userId } =
    useLocalSearchParams<{
      userId: string;
    }>();

  const targetUserId =
    Number(userId);

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [targetUser, setTargetUser] =
    useState<TargetUser | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [connected, setConnected] =
    useState(false);

  const [typing, setTyping] =
    useState(false);

  const socketRef =
    useRef<WebSocket | null>(null);

  const typingTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /**
   * -----------------------------------------
   * INITIALIZE CHAT
   * -----------------------------------------
   */

  useEffect(() => {
    if (
      !targetUserId ||
      Number.isNaN(targetUserId)
    ) {
      Alert.alert(
        "Chat",
        "Invalid user."
      );

      router.back();

      return;
    }

    initializeChat();

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(
          typingTimerRef.current
        );
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [targetUserId]);

  /**
   * -----------------------------------------
   * INITIALIZE
   * -----------------------------------------
   */

  const initializeChat = async () => {
    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const storedUser =
        await AsyncStorage.getItem(
          "user"
        );

      if (!token || !storedUser) {
        Alert.alert(
          "Login Required",
          "Please login again."
        );

        router.replace(
          "/login" as any
        );

        return;
      }

      const user =
        JSON.parse(storedUser);

      const loggedInUserId =
        Number(user.id);

      setCurrentUserId(
        loggedInUserId
      );

      /**
       * Load target user profile
       */
      await loadTargetUser(token);

      /**
       * Load old messages
       */
      await loadMessages(token);

      /**
       * Connect WebSocket
       */
      connectWebSocket(token);
    } catch (error) {
      console.error(
        "❌ Chat initialization error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * -----------------------------------------
   * LOAD TARGET USER
   * -----------------------------------------
   */

  const loadTargetUser = async (
    token: string
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/users/${targetUserId}`,
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

      const data =
        await response.json();

      console.log(
        "👤 Target user:",
        data
      );

      if (
        response.ok &&
        data.success &&
        data.user
      ) {
        const user =
          data.user;

        let image =
          user.image || null;

        /**
         * Convert localhost image URL
         * to phone-accessible API URL.
         */
        if (
          image &&
          API_URL &&
          image.includes(
            "localhost"
          )
        ) {
          image =
            image.replace(
              /https?:\/\/localhost:\d+/,
              API_URL
            );
        }

        setTargetUser({
          ...user,
          image,
        });
      } else {
        console.log(
          "Target user error:",
          data?.message
        );
      }
    } catch (error) {
      console.error(
        "❌ Load target user error:",
        error
      );
    }
  };

  /**
   * -----------------------------------------
   * LOAD CHAT HISTORY
   * -----------------------------------------
   */

  const loadMessages = async (
    token: string
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/chat/messages/${targetUserId}`,
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

      const data =
        await response.json();

      console.log(
        "📨 Chat history:",
        data
      );

      if (
        response.ok &&
        data.success
      ) {
        setMessages(
          data.messages || []
        );
      } else {
        console.log(
          "Chat history:",
          data?.message
        );
      }
    } catch (error) {
      console.error(
        "❌ Load messages error:",
        error
      );
    }
  };

  /**
   * -----------------------------------------
   * ADD MESSAGE WITHOUT DUPLICATES
   * -----------------------------------------
   */

  const addMessage = (
    newMessage: Message
  ) => {
    setMessages(
      (currentMessages) => {
        const alreadyExists =
          currentMessages.some(
            (item) =>
              Number(item.id) ===
              Number(newMessage.id)
          );

        if (alreadyExists) {
          return currentMessages;
        }

        return [
          ...currentMessages,
          newMessage,
        ];
      }
    );
  };

  /**
   * -----------------------------------------
   * WEBSOCKET
   * -----------------------------------------
   */

  const connectWebSocket = (
    token: string
  ) => {
    try {
      const wsBaseUrl =
        API_URL
          ?.replace(
            "http://",
            "ws://"
          )
          .replace(
            "https://",
            "wss://"
          );

      if (!wsBaseUrl) {
        console.error(
          "❌ EXPO_PUBLIC_API_URL is missing"
        );

        return;
      }

      const socket =
        new WebSocket(
          `${wsBaseUrl}/chat?token=${encodeURIComponent(
            token
          )}`
        );

      socketRef.current =
        socket;

      /**
       * CONNECTED
       */
      socket.onopen = () => {
        console.log(
          "🟢 Chat WebSocket connected"
        );

        setConnected(true);
      };

      /**
       * MESSAGE RECEIVED
       */
      socket.onmessage = (
        event
      ) => {
        try {
          const data =
            JSON.parse(
              event.data
            );

          console.log(
            "📩 WebSocket message:",
            data
          );

          /**
           * CONNECTION
           */
          if (
            data.type ===
            "connected"
          ) {
            setConnected(true);
          }

          /**
           * MESSAGE SENT
           */
          if (
            data.type ===
            "message_sent"
          ) {
            const newMessage =
              data.data;

            if (newMessage) {
              addMessage(
                newMessage
              );
            }
          }

          /**
           * NEW MESSAGE
           */
          if (
            data.type ===
            "new_message"
          ) {
            const newMessage =
              data.data;

            if (
              newMessage &&
              Number(
                newMessage.sender_id
              ) === targetUserId
            ) {
              addMessage(
                newMessage
              );

              if (
                newMessage.conversation_id
              ) {
                markMessagesRead(
                  newMessage.conversation_id
                );
              }
            }
          }

          /**
           * TYPING
           */
          if (
            data.type ===
            "typing"
          ) {
            if (
              Number(
                data.user_id
              ) === targetUserId
            ) {
              setTyping(
                Boolean(
                  data.is_typing
                )
              );
            }
          }

          /**
           * ERROR
           */
          if (
            data.type ===
            "error"
          ) {
            console.error(
              "❌ Chat error:",
              data.message
            );

            Alert.alert(
              "Chat",
              data.message ||
                "Something went wrong."
            );
          }
        } catch (error) {
          console.error(
            "❌ WebSocket JSON error:",
            error
          );
        }
      };

      /**
       * ERROR
       */
      socket.onerror = (
        error
      ) => {
        console.error(
          "🔴 WebSocket error:",
          error
        );

        setConnected(false);
      };

      /**
       * CLOSED
       */
      socket.onclose = () => {
        console.log(
          "🔴 Chat WebSocket disconnected"
        );

        setConnected(false);
      };
    } catch (error) {
      console.error(
        "❌ WebSocket connection error:",
        error
      );
    }
  };

  /**
   * -----------------------------------------
   * SEND MESSAGE
   * -----------------------------------------
   */

  const sendMessage = () => {
    const text =
      message.trim();

    if (!text) {
      return;
    }

    if (
      !socketRef.current ||
      socketRef.current.readyState !==
        WebSocket.OPEN
    ) {
      Alert.alert(
        "Chat",
        "Chat is not connected yet."
      );

      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "send_message",
        receiver_id:
          targetUserId,
        message: text,
      })
    );

    setMessage("");

    sendTyping(false);
  };

  /**
   * -----------------------------------------
   * TYPING
   * -----------------------------------------
   */

  const handleTyping = (
    text: string
  ) => {
    setMessage(text);

    sendTyping(
      text.length > 0
    );

    if (
      typingTimerRef.current
    ) {
      clearTimeout(
        typingTimerRef.current
      );
    }

    typingTimerRef.current =
      setTimeout(() => {
        sendTyping(false);
      }, 1000);
  };

  const sendTyping = (
    isTyping: boolean
  ) => {
    if (
      !socketRef.current ||
      socketRef.current.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        receiver_id:
          targetUserId,
        is_typing:
          isTyping,
      })
    );
  };

  /**
   * -----------------------------------------
   * MARK READ
   * -----------------------------------------
   */

  const markMessagesRead = (
    conversationId: number
  ) => {
    if (
      !socketRef.current ||
      socketRef.current.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "mark_read",
        conversation_id:
          conversationId,
      })
    );
  };

  /**
   * -----------------------------------------
   * MESSAGE ITEM
   * -----------------------------------------
   */

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => {
    const isMine =
      Number(item.sender_id) ===
      currentUserId;

    const messageTime =
      new Date(
        item.created_at
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    return (
      <View
        style={[
          styles.messageRow,
          isMine
            ? styles.myMessageRow
            : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.myMessageBubble
              : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine
                ? styles.myMessageText
                : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>

          <View
            style={
              styles.messageBottom
            }
          >
            <Text
              style={[
                styles.messageTime,
                isMine
                  ? styles.myMessageTime
                  : styles.otherMessageTime,
              ]}
            >
              {messageTime}
            </Text>

            {isMine && (
              <Ionicons
                name={
                  item.is_read
                    ? "checkmark-done"
                    : "checkmark"
                }
                size={14}
                color={
                  item.is_read
                    ? "#FFFFFF"
                    : "#FFD1DD"
                }
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  /**
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
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
          Opening chat...
        </Text>
      </View>
    );
  }

  /**
   * -----------------------------------------
   * TARGET USER DETAILS
   * -----------------------------------------
   */

  const targetName =
    targetUser?.name ||
    `User ${targetUserId}`;

  const targetOnline =
    Boolean(
      targetUser?.online
    );

  /**
   * -----------------------------------------
   * SCREEN
   * -----------------------------------------
   */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? 0
          : 20
      }
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#18181B"
          />
        </Pressable>

        <View
          style={
            styles.headerUser
          }
        >
          <View
            style={
              styles.headerAvatar
            }
          >
            {targetUser?.image ? (
              <Image
                source={{
                  uri: targetUser.image,
                }}
                style={
                  styles.headerAvatarImage
                }
              />
            ) : (
              <Ionicons
                name="person"
                size={20}
                color="#FF3D71"
              />
            )}
          </View>

          <View
            style={
              styles.headerUserInfo
            }
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={
                styles.headerTitle
              }
            >
              {targetName}
            </Text>

            <View
              style={
                styles.connectionRow
              }
            >
              <View
                style={[
                  styles.connectionDot,
                  {
                    backgroundColor:
                      targetOnline
                        ? "#22C55E"
                        : "#A1A1AA",
                  },
                ]}
              />

              <Text
                style={
                  styles.connectionText
                }
              >
                {targetOnline
                  ? "Online"
                  : "Offline"}
              </Text>
            </View>
          </View>
        </View>

        {/* CALL BUTTONS */}

        <View
          style={
            styles.headerActions
          }
        >
          <Pressable
            style={
              styles.headerAction
            }
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Audio calling will be added with WebRTC."
              )
            }
          >
            <Ionicons
              name="call-outline"
              size={20}
              color="#FF3D71"
            />
          </Pressable>

          <Pressable
            style={
              styles.headerAction
            }
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Video calling will be added with WebRTC."
              )
            }
          >
            <Ionicons
              name="videocam-outline"
              size={20}
              color="#FF3D71"
            />
          </Pressable>
        </View>
      </View>

      {/* TYPING */}

      {typing && (
        <View
          style={
            styles.typingContainer
          }
        >
          <Text
            style={
              styles.typingText
            }
          >
            {targetName} is typing...
          </Text>
        </View>
      )}

      {/* MESSAGES */}

      <FlatList
        data={messages}
        keyExtractor={(item, index) =>
          `${item.id}-${index}`
        }
        renderItem={
          renderMessage
        }
        contentContainerStyle={
          styles.messagesContainer
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        removeClippedSubviews={false}
        ListEmptyComponent={
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
                name="chatbubble-ellipses"
                size={30}
                color="#FF3D71"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Start a conversation
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Send your first message
              and say hello 👋
            </Text>
          </View>
        }
      />

      {/* MESSAGE INPUT */}

      <View
        style={
          styles.inputContainer
        }
      >
        <TextInput
          value={message}
          onChangeText={
            handleTyping
          }
          placeholder="Type a message..."
          placeholderTextColor="#A1A1AA"
          multiline
          maxLength={1000}
          textAlignVertical="center"
          style={
            styles.messageInput
          }
        />

        <Pressable
          style={[
            styles.sendButton,
            !message.trim() &&
              styles.sendButtonDisabled,
          ]}
          onPress={
            sendMessage
          }
          disabled={
            !message.trim()
          }
        >
          <Ionicons
            name="send"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * -----------------------------------------
 * STYLES
 * -----------------------------------------
 */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFF7F9",
    },

    loadingContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF7F9",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: "#71717A",
    },

    /**
     * HEADER
     */

    header: {
      minHeight: 72,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F1F2",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerUser: {
      flex: 1,
      minWidth: 0,
      flexDirection:
        "row",
      alignItems:
        "center",
      marginLeft: 2,
      marginRight: 5,
    },

    headerAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FFF0F4",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 9,
      overflow: "hidden",
    },

    headerAvatarImage: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },

    headerUserInfo: {
      flex: 1,
      minWidth: 0,
    },

    headerTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#18181B",
    },

    connectionRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 3,
    },

    connectionDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 5,
    },

    connectionText: {
      fontSize: 11,
      color: "#71717A",
    },

    headerActions: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flexShrink: 0,
    },

    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "#FFF5F7",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 4,
    },

    /**
     * TYPING
     */

    typingContainer: {
      minHeight: 30,
      paddingHorizontal: 18,
      paddingVertical: 7,
      backgroundColor:
        "#FFF7F9",
    },

    typingText: {
      fontSize: 11,
      color: "#71717A",
      fontStyle:
        "italic",
    },

    /**
     * MESSAGES
     */

    messagesContainer: {
      flexGrow: 1,
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 20,
    },

    messageRow: {
      width: "100%",
      marginBottom: 10,
    },

    myMessageRow: {
      alignItems:
        "flex-end",
    },

    otherMessageRow: {
      alignItems:
        "flex-start",
    },

    messageBubble: {
      maxWidth: "78%",
      minWidth: 45,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },

    myMessageBubble: {
      backgroundColor:
        "#FF3D71",
      borderBottomRightRadius: 5,
    },

    otherMessageBubble: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#F0E8EA",
      borderBottomLeftRadius: 5,
    },

    messageText: {
      fontSize: 14,
      lineHeight: 20,
      flexShrink: 1,
    },

    myMessageText: {
      color: "#FFFFFF",
    },

    otherMessageText: {
      color: "#18181B",
    },

    messageBottom: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "flex-end",
      marginTop: 4,
      gap: 3,
    },

    messageTime: {
      fontSize: 9,
    },

    myMessageTime: {
      color: "#FFD1DD",
    },

    otherMessageTime: {
      color: "#A1A1AA",
    },

    /**
     * EMPTY CHAT
     */

    emptyContainer: {
      flexGrow: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical: 80,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor:
        "#FFF0F4",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 15,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#18181B",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 13,
      color: "#71717A",
      textAlign: "center",
    },

    /**
     * INPUT
     */

    inputContainer: {
      paddingHorizontal: 12,
      paddingTop: 9,
      paddingBottom:
        Platform.OS === "ios"
          ? 24
          : 10,
      backgroundColor:
        "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor:
        "#F1F1F2",
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      flexShrink: 0,
    },

    messageInput: {
      flex: 1,
      minHeight: 46,
      maxHeight: 110,
      backgroundColor:
        "#F7F7F8",
      borderRadius: 23,
      paddingHorizontal: 17,
      paddingVertical: 12,
      fontSize: 14,
      color: "#18181B",
      textAlignVertical:
        "center",
    },

    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#FF3D71",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 8,
      flexShrink: 0,
    },

    sendButtonDisabled: {
      opacity: 0.4,
    },
  });
