import { Request, Response } from "express";
import { pool } from "../config/database";

/**
 * ============================================================
 * GET LOGGED-IN USER ID FROM JWT
 * ============================================================
 */
const getUserId = (req: Request): number => {
  return Number((req as any).user?.userId);
};

/**
 * ============================================================
 * GET CONVERSATION
 *
 * Always stores smaller user ID as user_one_id
 * and larger user ID as user_two_id.
 * ============================================================
 */
const getConversation = async (
  userId1: number,
  userId2: number
) => {
  const userOneId = Math.min(userId1, userId2);
  const userTwoId = Math.max(userId1, userId2);

  const [rows] = await pool.query(
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
    [userOneId, userTwoId]
  );

  return (rows as any[])[0] || null;
};

/**
 * ============================================================
 * CHECK LIKE
 * ============================================================
 */
const checkLike = async (
  currentUserId: number,
  targetUserId: number
): Promise<boolean> => {
  const [rows] = await pool.query(
    `
    SELECT id
    FROM user_actions
    WHERE
      from_user_id = ?
      AND to_user_id = ?
      AND action = 'like'
    LIMIT 1
    `,
    [currentUserId, targetUserId]
  );

  return (rows as any[]).length > 0;
};

/**
 * ============================================================
 * FORMAT CHAT TIME
 * ============================================================
 */
const formatChatTime = (
  dateValue: any
): string => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const diffMs =
    now.getTime() - date.getTime();

  const diffMinutes = Math.floor(
    diffMs / (1000 * 60)
  );

  if (diffMinutes < 1) {
    return "Now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(
    diffMinutes / 60
  );

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(
    diffHours / 24
  );

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return date.toLocaleDateString();
};

/**
 * ============================================================
 * GET CHAT LIST
 *
 * GET /api/chat/list
 *
 * Authentication:
 * Authorization: Bearer <JWT>
 *
 * User ID comes from JWT.
 * ============================================================
 */
export const getChatList = async (
  req: Request,
  res: Response
) => {
  try {
    /**
     * --------------------------------------------------------
     * CURRENT USER
     * --------------------------------------------------------
     */
    const currentUserId = getUserId(req);

    if (
      !currentUserId ||
      Number.isNaN(currentUserId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /**
     * --------------------------------------------------------
     * GET ACTIVE MATCHES
     * --------------------------------------------------------
     */
    const [matches] = await pool.query(
      `
      SELECT
        id,
        user_one_id,
        user_two_id,
        status,
        created_at
      FROM user_matches
      WHERE
        status = 'active'
        AND (
          user_one_id = ?
          OR user_two_id = ?
        )
      ORDER BY created_at DESC
      `,
      [
        currentUserId,
        currentUserId,
      ]
    );

    const matchRows = matches as any[];

    const chatList: any[] = [];

    /**
     * --------------------------------------------------------
     * PROCESS MATCHES
     * --------------------------------------------------------
     */
    for (const match of matchRows) {
      const matchedUserId =
        Number(match.user_one_id) ===
        currentUserId
          ? Number(match.user_two_id)
          : Number(match.user_one_id);

      if (!matchedUserId) {
        continue;
      }

      /**
       * ------------------------------------------------------
       * PROFILE
       * ------------------------------------------------------
       */
      const [profiles] =
        await pool.query(
          `
          SELECT
            user_id,
            first_name,
            last_name,
            date_of_birth,
            status
          FROM user_profiles
          WHERE user_id = ?
          LIMIT 1
          `,
          [matchedUserId]
        );

      const profileRows =
        profiles as any[];

      if (profileRows.length === 0) {
        continue;
      }

      const profile =
        profileRows[0];

      /**
       * ------------------------------------------------------
       * USER ACCOUNT
       * ------------------------------------------------------
       */
      const [users] =
        await pool.query(
          `
          SELECT
            id,
            account_status
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [matchedUserId]
        );

      const userRows =
        users as any[];

      if (userRows.length === 0) {
        continue;
      }

      /**
       * ------------------------------------------------------
       * SKIP INACTIVE USERS
       * ------------------------------------------------------
       */
      if (
        userRows[0].account_status &&
        userRows[0].account_status !==
          "active"
      ) {
        continue;
      }

      /**
       * ------------------------------------------------------
       * PROFILE PHOTO
       * ------------------------------------------------------
       */
      const [photos] =
        await pool.query(
          `
          SELECT
            id,
            user_id,
            photo_url,
            is_primary,
            photo_order
          FROM user_photos
          WHERE
            user_id = ?
            AND status = 'active'
          ORDER BY
            is_primary DESC,
            photo_order ASC,
            id ASC
          LIMIT 1
          `,
          [matchedUserId]
        );

      const photoRows =
        photos as any[];

      let image = "";

      if (photoRows.length > 0) {
        image =
          photoRows[0].photo_url ||
          "";
      }

      /**
       * ------------------------------------------------------
       * NORMALIZE IMAGE URL
       * ------------------------------------------------------
       */
      if (
        image &&
        !image.startsWith("http://") &&
        !image.startsWith("https://")
      ) {
        const host = req.get("host");

        image = `${req.protocol}://${host}/${image.replace(
          /^\/+/,
          ""
        )}`;
      }

      /**
       * ------------------------------------------------------
       * AGE
       * ------------------------------------------------------
       */
      let age = 0;

      if (profile.date_of_birth) {
        const dob = new Date(
          profile.date_of_birth
        );

        const today = new Date();

        age =
          today.getFullYear() -
          dob.getFullYear();

        const monthDifference =
          today.getMonth() -
          dob.getMonth();

        if (
          monthDifference < 0 ||
          (
            monthDifference === 0 &&
            today.getDate() <
              dob.getDate()
          )
        ) {
          age--;
        }
      }

      /**
       * ------------------------------------------------------
       * CONVERSATION
       * ------------------------------------------------------
       */
      const conversation =
        await getConversation(
          currentUserId,
          matchedUserId
        );

      let lastMessage =
        "Start a conversation";

      let messageTime = "";

      let unread = 0;

      let conversationId:
        | number
        | null = null;

      /**
       * ------------------------------------------------------
       * CONVERSATION EXISTS
       * ------------------------------------------------------
       */
      if (conversation) {
        /**
         * Blocked / closed
         */
        if (
          conversation.status ===
            "blocked" ||
          conversation.status ===
            "closed"
        ) {
          continue;
        }

        conversationId =
          Number(conversation.id);

        /**
         * Latest message
         */
        const [latestMessages] =
          await pool.query(
            `
            SELECT
              id,
              message,
              message_type,
              created_at
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY
              created_at DESC,
              id DESC
            LIMIT 1
            `,
            [conversationId]
          );

        const latestRows =
          latestMessages as any[];

        if (latestRows.length > 0) {
          lastMessage =
            latestRows[0].message ||
            "Start a conversation";

          messageTime =
            formatChatTime(
              latestRows[0].created_at
            );
        }

        /**
         * Unread messages
         */
        const [unreadRows] =
          await pool.query(
            `
            SELECT
              COUNT(*) AS unread
            FROM chat_messages
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

        unread = Number(
          (unreadRows as any[])[0]
            ?.unread || 0
        );
      }

      /**
       * ------------------------------------------------------
       * ONLINE STATUS
       *
       * Currently false because your DB does not have
       * online-status implementation.
       * ------------------------------------------------------
       */
      const online = false;

      /**
       * ------------------------------------------------------
       * NAME
       * ------------------------------------------------------
       */
      const firstName =
        profile.first_name || "";

      const lastName =
        profile.last_name || "";

      const fullName =
        `${firstName} ${lastName}`.trim();

      /**
       * ------------------------------------------------------
       * RESPONSE OBJECT
       * ------------------------------------------------------
       */
      chatList.push({
        id: matchedUserId,

        name:
          fullName ||
          `User ${matchedUserId}`,

        age,

        image,

        lastMessage,

        time: messageTime,

        unread,

        online,

        matched: true,

        conversationId,
      });
    }

    /**
     * --------------------------------------------------------
     * TOTAL UNREAD
     * --------------------------------------------------------
     */
    const totalUnread =
      chatList.reduce(
        (total, chat) =>
          total +
          Number(chat.unread || 0),
        0
      );

    /**
     * --------------------------------------------------------
     * RESPONSE
     * --------------------------------------------------------
     */
    return res.status(200).json({
      success: true,
      data: chatList,
      total: chatList.length,
      totalUnread,
    });
  } catch (error) {
    console.error(
      "❌ Get chat list error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load chat list",
    });
  }
};

/**
 * ============================================================
 * GET CHAT MESSAGES
 *
 * GET /api/chat/messages/:userId
 *
 * :userId = target user
 * JWT = logged-in user
 * ============================================================
 */
export const getChatMessages = async (
  req: Request,
  res: Response
) => {
  try {
    /**
     * --------------------------------------------------------
     * CURRENT USER
     * --------------------------------------------------------
     */
    const currentUserId = getUserId(req);

    /**
     * --------------------------------------------------------
     * TARGET USER
     * --------------------------------------------------------
     */
    const targetUserId =
      Number(req.params.userId);

    if (
      !currentUserId ||
      Number.isNaN(currentUserId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !targetUserId ||
      Number.isNaN(targetUserId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Target user ID is required",
      });
    }

    if (
      currentUserId === targetUserId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot chat with yourself",
      });
    }

    /**
     * --------------------------------------------------------
     * GET CONVERSATION
     * --------------------------------------------------------
     */
    const conversation =
      await getConversation(
        currentUserId,
        targetUserId
      );

    /**
     * --------------------------------------------------------
     * NO CONVERSATION
     * --------------------------------------------------------
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

      return res.status(200).json({
        success: true,
        conversation_id: null,
        conversation: null,
        messages: [],
      });
    }

    /**
     * --------------------------------------------------------
     * BLOCKED
     * --------------------------------------------------------
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

    /**
     * --------------------------------------------------------
     * CLOSED
     * --------------------------------------------------------
     */
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

    /**
     * --------------------------------------------------------
     * GET MESSAGES
     * --------------------------------------------------------
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
        WHERE conversation_id = ?
        ORDER BY
          created_at ASC,
          id ASC
        `,
        [conversation.id]
      );

    /**
     * --------------------------------------------------------
     * MARK RECEIVED MESSAGES AS READ
     * --------------------------------------------------------
     */
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
        conversation.id,
        currentUserId,
      ]
    );

    /**
     * --------------------------------------------------------
     * RESPONSE
     * --------------------------------------------------------
     */
    return res.status(200).json({
      success: true,

      conversation_id:
        conversation.id,

      conversation: {
        id: conversation.id,

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



