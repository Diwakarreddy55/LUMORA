import { Request, Response } from "express";
import pool from "../config/database";

export const getUserProfileById = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.user_id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ================================
    // USER + PROFILE
    // ================================

    const [rows]: any = await pool.query(
      `
      SELECT
        u.id,
        up.first_name,
        up.last_name,
        up.date_of_birth,
        up.gender,
        up.bio,
        up.occupation,
        up.education,
        up.height_cm,
        up.relationship_status
      FROM users u
      INNER JOIN user_profiles up
        ON up.user_id = u.id
      WHERE u.id = ?
        AND u.account_status = 'active'
        AND up.status = 'active'
      LIMIT 1
      `,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = rows[0];

    // ================================
    // AGE
    // ================================

    let age: number | null = null;

    if (user.date_of_birth) {
      const dob = new Date(user.date_of_birth);
      const today = new Date();

      age = today.getFullYear() - dob.getFullYear();

      const monthDiff =
        today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (
          monthDiff === 0 &&
          today.getDate() < dob.getDate()
        )
      ) {
        age--;
      }
    }

    // ================================
    // LOCATION
    // ================================

    const [locationRows]: any = await pool.query(
      `
      SELECT
        city,
        state,
        country,
        country_code,
        latitude,
        longitude
      FROM user_locations
      WHERE user_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [userId]
    );

    const location =
      locationRows.length > 0
        ? locationRows[0]
        : {};

    // ================================
    // PHOTOS
    // ================================

    const [photoRows]: any = await pool.query(
      `
      SELECT
        photo_url
      FROM user_photos
      WHERE user_id = ?
        AND status = 'active'
      ORDER BY
        is_primary DESC,
        photo_order ASC,
        id ASC
      `,
      [userId]
    );

    const baseUrl =
      `${req.protocol}://${req.get("host")}`;

    const photos = photoRows
      .map((photo: any) => {
        if (!photo.photo_url) {
          return null;
        }

        const photoUrl =
          String(photo.photo_url).trim();

        if (
          photoUrl.startsWith("http://") ||
          photoUrl.startsWith("https://")
        ) {
          return photoUrl;
        }

        return photoUrl.startsWith("/")
          ? `${baseUrl}${photoUrl}`
          : `${baseUrl}/${photoUrl}`;
      })
      .filter(Boolean);

    // ================================
    // INTERESTS
    // ================================

    const [interestRows]: any = await pool.query(
      `
      SELECT
        interest
      FROM user_interests
      WHERE user_id = ?
        AND status = 'active'
      ORDER BY id ASC
      `,
      [userId]
    );

    const interests = interestRows.map(
      (row: any) => row.interest
    );

    // ================================
    // NAME
    // ================================

    const name = [
      user.first_name,
      user.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    // ================================
    // RESPONSE
    // ================================

    return res.status(200).json({
      success: true,

      data: {
        id: user.id,

        name: name || "User",

        age,

        gender: user.gender || "",

        city: location.city || "",

        state: location.state || "",

        country: location.country || "",

        country_code:
          location.country_code || "",

        latitude:
          location.latitude || null,

        longitude:
          location.longitude || null,

        about: user.bio || "",

        education:
          user.education || "",

        occupation:
          user.occupation || "",

        relationship:
          user.relationship_status || "",

        height_cm:
          user.height_cm || null,

        height: user.height_cm
          ? `${user.height_cm} cm`
          : "",

        interests,

        lifestyle: [],

        photos,

        image:
          photos.length > 0
            ? photos[0]
            : null,

        online: false,
      },
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load user profile",
    });
  }
};