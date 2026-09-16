import { Request, Response } from "express";
import pool from "../config/database";


export const saveBasicInfo = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      user_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      bio,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const [existing]: any = await pool.query(
      `
      SELECT id
      FROM user_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [user_id]
    );

    if (existing.length > 0) {

      await pool.query(
        `
        UPDATE user_profiles
        SET
          first_name = ?,
          last_name = ?,
          date_of_birth = ?,
          gender = ?,
          bio = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
        [
          first_name || null,
          last_name || null,
          date_of_birth || null,
          gender || null,
          bio || null,
          user_id,
        ]
      );

    } else {

      await pool.query(
        `
        INSERT INTO user_profiles
        (
          user_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          bio,
          profile_completed,
          status,
          created_at,
          updated_at
        )
        VALUES
        (?, ?, ?, ?, ?, ?, 0, 'active',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        [
          user_id,
          first_name || null,
          last_name || null,
          date_of_birth || null,
          gender || null,
          bio || null,
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Basic information saved successfully",
      user_id: Number(user_id),
    });

  } catch (error) {

    console.error("saveBasicInfo error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save basic information",
    });
  }
};


/*
|--------------------------------------------------------------------------
| SAVE ABOUT INFORMATION
|--------------------------------------------------------------------------
*/

export const saveAboutInfo = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      user_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      bio,
      occupation,
      education,
      height_cm,
      relationship_status,
    } = req.body;



    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      user_id === undefined ||
      user_id === null ||
      user_id === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }


    if (
      !first_name ||
      String(first_name).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "first_name is required",
      });
    }


    if (
      !last_name ||
      String(last_name).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "last_name is required",
      });
    }


    if (
      !date_of_birth ||
      String(date_of_birth).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "date_of_birth is required",
      });
    }


    if (
      !gender ||
      String(gender).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "gender is required",
      });
    }


    /* =====================================================
       USER ID NUMBER
    ===================================================== */

    const userIdNumber = Number(user_id);

    if (
      !Number.isInteger(userIdNumber) ||
      userIdNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id",
      });
    }


    /* =====================================================
       HEIGHT
    ===================================================== */

    let heightValue: number | null = null;

    if (
      height_cm !== undefined &&
      height_cm !== null &&
      height_cm !== ""
    ) {

      const parsedHeight =
        Number(height_cm);

      if (
        Number.isNaN(parsedHeight) ||
        parsedHeight <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "height_cm must be a valid number",
        });
      }

      heightValue = parsedHeight;
    }


    /* =====================================================
       DATE VALIDATION
       
       UI sends:
       DD/MM/YYYY
       
       Database:
       YYYY-MM-DD
    ===================================================== */

    let databaseDate = date_of_birth;

    if (
      typeof date_of_birth === "string" &&
      date_of_birth.includes("/")
    ) {

      const parts =
        date_of_birth.split("/");

      if (parts.length !== 3) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid date_of_birth format. Use DD/MM/YYYY",
        });

      }

      const [
        day,
        month,
        year,
      ] = parts;

      if (
        !/^\d{2}$/.test(day) ||
        !/^\d{2}$/.test(month) ||
        !/^\d{4}$/.test(year)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid date_of_birth format. Use DD/MM/YYYY",
        });

      }

      databaseDate =
        `${year}-${month}-${day}`;
    }


    /* =====================================================
       GENDER VALIDATION
    ===================================================== */

    const allowedGenders = [
      "male",
      "female",
      "non_binary",
      "prefer_not",
    ];

    if (
      !allowedGenders.includes(
        String(gender)
      )
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });

    }


    /* =====================================================
       RELATIONSHIP STATUS
    ===================================================== */

    const relationshipValue =
      relationship_status
        ? String(
          relationship_status
        ).trim()
        : null;


    /* =====================================================
       BIO
    ===================================================== */

    const bioValue =
      bio
        ? String(bio).trim()
        : null;


    if (
      bioValue &&
      bioValue.length > 300
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Bio cannot exceed 300 characters",
      });

    }


    /* =====================================================
       OCCUPATION
    ===================================================== */

    const occupationValue =
      occupation
        ? String(occupation).trim()
        : null;


    /* =====================================================
       EDUCATION
    ===================================================== */

    const educationValue =
      education
        ? String(education).trim()
        : null;


    /* =====================================================
       CHECK USER EXISTS
    ===================================================== */

    const [userRows]: any =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userIdNumber]
      );


    if (
      !userRows ||
      userRows.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    /* =====================================================
       CHECK EXISTING PROFILE
    ===================================================== */

    const [existingRows]: any =
      await pool.query(
        `
        SELECT id
        FROM user_profiles
        WHERE user_id = ?
        LIMIT 1
        `,
        [userIdNumber]
      );


    /* =====================================================
       UPDATE EXISTING PROFILE
    ===================================================== */

    if (
      existingRows &&
      existingRows.length > 0
    ) {

      const profileId =
        existingRows[0].id;


      const [result]: any =
        await pool.query(
          `
          UPDATE user_profiles
          SET
            first_name = ?,
            last_name = ?,
            date_of_birth = ?,
            gender = ?,
            bio = ?,
            occupation = ?,
            education = ?,
            height_cm = ?,
            relationship_status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [
            String(first_name).trim(),

            String(last_name).trim(),

            databaseDate,

            String(gender).trim(),

            bioValue,

            occupationValue,

            educationValue,

            heightValue,

            relationshipValue,

            profileId,
          ]
        );


      console.log(
        "Profile updated:",
        result
      );


      return res.status(200).json({

        success: true,

        message:
          "Profile information updated successfully",

        user_id:
          userIdNumber,

        profile_id:
          profileId,

        action: "updated",

      });

    }


    /* =====================================================
       INSERT NEW PROFILE
    ===================================================== */

    const [result]: any =
      await pool.query(
        `
        INSERT INTO user_profiles
        (
          user_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          bio,
          occupation,
          education,
          height_cm,
          relationship_status,
          profile_completed,
          status,
          created_at,
          updated_at
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          0,
          'active',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        `,
        [
          userIdNumber,

          String(first_name).trim(),

          String(last_name).trim(),

          databaseDate,

          String(gender).trim(),

          bioValue,

          occupationValue,

          educationValue,

          heightValue,

          relationshipValue,
        ]
      );


    console.log(
      "About profile inserted:",
      result
    );


    /* =====================================================
       SUCCESS
    ===================================================== */

    return res.status(201).json({

      success: true,

      message:
        "Profile information saved successfully",

      user_id:
        userIdNumber,

      profile_id:
        result.insertId,

      action: "created",

    });


  } catch (error: any) {

    console.error(
      "================================="
    );

    console.error(
      "===== SAVE ABOUT ERROR ====="
    );

    console.error(
      "================================="
    );

    console.error(error);


    return res.status(500).json({

      success: false,

      message:
        "Failed to save about information",

      error:
        error.message,

    });

  }
};
/*
|--------------------------------------------------------------------------
| SAVE INTERESTS
|--------------------------------------------------------------------------
*/

export const saveInterests = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { user_id, interests } = req.body;

    if (!user_id) {
      return res.status(400).json({
        code: 400,
        message: "user_id is required",
      });
    }

    if (!Array.isArray(interests) || interests.length < 5) {
      return res.status(400).json({
        code: 400,
        message: "Please select at least 5 interests",
      });
    }

    await connection.beginTransaction();

    // Remove previous interests for this user
    await connection.query(
      `DELETE FROM user_interests WHERE user_id = ?`,
      [user_id]
    );

    // Save selected interest names
    for (const interest of interests) {
      await connection.query(
        `
        INSERT INTO user_interests
        (
          user_id,
          interest,
          interest_id,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        [user_id, interest]
      );
    }

    await connection.commit();

    return res.status(201).json({
      code: 0,
      message: "Interests saved successfully",
      user_id: Number(user_id),
      interests,
    });

  } catch (error) {
    await connection.rollback();

    console.error("saveInterests error:", error);

    return res.status(500).json({
      code: 500,
      message: "Failed to save interests",
      error: error instanceof Error ? error.message : error,
    });

  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| SAVE PREFERENCES
|--------------------------------------------------------------------------
*/



export const savePreferences = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      user_id,
      preferred_gender,
      min_age,
      max_age,
      max_distance_km,
      relationship_goal,
    } = req.body;

    console.log('========== SAVE PREFERENCES ==========');
    console.log('user_id:', user_id);
    console.log('preferred_gender:', preferred_gender);
    console.log('min_age:', min_age);
    console.log('max_age:', max_age);
    console.log('max_distance_km:', max_distance_km);
    console.log('relationship_goal:', relationship_goal);

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
      });
    }

    if (!preferred_gender) {
      return res.status(400).json({
        success: false,
        message: 'preferred_gender is required',
      });
    }

    if (
      min_age === undefined ||
      min_age === null ||
      min_age === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'min_age is required',
      });
    }

    if (
      max_age === undefined ||
      max_age === null ||
      max_age === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'max_age is required',
      });
    }

    if (
      max_distance_km === undefined ||
      max_distance_km === null ||
      max_distance_km === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'max_distance_km is required',
      });
    }

    if (!relationship_goal) {
      return res.status(400).json({
        success: false,
        message: 'relationship_goal is required',
      });
    }

    // -----------------------------------------
    // INSERT
    // -----------------------------------------

    const [result]: any = await pool.query(
      `
      INSERT INTO user_preferences (
        user_id,
        preferred_gender,
        min_age,
        max_age,
        max_distance_km,
        relationship_goal,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, 'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      `,
      [
        Number(user_id),
        preferred_gender,
        Number(min_age),
        Number(max_age),
        Number(max_distance_km),
        relationship_goal,
      ]
    );

    console.log(
      'Preferences inserted successfully'
    );

    console.log(
      'Inserted ID:',
      result.insertId
    );

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',

      data: {
        id: result.insertId,
        user_id: Number(user_id),
        preferred_gender,
        min_age: Number(min_age),
        max_age: Number(max_age),
        max_distance_km: Number(max_distance_km),
        relationship_goal,
        status: 'active',
      },
    });

  } catch (error: any) {

    console.error(
      '======================================'
    );

    console.error(
      'SAVE PREFERENCES ERROR:',
      error
    );

    console.error(
      '======================================'
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to save preferences',
      error: error?.message || String(error),
    });
  }
};


/*
|--------------------------------------------------------------------------
| SAVE LOCATION
|--------------------------------------------------------------------------
*/


export const saveLocation = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      user_id,
      city,
      state,
      country,
      country_code,
      latitude,
      longitude,
    } = req.body;

    // =========================================
    // VALIDATION
    // =========================================

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "city is required",
      });
    }

    if (!country) {
      return res.status(400).json({
        success: false,
        message: "country is required",
      });
    }

    if (
      latitude === undefined ||
      latitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "latitude is required",
      });
    }

    if (
      longitude === undefined ||
      longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "longitude is required",
      });
    }

    // =========================================
    // CHECK EXISTING LOCATION
    // =========================================

    const [existingRows]: any =
      await pool.query(
        `
        SELECT id
        FROM user_locations
        WHERE user_id = ?
        LIMIT 1
        `,
        [Number(user_id)]
      );

    // =========================================
    // UPDATE
    // =========================================

    if (existingRows.length > 0) {

      await pool.query(
        `
        UPDATE user_locations
        SET
          latitude = ?,
          longitude = ?,
          city = ?,
          state = ?,
          country = ?,
          country_code = ?,
          location_updated_at =
            CURRENT_TIMESTAMP,
          status = 'active',
          updated_at =
            CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
        [
          Number(latitude),
          Number(longitude),

          city.trim(),

          state
            ? state.trim()
            : null,

          country.trim(),

          country_code
            ? country_code
              .trim()
              .toUpperCase()
            : null,

          Number(user_id),
        ]
      );

    }

    // =========================================
    // INSERT
    // =========================================

    else {

      await pool.query(
        `
        INSERT INTO user_locations (
          user_id,
          latitude,
          longitude,
          city,
          state,
          country,
          country_code,
          location_updated_at,
          status,
          created_at,
          updated_at
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          CURRENT_TIMESTAMP,
          'active',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        `,
        [
          Number(user_id),

          Number(latitude),

          Number(longitude),

          city.trim(),

          state
            ? state.trim()
            : null,

          country.trim(),

          country_code
            ? country_code
              .trim()
              .toUpperCase()
            : null,
        ]
      );

    }

    // =========================================
    // SUCCESS
    // =========================================

    return res.status(200).json({

      success: true,

      message:
        "Location saved successfully",

      data: {
        user_id:
          Number(user_id),

        city:
          city.trim(),

        state:
          state
            ? state.trim()
            : null,

        country:
          country.trim(),

        country_code:
          country_code
            ? country_code
              .trim()
              .toUpperCase()
            : null,

        latitude:
          Number(latitude),

        longitude:
          Number(longitude),
      },
    });

  } catch (error: any) {

    console.error(
      "saveLocation error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to save location",

      error:
        error?.message ||
        String(error),
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET COMPLETE PROFILE FOR PREVIEW
|--------------------------------------------------------------------------
*/
export const getProfilePreview = async (
  req: Request,
  res: Response
) => {
  try {
    const { user_id } = req.params;

    // =========================================================
    // VALIDATE USER ID
    // =========================================================

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const userId = Number(user_id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id",
      });
    }

    // =========================================================
    // GET PROFILE
    // =========================================================

    const [profileRows]: any = await pool.query(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        bio,
        occupation,
        education,
        height_cm,
        relationship_status,
        smoking,
        profile_completed,
        status
      FROM user_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (
      !profileRows ||
      profileRows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const profile = profileRows[0];

    // =========================================================
    // BUILD FULL NAME
    // =========================================================

    const firstName = String(
      profile.first_name || ""
    ).trim();

    const lastName = String(
      profile.last_name || ""
    ).trim();

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ");

    // =========================================================
    // CALCULATE AGE
    // =========================================================

    let age: number | null = null;

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
          today.getDate() < dob.getDate()
        )
      ) {
        age--;
      }
    }

    // =========================================================
    // GET LOCATION
    // =========================================================

    const [locationRows]: any =
      await pool.query(
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
        ORDER BY id DESC
        LIMIT 1
        `,
        [userId]
      );

    const location =
      locationRows &&
        locationRows.length > 0
        ? locationRows[0]
        : null;

    // =========================================================
    // GET INTERESTS
    // =========================================================

    const [interestRows]: any =
      await pool.query(
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

    const interests =
      Array.isArray(interestRows)
        ? interestRows
          .map((row: any) =>
            String(
              row.interest || ""
            ).trim()
          )
          .filter(Boolean)
        : [];

    // =========================================================
    // GET PROFILE PHOTOS
    // =========================================================

    const [photoRows]: any =
      await pool.query(
        `
        SELECT
          id,
          photo_url,
          photo_order,
          is_primary
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

    // =========================================================
    // BUILD PHOTO URLs
    // =========================================================

    const baseUrl = String(
      process.env.API_BASE_URL ||
      "http://192.168.1.8:5000"
    ).trim().replace(/\/+$/, "");

    const photos = Array.isArray(photoRows)
      ? photoRows
        .map((photo: any) => {
          const photoUrl =
            String(
              photo.photo_url || ""
            ).trim();

          if (!photoUrl) {
            return null;
          }

          // Already a complete URL
          if (
            photoUrl.startsWith("http://") ||
            photoUrl.startsWith("https://")
          ) {
            return photoUrl;
          }

          // Convert /uploads/... to complete URL
          return `${baseUrl}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
        })
        .filter(Boolean)
      : [];

    // =========================================================
    // RESPONSE
    // =========================================================

    return res.status(200).json({
      success: true,

      data: {
        user_id: Number(
          profile.user_id
        ),

        name:
          fullName || "Your Name",

        first_name:
          profile.first_name,

        last_name:
          profile.last_name,

        age,

        date_of_birth:
          profile.date_of_birth,

        gender:
          profile.gender,

        bio:
          profile.bio,

        occupation:
          profile.occupation,

        education:
          profile.education,

        height_cm:
          profile.height_cm,

        relationship_status:
          profile.relationship_status,

        smoking:
          profile.smoking,

        profile_completed:
          profile.profile_completed,

        status:
          profile.status,

        // =====================================================
        // LOCATION
        // =====================================================

        city:
          location?.city || null,

        state:
          location?.state || null,

        country:
          location?.country || null,

        country_code:
          location?.country_code || null,

        latitude:
          location?.latitude ?? null,

        longitude:
          location?.longitude ?? null,

        // =====================================================
        // INTERESTS
        // =====================================================

        interests,

        // =====================================================
        // PHOTOS
        // =====================================================

        photos,

        photo_details:
          Array.isArray(photoRows)
            ? photoRows
            : [],
      },
    });

  } catch (error: any) {
    console.error(
      "getProfilePreview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load profile preview",
      error:
        error?.message ||
        String(error),
    });
  }
};



/*
|--------------------------------------------------------------------------
| COMPLETE PROFILE
|--------------------------------------------------------------------------
*/

export const completeProfile = async (
  req: Request,
  res: Response
) => {
  try {

    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const [photos]: any = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM user_photos
      WHERE user_id = ?
      AND status = 'active'
      `,
      [user_id]
    );

    const totalPhotos =
      Number(photos[0].total);

    if (totalPhotos < 2) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 2 photos",
      });
    }

    if (totalPhotos > 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum 4 photos are allowed",
      });
    }

    await pool.query(
      `
      UPDATE user_profiles
      SET
        profile_completed = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
    });

  } catch (error) {

    console.error(
      "completeProfile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to complete profile",
    });
  }
};


export const saveLifestyle = async (
  req: Request,
  res: Response
) => {
  try {

    const { user_id, smoking } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    if (!smoking) {
      return res.status(400).json({
        success: false,
        message: "smoking is required",
      });
    }

    await pool.query(
      `
      UPDATE user_profiles
      SET
        smoking = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
      `,
      [smoking, user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Lifestyle saved successfully",
    });

  } catch (error) {

    console.error(
      "saveLifestyle error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save lifestyle",
    });
  }
};



export const saveProfilePhotos = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.body.user_id);

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        code: 1,
        message: "User ID is required",
      });
    }

    // Get uploaded files
    const files = req.files as any[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        code: 1,
        message: "Please select at least one photo",
      });
    }

    // Check existing active photos
    const [existingRows]: any = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM user_photos
      WHERE user_id = ?
      AND status = 'active'
      `,
      [userId]
    );

    const existingCount = Number(
      existingRows[0]?.total || 0
    );

    // Maximum 4 photos
    if (existingCount + files.length > 4) {
      return res.status(400).json({
        code: 1,
        message: "Maximum 4 photos are allowed",
      });
    }

    const savedPhotos = [];

    // Save every uploaded photo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Path saved in database
      const photoUrl =
        `/uploads/profile/${userId}/${file.filename}`;

      // Photo order
      const photoOrder =
        existingCount + i + 1;

      // First photo becomes primary
      const isPrimary =
        existingCount === 0 && i === 0
          ? 1
          : 0;

      // Insert into user_photos
      const [result]: any = await pool.query(
        `
        INSERT INTO user_photos
        (
          user_id,
          photo_url,
          photo_order,
          is_primary,
          verification_status,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          userId,
          photoUrl,
          photoOrder,
          isPrimary,
          "pending",
          "active",
        ]
      );

      savedPhotos.push({
        id: result.insertId,
        user_id: userId,
        photo_url: photoUrl,
        photo_order: photoOrder,
        is_primary: isPrimary,
        verification_status: "pending",
        status: "active",
      });
    }

    return res.status(201).json({
      code: 0,
      message: "Photos saved successfully",
      response: {
        photos: savedPhotos,
      },
    });

  } catch (error) {
    console.error(
      "saveProfilePhotos error:",
      error
    );

    return res.status(500).json({
      code: 1,
      message: "Failed to save photos",
    });
  }
};
