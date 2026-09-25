import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ResponsiveScreen from "../../components/ResponsiveScreen";


export default function DiscoverScreen() {
  const [locationFilter, setLocationFilter] =
    useState<LocationFilter>("nearby");

  const [search, setSearch] = useState("");

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
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

            <Text style={styles.headerTitle}>
              Discover
            </Text>

            <Pressable style={styles.filterButton}>
              <Ionicons
                name="options-outline"
                size={22}
                color="#FF3D71"
              />
            </Pressable>
          </View>

          {/* SEARCH */}

          

          {/* LOCATION TITLE */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Discover people
              </Text>

              <Text style={styles.sectionSubtitle}>
                Find people based on location
              </Text>
            </View>
          </View>

          {/* LOCATION FILTERS */}

       

          {/* FILTERS */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Filters
              </Text>

              <Text style={styles.sectionSubtitle}>
                Find people who match your preferences
              </Text>
            </View>
          </View>

          <View style={styles.filterCard}>
            {/* AGE */}

            <View style={styles.filterRow}>
              <View style={styles.filterIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#FF3D71"
                />
              </View>

              <View style={styles.filterContent}>
                <Text style={styles.filterTitle}>
                  Age
                </Text>

                <Text style={styles.filterValue}>
                  21 - 35 years
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#A1A1AA"
              />
            </View>

            <View style={styles.divider} />

            {/* GENDER */}

            <View style={styles.filterRow}>
              <View style={styles.filterIcon}>
                <Ionicons
                  name="people-outline"
                  size={19}
                  color="#FF3D71"
                />
              </View>

              <View style={styles.filterContent}>
                <Text style={styles.filterTitle}>
                  Gender
                </Text>

                <Text style={styles.filterValue}>
                  Everyone
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#A1A1AA"
              />
            </View>

            <View style={styles.divider} />

            {/* RELATIONSHIP */}

            <View style={styles.filterRow}>
              <View style={styles.filterIcon}>
                <Ionicons
                  name="heart-outline"
                  size={19}
                  color="#FF3D71"
                />
              </View>

              

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#A1A1AA"
              />
            </View>
          </View>

          {/* PREMIUM FILTER */}

          <Pressable style={styles.premiumCard}>
            <View style={styles.premiumIcon}>
              <Ionicons
                name="sparkles"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>
                Premium Filters
              </Text>

              <Text style={styles.premiumSubtitle}>
                Education, height, lifestyle, interests and more
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#FF3D71"
            />
          </Pressable>

          {/* APPLY BUTTON */}

          <Pressable style={styles.applyButton}>
            <Ionicons
              name="search"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.applyButtonText}>
              Find People
            </Text>
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </ResponsiveScreen>
  );
}

/* LOCATION BUTTON */

function LocationButton({
  icon,
  title,
  subtitle,
  active,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.locationButton,
        active && styles.locationButtonActive,
      ]}
    >
      <View
        style={[
          styles.locationIcon,
          active && styles.locationIconActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            active ? "#FFFFFF" : "#FF3D71"
          }
        />
      </View>

      <Text
        style={[
          styles.locationTitle,
          active && styles.locationTitleActive,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.locationSubtitle,
          active && styles.locationSubtitleActive,
        ]}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF6F8",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#18181B",
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SEARCH */

  searchBox: {
    marginTop: 22,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#18181B",
    fontWeight: "600",
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#18181B",
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#A1A1AA",
  },

  /* LOCATION */

  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  locationButton: {
    width: "48%",
    minHeight: 116,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    padding: 14,
  },

  locationButtonActive: {
    backgroundColor: "#FF3D71",
    borderColor: "#FF3D71",
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1F5",
    alignItems: "center",
    justifyContent: "center",
  },

  locationIconActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  locationTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "900",
    color: "#18181B",
  },

  locationTitleActive: {
    color: "#FFFFFF",
  },

  locationSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#A1A1AA",
  },

  locationSubtitleActive: {
    color: "rgba(255,255,255,0.85)",
  },

  /* FILTER CARD */

  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FFE6ED",
    paddingHorizontal: 16,
  },

  filterRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF1F5",
    alignItems: "center",
    justifyContent: "center",
  },

  filterContent: {
    flex: 1,
    marginLeft: 12,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#18181B",
  },

  filterValue: {
    marginTop: 3,
    fontSize: 11,
    color: "#A1A1AA",
  },

  divider: {
    height: 1,
    backgroundColor: "#F4F4F5",
  },

  /* PREMIUM */

  premiumCard: {
    marginTop: 16,
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FF3D71",
    alignItems: "center",
    justifyContent: "center",
  },

  premiumContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  premiumTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#18181B",
  },

  premiumSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: "#A1A1AA",
  },

  /* APPLY */

  applyButton: {
    marginTop: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FF3D71",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  bottomSpace: {
    height: 20,
  },
});
