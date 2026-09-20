import {
  Request,
  Response,
} from "express";

import {
  pool,
} from "../config/database";

/*
|--------------------------------------------------------------------------
| Get logged-in user ID
|--------------------------------------------------------------------------
*/

const getUserId = (
  req: Request
): number => {
  return Number(
    (req as any).user.userId
  );
};

/*
|--------------------------------------------------------------------------
| Get existing conversation
|--------------------------------------------------------------------------
*/

const getConversation = async (
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

  return (
    rows as any[]
  )[0] || null;
};

/*
|--------------------------------------------------------------------------
| Check Like
|--------------------------------------------------------------------------
|
| This is ONLY required when starting
| a NEW conversation.
|
| Example:
|
| 45 -> 41 = like
|
| Therefore:
|
| 45 can start chat with 41.
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
      SELECT
        id
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
    (rows as any[])
      .length > 0
  );
};

/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| GET /api/chat/messages/:userId
|
|--------------------------------------------------------------------------
|
| CHAT RULE:
|
| 1. If conversation DOES NOT exist:
|
|    Current user must have liked
|    the target user.
|
| 2. If conversation ALREADY exists:
|
|    No Like is required.
|
|    Both users can open the chat.
|
|--------------------------------------------------------------------------
*/

export const getChatMessages =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Current user
      |--------------------------------------------------------------------------
      */

      const currentUserId =
        getUserId(req);

      /*
      |--------------------------------------------------------------------------
      | Target user
      |--------------------------------------------------------------------------
      */

      const targetUserId =
        Number(
          req.params.userId
        );

      /*
      |--------------------------------------------------------------------------
      | Authentication
      |--------------------------------------------------------------------------
      */

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Validate target user
      |--------------------------------------------------------------------------
      */

      if (
        !targetUserId ||
        Number.isNaN(
          targetUserId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Target user ID is required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent self chat
      |--------------------------------------------------------------------------
      */

      if (
        currentUserId ===
        targetUserId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot chat with yourself",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIRST:
      | Get existing conversation
      |--------------------------------------------------------------------------
      */

      const conversation =
        await getConversation(
          currentUserId,
          targetUserId
        );

      /*
      |--------------------------------------------------------------------------
      | NO CONVERSATION
      |--------------------------------------------------------------------------
      |
      | User is trying to start a new chat.
      |
      | Therefore current user must have
      | liked the target user.
      |
      */

      if (!conversation) {
        const liked =
          await checkLike(
            currentUserId,
            targetUserId
          );

        if (!liked) {
          return res.status(403).json({
            success: false,
            message:
              "You need to like this user before starting a chat.",
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Do not create conversation here.
        |--------------------------------------------------------------------------
        |
        | Conversation will be created when
        | the first message is sent.
        |
        */

        return res.status(200).json({
          success: true,

          conversation_id:
            null,

          conversation:
            null,

          messages: [],
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CONVERSATION EXISTS
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | No Like check here.
      |
      | Both users can access the chat.
      |
      */

      if (
        conversation.status ===
        "blocked"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This conversation is blocked.",
        });
      }

      if (
        conversation.status ===
        "closed"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This conversation is closed.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Get messages
      |--------------------------------------------------------------------------
      */

      const [messages] =
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
          WHERE
            conversation_id = ?
          ORDER BY
            created_at ASC,
            id ASC
          `,
          [
            conversation.id,
          ]
        );

      /*
      |--------------------------------------------------------------------------
      | Mark received messages as read
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        UPDATE chat_messages
        SET
          is_read = 1
        WHERE
          conversation_id = ?
          AND receiver_id = ?
          AND is_read = 0
        `,
        [
          conversation.id,
          currentUserId,
        ]
      );

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        conversation_id:
          conversation.id,

        conversation: {
          id:
            conversation.id,

          user_one_id:
            conversation.user_one_id,

          user_two_id:
            conversation.user_two_id,

          status:
            conversation.status,
        },

        messages,
      });
    } catch (error) {
      console.error(
        "❌ Get chat messages error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load chat messages",
      });
    }
  };
