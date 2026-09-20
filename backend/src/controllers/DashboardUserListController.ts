import { Request, Response } from "express";
import pool from "../config/database";

const NEARBY_RADIUS_KM = 25;

/**
 * Normalize location values for comparison
 */
const normalize = (value: any): string => {
  return String(value ?? "").trim().toLowerCase();
};

/**
 * Calculate distance between two coordinates
 * Returns distance in KM
 */
const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

export const getDashboardUsers = async (
  req: Request,
  res: Response
) => {
  try {
    // =====================================================
    // 1. GET LOGGED-IN USER ID FROM JWT
    // =====================================================

    const currentUserId =
      (req as any).user?.userId;

    console.log(
      "Dashboard currentUserId:",
      currentUserId
    );

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =====================================================
    // 2. GET LOGGED-IN USER'S LOCATION
    // =====================================================

    const [locationRows]: any =
      await pool.query(
        `
        SELECT
          latitude,
          longitude,
          city,
          state,
          country,
          country_code
        FROM user_locations
        WHERE user_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [currentUserId]
      );

    console.log(
      "Current user location:",
      locationRows
    );

    /**
     * IMPORTANT:
     *
     * Do NOT return:
     *
     * "Your saved location was not found"
     *
     * because we still want to allow
     * City / State / Country matching
     * if location information is available.
     */

    const currentLocation =
      locationRows.length > 0
        ? locationRows[0]
        : {
            latitude: null,
            longitude: null,
            city: null,
            state: null,
            country: null,
            country_code: null,
          };

    // =====================================================
    // 3. CURRENT USER LOCATION VALUES
    // =====================================================

    const currentLatitude =
      currentLocation.latitude !== null &&
      currentLocation.latitude !== undefined
        ? Number(currentLocation.latitude)
        : null;

    const currentLongitude =
      currentLocation.longitude !== null &&
      currentLocation.longitude !== undefined
        ? Number(currentLocation.longitude)
        : null;

    const currentCity =
      currentLocation.city || null;

    const currentState =
      currentLocation.state || null;

    const currentCountry =
      currentLocation.country || null;

    const currentCountryCode =
      currentLocation.country_code || null;

    console.log(
      "Current location:",
      {
        latitude: currentLatitude,
        longitude: currentLongitude,
        city: currentCity,
        state: currentState,
        country: currentCountry,
        country_code: currentCountryCode,
      }
    );

    // =====================================================
    // 4. GET ALL OTHER ACTIVE USERS
    // =====================================================

    const [users]: any =
      await pool.query(
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
          up.relationship_status,

          ul.latitude,
          ul.longitude,
          ul.city,
          ul.state,
          ul.country,
          ul.country_code,

          GROUP_CONCAT(
            uph.photo_url
            ORDER BY
              uph.is_primary DESC,
              uph.photo_order ASC
            SEPARATOR '|||'
          ) AS photos

        FROM users u

        INNER JOIN user_profiles up
          ON up.user_id = u.id

        INNER JOIN user_locations ul
          ON ul.user_id = u.id
          AND ul.status = 'active'

        LEFT JOIN user_photos uph
          ON uph.user_id = u.id
          AND uph.status = 'active'

        WHERE

          u.id != ?

          AND u.account_status = 'active'

          AND u.phone_verified = 1

          AND up.status = 'active'

          AND up.profile_completed = 1

        GROUP BY

          u.id,

          up.first_name,
          up.last_name,
          up.date_of_birth,
          up.gender,
          up.bio,
          up.occupation,
          up.education,
          up.height_cm,
          up.relationship_status,

          ul.latitude,
          ul.longitude,
          ul.city,
          ul.state,
          ul.country,
          ul.country_code

        ORDER BY
          u.created_at DESC
        `,
        [currentUserId]
      );

    console.log(
      "Total dashboard users:",
      users.length
    );

    // =====================================================
    // 5. FORMAT USERS
    // =====================================================

    const formattedUsers =
      users.map((user: any) => {

        // =================================================
        // AGE
        // =================================================

        let age: number | null = null;

        if (user.date_of_birth) {
          const dob =
            new Date(
              user.date_of_birth
            );

          const today =
            new Date();

          age =
            today.getFullYear() -
            dob.getFullYear();

          const monthDiff =
            today.getMonth() -
            dob.getMonth();

          if (
            monthDiff < 0 ||
            (
              monthDiff === 0 &&
              today.getDate() <
                dob.getDate()
            )
          ) {
            age--;
          }
        }

        // =================================================
        // PHOTOS
        // =================================================

        const images =
          user.photos
            ? user.photos
                .split("|||")
                .filter(
                  (photo: string) =>
                    photo.trim() !== ""
                )
                .map(
                  (photo: string) => {

                    if (
                      photo.startsWith(
                        "http://"
                      ) ||
                      photo.startsWith(
                        "https://"
                      )
                    ) {
                      return photo;
                    }

                    const baseUrl =
                      `${req.protocol}://${req.get("host")}`;

                    return `${baseUrl}${photo}`;
                  }
                )
            : [];

        // =================================================
        // DISTANCE
        // =================================================

        let distance:
          number | null = null;

        /**
         * Calculate distance ONLY when
         * both current user and other user
         * have valid latitude/longitude.
         */

        if (
          currentLatitude !== null &&
          currentLongitude !== null &&
          user.latitude !== null &&
          user.latitude !== undefined &&
          user.longitude !== null &&
          user.longitude !== undefined
        ) {

          distance =
            calculateDistanceKm(
              currentLatitude,
              currentLongitude,
              Number(user.latitude),
              Number(user.longitude)
            );
        }

        // =================================================
        // LOCATION MATCH
        // =================================================

        let locationMatch =
          "none";

        // =================================================
        // 1. NEARBY
        // =================================================

        if (
          distance !== null &&
          distance <=
            NEARBY_RADIUS_KM
        ) {

          locationMatch =
            "nearby";
        }

        // =================================================
        // 2. SAME CITY
        // =================================================

        else if (
          normalize(currentCity) !== "" &&
          normalize(user.city) !== "" &&
          normalize(currentCity) ===
            normalize(user.city) &&
          (
            !currentCountryCode ||
            !user.country_code ||
            normalize(
              currentCountryCode
            ) ===
              normalize(
                user.country_code
              )
          )
        ) {

          locationMatch =
            "city";
        }

        // =================================================
        // 3. SAME STATE
        // =================================================

        else if (
          normalize(currentState) !== "" &&
          normalize(user.state) !== "" &&
          normalize(currentState) ===
            normalize(user.state) &&
          (
            !currentCountryCode ||
            !user.country_code ||
            normalize(
              currentCountryCode
            ) ===
              normalize(
                user.country_code
              )
          )
        ) {

          locationMatch =
            "state";
        }

        // =================================================
        // 4. SAME COUNTRY
        // =================================================

        else if (
          currentCountryCode &&
          user.country_code &&
          normalize(
            currentCountryCode
          ) ===
            normalize(
              user.country_code
            )
        ) {

          locationMatch =
            "country";
        }

        // =================================================
        // COUNTRY NAME FALLBACK
        // =================================================

        else if (
          normalize(currentCountry) !== "" &&
          normalize(user.country) !== "" &&
          normalize(currentCountry) ===
            normalize(user.country)
        ) {

          locationMatch =
            "country";
        }

        // =================================================
        // RETURN USER
        // =================================================

        return {

          id: user.id,

          name: [
            user.first_name,
            user.last_name,
          ]
            .filter(Boolean)
            .join(" "),

          age,

          gender:
            user.gender || "",

          bio:
            user.bio || null,

          occupation:
            user.occupation || null,

          education:
            user.education || null,

          height_cm:
            user.height_cm || null,

          relationship_status:
            user.relationship_status ||
            null,

          // First photo
          image:
            images.length
              ? images[0]
              : null,

          // All photos
          images,

          // Distance
          distance:
            distance !== null
              ? Number(
                  distance.toFixed(1)
                )
              : null,

          // nearby / city / state / country / none
          location_match:
            locationMatch,

          city:
            user.city || null,

          state:
            user.state || null,

          country:
            user.country || null,

          online: false,

          likes_count: 0,

          comments_count: 0,
        };
      });

    // =====================================================
    // 6. STRICT LOCATION PRIORITY
    //
    // NEARBY
    //    ↓ if none
    // CITY
    //    ↓ if none
    // STATE
    //    ↓ if none
    // COUNTRY
    //    ↓ if none
    // NONE
    // =====================================================

    let finalUsers: any[] = [];

    let matchingLevel =
      "none";

    // =====================================================
    // FIRST: NEARBY
    // =====================================================

    const nearbyUsers =
      formattedUsers.filter(
        (user: any) =>
          user.location_match ===
          "nearby"
      );

    if (nearbyUsers.length > 0) {

      finalUsers =
        nearbyUsers.sort(
          (a: any, b: any) =>
            (a.distance ?? Infinity) -
            (b.distance ?? Infinity)
        );

      matchingLevel =
        "nearby";
    }

    // =====================================================
    // SECOND: CITY
    // =====================================================

    else {

      const cityUsers =
        formattedUsers.filter(
          (user: any) =>
            user.location_match ===
            "city"
        );

      if (cityUsers.length > 0) {

        finalUsers =
          cityUsers;

        matchingLevel =
          "city";
      }

      // ===================================================
      // THIRD: STATE
      // ===================================================

      else {

        const stateUsers =
          formattedUsers.filter(
            (user: any) =>
              user.location_match ===
              "state"
          );

        if (stateUsers.length > 0) {

          finalUsers =
            stateUsers;

          matchingLevel =
            "state";
        }

        // ===============================================
        // FOURTH: COUNTRY
        // ===============================================

        else {

          const countryUsers =
            formattedUsers.filter(
              (user: any) =>
                user.location_match ===
                "country"
            );

          if (
            countryUsers.length > 0
          ) {

            finalUsers =
              countryUsers;

            matchingLevel =
              "country";
          }
        }
      }
    }

    // =====================================================
    // 7. RESPONSE
    // =====================================================

    return res.status(200).json({

      success: true,

      count:
        finalUsers.length,

      matching_level:
        matchingLevel,

      location: {

        city:
          currentCity,

        state:
          currentState,

        country:
          currentCountry,

        country_code:
          currentCountryCode,

        latitude:
          currentLatitude,

        longitude:
          currentLongitude,
      },

      users:
        finalUsers,
    });

  } catch (error) {

    console.error(
      "Dashboard users error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to load dashboard users",

    });
  }
};