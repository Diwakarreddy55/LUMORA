import { Request, Response } from "express";
import db from "../config/database";

const getCurrentUserId = (req: Request): number => {
  return Number((req as any).user.userId);
};

/**
 * Create a new call
 *
 * POST /api/calls
 *
 * Body:
 * {
 *   "receiver_id": 47,
 *   "call_type": "audio"
 * }
 */
export const createCall = async (
  req: Request,
  res: Response
) => {
  try {
    const callerId = getCurrentUserId(req);

    const receiverId = Number(
      req.body.receiver_id
    );

    const callType = req.body.call_type;

    if (!callerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "receiver_id is required",
      });
    }

    if (callerId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot call yourself",
      });
    }

    if (!["audio", "video"].includes(callType)) {
      return res.status(400).json({
        success: false,
        message:
          "call_type must be audio or video",
      });
    }

    /*
     * Call is allowed only when a chat
     * conversation already exists.
     *
     * This follows your current chat rule:
     * Like starts the conversation.
     */
    const userOneId = Math.min(
      callerId,
      receiverId
    );

    const userTwoId = Math.max(
      callerId,
      receiverId
    );

    const [conversationRows] =
      await db.query(
        `
        SELECT
          id,
          status
        FROM chat_conversations
        WHERE user_one_id = ?
          AND user_two_id = ?
        LIMIT 1
        `,
        [
          userOneId,
          userTwoId,
        ]
      );

    const conversation =
      (conversationRows as any[])[0];

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message:
          "You need to start a conversation before calling.",
      });
    }

    if (conversation.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "This conversation is not active.",
      });
    }

    /*
     * Check whether either user already
     * has an active/ringing call.
     */
    const [activeCallRows] =
      await db.query(
        `
        SELECT id
        FROM call_sessions
        WHERE
          (
            caller_id = ?
            OR receiver_id = ?
            OR caller_id = ?
            OR receiver_id = ?
          )
          AND status IN ('ringing', 'accepted')
        LIMIT 1
        `,
        [
          callerId,
          callerId,
          receiverId,
          receiverId,
        ]
      );

    if (
      (activeCallRows as any[]).length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "One of the users is already in a call.",
      });
    }

    const [result] =
      await db.query(
        `
        INSERT INTO call_sessions
        (
          caller_id,
          receiver_id,
          call_type,
          status
        )
        VALUES (?, ?, ?, 'ringing')
        `,
        [
          callerId,
          receiverId,
          callType,
        ]
      );

    const callId =
      (result as any).insertId;

    return res.status(201).json({
      success: true,
      message: "Call created successfully",
      data: {
        call_id: callId,
        caller_id: callerId,
        receiver_id: receiverId,
        call_type: callType,
        status: "ringing",
      },
    });
  } catch (error) {
    console.error(
      "❌ Create call error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create call",
    });
  }
};


/**
 * Accept call
 *
 * POST /api/calls/:callId/accept
 */
export const acceptCall = async (
  req: Request,
  res: Response
) => {
  try {
    const currentUserId =
      getCurrentUserId(req);

    const callId = Number(
      req.params.callId
    );

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: "Invalid call ID",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          caller_id,
          receiver_id,
          call_type,
          status
        FROM call_sessions
        WHERE id = ?
        LIMIT 1
        `,
        [callId]
      );

    const call =
      (rows as any[])[0];

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (
      call.receiver_id !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot accept this call.",
      });
    }

    if (call.status !== "ringing") {
      return res.status(400).json({
        success: false,
        message:
          "This call is no longer ringing.",
      });
    }

    await db.query(
      `
      UPDATE call_sessions
      SET
        status = 'accepted',
        answered_at = CURRENT_TIMESTAMP,
        started_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [callId]
    );

    return res.status(200).json({
      success: true,
      message: "Call accepted",
      data: {
        call_id: call.id,
        caller_id: call.caller_id,
        receiver_id: call.receiver_id,
        call_type: call.call_type,
        status: "accepted",
      },
    });
  } catch (error) {
    console.error(
      "❌ Accept call error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to accept call",
    });
  }
};


/**
 * Reject call
 *
 * POST /api/calls/:callId/reject
 */
export const rejectCall = async (
  req: Request,
  res: Response
) => {
  try {
    const currentUserId =
      getCurrentUserId(req);

    const callId = Number(
      req.params.callId
    );

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          caller_id,
          receiver_id,
          status
        FROM call_sessions
        WHERE id = ?
        LIMIT 1
        `,
        [callId]
      );

    const call =
      (rows as any[])[0];

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (
      call.receiver_id !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot reject this call.",
      });
    }

    await db.query(
      `
      UPDATE call_sessions
      SET
        status = 'rejected',
        ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [callId]
    );

    return res.status(200).json({
      success: true,
      message: "Call rejected",
    });
  } catch (error) {
    console.error(
      "❌ Reject call error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject call",
    });
  }
};


/**
 * End call
 *
 * POST /api/calls/:callId/end
 */
export const endCall = async (
  req: Request,
  res: Response
) => {
  try {
    const currentUserId =
      getCurrentUserId(req);

    const callId = Number(
      req.params.callId
    );

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          caller_id,
          receiver_id,
          status
        FROM call_sessions
        WHERE id = ?
        LIMIT 1
        `,
        [callId]
      );

    const call =
      (rows as any[])[0];

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (
      call.caller_id !== currentUserId &&
      call.receiver_id !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot end this call.",
      });
    }

    await db.query(
      `
      UPDATE call_sessions
      SET
        status = 'ended',
        ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [callId]
    );

    return res.status(200).json({
      success: true,
      message: "Call ended",
    });
  } catch (error) {
    console.error(
      "❌ End call error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to end call",
    });
  }
};