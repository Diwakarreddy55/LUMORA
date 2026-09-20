import http from "http";
import {
  WebSocketServer,
  WebSocket,
} from "ws";
import jwt from "jsonwebtoken";

import { pool } from "./config/database";

type AuthenticatedSocket =
  WebSocket & {
    userId?: number;
  };

/*
|--------------------------------------------------------------------------
| Connected users
|--------------------------------------------------------------------------
*/

const connectedUsers =
  new Map<
    number,
    Set<AuthenticatedSocket>
  >();

/*
|--------------------------------------------------------------------------
| Get user from JWT
|--------------------------------------------------------------------------
*/

const getUserFromToken = (
  token: string
): number | null => {
  try {
    const decoded: any =
      jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );

    return Number(
      decoded.userId
    );
  } catch (error) {
    console.error(
      "❌ JWT verification failed:",
      error
    );

    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Add connected user
|--------------------------------------------------------------------------
*/

const addConnectedUser = (
  userId: number,
  socket: AuthenticatedSocket
) => {
  if (
    !connectedUsers.has(
      userId
    )
  ) {
    connectedUsers.set(
      userId,
      new Set()
    );
  }

  connectedUsers
    .get(userId)!
    .add(socket);
};

/*
|--------------------------------------------------------------------------
| Remove connected user
|--------------------------------------------------------------------------
*/

const removeConnectedUser = (
  userId: number,
  socket: AuthenticatedSocket
) => {
  const sockets =
    connectedUsers.get(
      userId
    );

  if (!sockets) {
    return;
  }

  sockets.delete(socket);

  if (sockets.size === 0) {
    connectedUsers.delete(
      userId
    );
  }
};

/*
|--------------------------------------------------------------------------
| Send message to user
|--------------------------------------------------------------------------
*/

const sendToUser = (
  userId: number,
  data: any
) => {
  const sockets =
    connectedUsers.get(
      userId
    );

  if (!sockets) {
    return;
  }

  const payload =
    JSON.stringify(data);

  sockets.forEach(
    socket => {
      if (
        socket.readyState ===
        WebSocket.OPEN
      ) {
        socket.send(
          payload
        );
      }
    }
  );
};

/*
|--------------------------------------------------------------------------
| Check Like
|--------------------------------------------------------------------------
|
| FINAL RULE:
|
| Logged-in user must have liked
| the target user.
|
| Example:
|
| 45 -> 41 = like
|
| Chat allowed.
|
| user_matches is NOT checked.
|
|--------------------------------------------------------------------------
*/

const checkLike = async (
  currentUserId: number,
  targetUserId: number
): Promise<boolean> => {
  const [rows] =
    await pool.query(
      `
      SELECT id
      FROM user_actions
      WHERE
        from_user_id = ?
        AND to_user_id = ?
        AND action = 'like'
      LIMIT 1
      `,
      [
        currentUserId,
        targetUserId,
      ]
    );

  return (
    (rows as any[]).length > 0
  );
};

/*
|--------------------------------------------------------------------------
| Get / Create Conversation
|--------------------------------------------------------------------------
*/

const getOrCreateConversation =
  async (
    userId1: number,
    userId2: number
  ) => {
    const userOneId =
      Math.min(
        userId1,
        userId2
      );

    const userTwoId =
      Math.max(
        userId1,
        userId2
      );

    /*
    |--------------------------------------------------------------------------
    | Existing conversation
    |--------------------------------------------------------------------------
    */

    const [rows] =
      await pool.query(
        `
        SELECT
          id,
          user_one_id,
          user_two_id,
          status,
          created_at,
          updated_at
        FROM chat_conversations
        WHERE
          user_one_id = ?
          AND user_two_id = ?
        LIMIT 1
        `,
        [
          userOneId,
          userTwoId,
        ]
      );

    if (
      (rows as any[])
        .length > 0
    ) {
      return (
        rows as any[]
      )[0];
    }

    /*
    |--------------------------------------------------------------------------
    | Create conversation
    |--------------------------------------------------------------------------
    */

    const [
      result,
    ]: any =
      await pool.query(
        `
        INSERT INTO chat_conversations
        (
          user_one_id,
          user_two_id,
          status
        )
        VALUES (?, ?, 'active')
        `,
        [
          userOneId,
          userTwoId,
        ]
      );

    /*
    |--------------------------------------------------------------------------
    | Get new conversation
    |--------------------------------------------------------------------------
    */

    const [
      newRows,
    ] =
      await pool.query(
        `
        SELECT
          id,
          user_one_id,
          user_two_id,
          status,
          created_at,
          updated_at
        FROM chat_conversations
        WHERE id = ?
        LIMIT 1
        `,
        [
          result.insertId,
        ]
      );

    return (
      newRows as any[]
    )[0];
  };

/*
|--------------------------------------------------------------------------
| Initialize WebSocket
|--------------------------------------------------------------------------
*/

export const initializeChatSocket =
  (
    server: http.Server
  ) => {
    const wss =
      new WebSocketServer({
        server,
        path: "/chat",
      });

    console.log(
      "💬 WebSocket chat server initialized"
    );

    wss.on(
      "connection",
      (
        socket: AuthenticatedSocket,
        request
      ) => {
        try {
          /*
          |--------------------------------------------------------------------------
          | Get token
          |--------------------------------------------------------------------------
          */

          const url =
            new URL(
              request.url || "",
              "http://localhost"
            );

          const token =
            url.searchParams.get(
              "token"
            );

          if (!token) {
            socket.send(
              JSON.stringify({
                type: "error",
                message:
                  "Authentication token is required",
              })
            );

            socket.close();

            return;
          }

          /*
          |--------------------------------------------------------------------------
          | Verify token
          |--------------------------------------------------------------------------
          */

          const userId =
            getUserFromToken(
              token
            );

          if (!userId) {
            socket.send(
              JSON.stringify({
                type: "error",
                message:
                  "Invalid authentication token",
              })
            );

            socket.close();

            return;
          }

          socket.userId =
            userId;

          /*
          |--------------------------------------------------------------------------
          | Store connection
          |--------------------------------------------------------------------------
          */

          addConnectedUser(
            userId,
            socket
          );

          console.log(
            `🟢 Chat user connected: ${userId}`
          );

          /*
          |--------------------------------------------------------------------------
          | Connected response
          |--------------------------------------------------------------------------
          */

          socket.send(
            JSON.stringify({
              type: "connected",
              message:
                "Chat connected successfully",
              user_id: userId,
            })
          );

          /*
          |--------------------------------------------------------------------------
          | WebSocket messages
          |--------------------------------------------------------------------------
          */

          socket.on(
            "message",
            async rawMessage => {
              try {
                const data =
                  JSON.parse(
                    rawMessage.toString()
                  );

                /*
                |--------------------------------------------------------------------------
                | SEND MESSAGE
                |--------------------------------------------------------------------------
                */

                if (
                  data.type ===
                  "send_message"
                ) {
                  const senderId =
                    Number(
                      socket.userId
                    );

                  const receiverId =
                    Number(
                      data.receiver_id
                    );

                  const message =
                    String(
                      data.message ||
                        ""
                    ).trim();

                  /*
                  |--------------------------------------------------------------------------
                  | Validation
                  |--------------------------------------------------------------------------
                  */

                  if (
                    !receiverId
                  ) {
                    socket.send(
                      JSON.stringify({
                        type: "error",
                        message:
                          "Receiver ID is required",
                      })
                    );

                    return;
                  }

                  if (!message) {
                    socket.send(
                      JSON.stringify({
                        type: "error",
                        message:
                          "Message cannot be empty",
                      })
                    );

                    return;
                  }

                  if (
                    senderId ===
                    receiverId
                  ) {
                    socket.send(
                      JSON.stringify({
                        type: "error",
                        message:
                          "You cannot message yourself",
                      })
                    );

                    return;
                  }

                  /*
                  |--------------------------------------------------------------------------
                  | Check Like
                  |--------------------------------------------------------------------------
                  */

                  const liked =
                    await checkLike(
                      senderId,
                      receiverId
                    );

                  if (!liked) {
                    socket.send(
                      JSON.stringify({
                        type: "error",
                        message:
                          "You need to like this user before chatting.",
                      })
                    );

                    return;
                  }

                  /*
                  |--------------------------------------------------------------------------
                  | Conversation
                  |--------------------------------------------------------------------------
                  */

                  const conversation =
                    await getOrCreateConversation(
                      senderId,
                      receiverId
                    );

                  /*
                  |--------------------------------------------------------------------------
                  | Save message
                  |--------------------------------------------------------------------------
                  */

                  const [
                    result,
                  ]: any =
                    await pool.query(
                      `
                      INSERT INTO chat_messages
                      (
                        conversation_id,
                        sender_id,
                        receiver_id,
                        message,
                        message_type,
                        is_read
                      )
                      VALUES
                      (?, ?, ?, ?, 'text', 0)
                      `,
                      [
                        conversation.id,
                        senderId,
                        receiverId,
                        message,
                      ]
                    );

                  /*
                  |--------------------------------------------------------------------------
                  | Get saved message
                  |--------------------------------------------------------------------------
                  */

                  const [
                    rows,
                  ] =
                    await pool.query(
                      `
                      SELECT
                        id,
                        conversation_id,
                        sender_id,
                        receiver_id,
                        message,
                        message_type,
                        is_read,
                        created_at
                      FROM chat_messages
                      WHERE id = ?
                      LIMIT 1
                      `,
                      [
                        result.insertId,
                      ]
                    );

                  const newMessage =
                    (
                      rows as any[]
                    )[0];

                  /*
                  |--------------------------------------------------------------------------
                  | Send to sender
                  |--------------------------------------------------------------------------
                  */

                  sendToUser(
                    senderId,
                    {
                      type:
                        "message_sent",
                      data:
                        newMessage,
                    }
                  );

                  /*
                  |--------------------------------------------------------------------------
                  | Send to receiver
                  |--------------------------------------------------------------------------
                  */

                  sendToUser(
                    receiverId,
                    {
                      type:
                        "new_message",
                      data:
                        newMessage,
                    }
                  );

                  console.log(
                    `💬 Message ${senderId} -> ${receiverId}`
                  );
                }

                /*
                |--------------------------------------------------------------------------
                | TYPING
                |--------------------------------------------------------------------------
                */

                if (
                  data.type ===
                  "typing"
                ) {
                  const senderId =
                    Number(
                      socket.userId
                    );

                  const receiverId =
                    Number(
                      data.receiver_id
                    );

                  if (
                    !receiverId
                  ) {
                    return;
                  }

                  sendToUser(
                    receiverId,
                    {
                      type:
                        "typing",
                      user_id:
                        senderId,
                      is_typing:
                        Boolean(
                          data.is_typing
                        ),
                    }
                  );
                }

                /*
                |--------------------------------------------------------------------------
                | MARK READ
                |--------------------------------------------------------------------------
                */

                if (
                  data.type ===
                  "mark_read"
                ) {
                  const currentUserId =
                    Number(
                      socket.userId
                    );

                  const conversationId =
                    Number(
                      data.conversation_id
                    );

                  if (
                    !conversationId
                  ) {
                    return;
                  }

                  await pool.query(
                    `
                    UPDATE chat_messages
                    SET is_read = 1
                    WHERE
                      conversation_id = ?
                      AND receiver_id = ?
                      AND is_read = 0
                    `,
                    [
                      conversationId,
                      currentUserId,
                    ]
                  );

                  console.log(
                    `✓ Messages marked read: conversation ${conversationId}`
                  );
                }
              } catch (error) {
                console.error(
                  "❌ WebSocket message error:",
                  error
                );

                socket.send(
                  JSON.stringify({
                    type: "error",
                    message:
                      "Failed to process message",
                  })
                );
              }
            }
          );

          /*
          |--------------------------------------------------------------------------
          | CLOSE
          |--------------------------------------------------------------------------
          */

          socket.on(
            "close",
            () => {
              if (
                socket.userId
              ) {
                removeConnectedUser(
                  socket.userId,
                  socket
                );

                console.log(
                  `🔴 Chat user disconnected: ${socket.userId}`
                );
              }
            }
          );

          /*
          |--------------------------------------------------------------------------
          | ERROR
          |--------------------------------------------------------------------------
          */

          socket.on(
            "error",
            error => {
              console.error(
                "🔴 WebSocket error:",
                error
              );
            }
          );
        } catch (error) {
          console.error(
            "❌ WebSocket connection error:",
            error
          );

          socket.close();
        }
      }
    );
  };