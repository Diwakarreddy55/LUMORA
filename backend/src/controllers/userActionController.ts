import { Request, Response } from "express";
import db from "../config/database";


export const saveUserAction = async (
  req: Request,
  res: Response
) => {
  try {
    // Logged-in user from JWT
    const currentUserId = Number(
      (req as any).user.userId
    );

    const { target_user_id, action } = req.body;

    const targetUserId = Number(target_user_id);

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "target_user_id is required",
      });
    }

    if (!["like", "dislike"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be like or dislike",
      });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot like or dislike yourself",
      });
    }

    // --------------------------------------------------
    // CHECK TARGET USER
    // --------------------------------------------------

    const [targetUsers] = await db.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
        AND account_status = 'active'
      LIMIT 1
      `,
      [targetUserId]
    );

    if ((targetUsers as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    // --------------------------------------------------
    // SAVE / UPDATE ACTION
    // --------------------------------------------------

    /**
     * Because user_actions has:
     *
     * UNIQUE(from_user_id, to_user_id)
     *
     * this will:
     *
     * INSERT if action doesn't exist
     *
     * UPDATE if action already exists
     */

    await db.query(
      `
      INSERT INTO user_actions
      (
        from_user_id,
        to_user_id,
        action
      )
      VALUES (?, ?, ?)

      ON DUPLICATE KEY UPDATE
        action = VALUES(action),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        currentUserId,
        targetUserId,
        action,
      ]
    );

    // --------------------------------------------------
    // CHECK MUTUAL LIKE
    // --------------------------------------------------

    let matched = false;
    let matchId: number | null = null;

    if (action === "like") {
      const [mutualLikeRows] = await db.query(
        `
        SELECT id
        FROM user_actions
        WHERE from_user_id = ?
          AND to_user_id = ?
          AND action = 'like'
        LIMIT 1
        `,
        [
          targetUserId,
          currentUserId,
        ]
      );

      if ((mutualLikeRows as any[]).length > 0) {
        matched = true;

        // ----------------------------------------------
        // Keep smaller user ID first
        // ----------------------------------------------

        const userOneId = Math.min(
          currentUserId,
          targetUserId
        );

        const userTwoId = Math.max(
          currentUserId,
          targetUserId
        );

        // ----------------------------------------------
        // Create match
        // ----------------------------------------------

        await db.query(
          `
          INSERT INTO user_matches
          (
            user_one_id,
            user_two_id,
            status
          )
          VALUES (?, ?, 'active')

          ON DUPLICATE KEY UPDATE
            status = 'active',
            updated_at = CURRENT_TIMESTAMP
          `,
          [
            userOneId,
            userTwoId,
          ]
        );

        // ----------------------------------------------
        // Get match ID
        // ----------------------------------------------

        const [matchRows] = await db.query(
          `
          SELECT id
          FROM user_matches
          WHERE user_one_id = ?
            AND user_two_id = ?
          LIMIT 1
          `,
          [
            userOneId,
            userTwoId,
          ]
        );

        matchId =
          (matchRows as any[])[0]?.id || null;
      }
    }

    // --------------------------------------------------
    // GET COUNTS FOR TARGET USER
    // --------------------------------------------------

    const [countRows] = await db.query(
      `
      SELECT
        COALESCE(
          SUM(action = 'like'),
          0
        ) AS likes_count,

        COALESCE(
          SUM(action = 'dislike'),
          0
        ) AS dislikes_count

      FROM user_actions

      WHERE to_user_id = ?
      `,
      [targetUserId]
    );

    const counts =
      (countRows as any[])[0] || {};

    // --------------------------------------------------
    // GET CURRENT USER'S ACTION
    // --------------------------------------------------

    const [currentActionRows] = await db.query(
      `
      SELECT action
      FROM user_actions
      WHERE from_user_id = ?
        AND to_user_id = ?
      LIMIT 1
      `,
      [
        currentUserId,
        targetUserId,
      ]
    );

    const currentAction =
      (currentActionRows as any[])[0]?.action ||
      null;

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        action === "like"
          ? "User liked successfully"
          : "User disliked successfully",

      data: {
        from_user_id: currentUserId,
        to_user_id: targetUserId,

        action: currentAction,

        matched,

        match_id: matchId,

        likes_count: Number(
          counts.likes_count || 0
        ),

        dislikes_count: Number(
          counts.dislikes_count || 0
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Save user action error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save user action",
    });
  }
};
