import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import ResponsiveScreen from "../../components/ResponsiveScreen";
const people = [
  {
    id: 1,
    name: "Sarah",
    age: 24,
    distance: "3 km away",
    interests: ["Music", "Travel", "Movies"],
    image: null,
  },
  {
    id: 2,
    name: "Emma",
    age: 26,
    distance: "5 km away",
    interests: ["Fitness", "Food"],
    image: null,
  },
  {
    id: 3,
    name: "Maya",
    age: 23,
    distance: "7 km away",
    interests: ["Photography", "Travel"],
    image: null,
  },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] =
    useState("nearby");

  const [currentPerson, setCurrentPerson] =
    useState(0);

  const person = people[currentPerson];

  const handlePass = () => {
    if (currentPerson < people.length - 1) {
      setCurrentPerson(currentPerson + 1);
    } else {
      setCurrentPerson(0);
    }
  };

  const handleLike = () => {
    if (currentPerson < people.length - 1) {
      setCurrentPerson(currentPerson + 1);
    } else {
      setCurrentPerson(0);
    }
  };

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <Pressable style={styles.menuButton}>
              <Ionicons
                name="menu-outline"
                size={24}
                color="#18181B"
              />
            </Pressable>

            <Text style={styles.logo}>
              LUMORA
            </Text>

            <View style={styles.headerRight}>

              <Pressable
                style={styles.headerIcon}
                onPress={() =>
                  router.push("/")
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={22}
                  color="#FF3D71"
                />
              </Pressable>

              <Pressable
                style={styles.headerIcon}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#18181B"
                />

                <View style={styles.notificationDot} />
              </Pressable>

            </View>
          </View>

          {/* GREETING */}

          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              Good evening 👋
            </Text>

            <Text style={styles.userName}>
              Diwakar
            </Text>

            <Text style={styles.subtitle}>
              Find someone who feels right.
            </Text>
          </View>

          {/* SEARCH */}

          <Pressable
            style={styles.searchBox}
            onPress={() =>
              router.push("/")
            }
          >
            <Ionicons
              name="search-outline"
              size={21}
              color="#71717A"
            />

            <Text style={styles.searchPlaceholder}>
              Search people
            </Text>

            <Pressable
              style={styles.filterButton}
              onPress={() =>
                router.push("/")
              }
            >
              <Ionicons
                name="options-outline"
                size={20}
                color="#FF3D71"
              />
            </Pressable>
          </Pressable>

          {/* TOP FILTERS */}

          <View style={styles.tabs}>

            <TabButton
              title="Nearby"
              active={activeTab === "nearby"}
              onPress={() =>
                setActiveTab("nearby")
              }
            />

            <TabButton
              title="New"
              active={activeTab === "new"}
              onPress={() =>
                setActiveTab("new")
              }
            />

            <TabButton
              title="For You"
              active={activeTab === "foryou"}
              onPress={() =>
                setActiveTab("foryou")
              }
            />

          </View>

          {/* PEOPLE NEAR YOU */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                {activeTab === "nearby"
                  ? "People near you"
                  : activeTab === "new"
                  ? "New people"
                  : "Picked for you"}
              </Text>

              <Text style={styles.sectionSubtitle}>
                Discover your next connection
              </Text>
            </View>

            <Pressable>
              <Text style={styles.seeAll}>
                See all
              </Text>
            </Pressable>

          </View>

          {/* MAIN PROFILE CARD */}

          <View style={styles.profileCard}>

            {/* PHOTO */}

            <View style={styles.profileImage}>

              {person.image ? (
                <Image
                  source={{
                    uri: person.image,
                  }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="person"
                    size={80}
                    color="#FF3D71"
                  />
                </View>
              )}

              {/* ONLINE */}

              <View style={styles.onlineBadge}>
                <View
                  style={styles.onlineDot}
                />

                <Text
                  style={styles.onlineText}
                >
                  Online
                </Text>
              </View>

              {/* PROFILE HEART */}

              <Pressable
                style={styles.cardHeart}
                onPress={handleLike}
              >
                <Ionicons
                  name="heart"
                  size={21}
                  color="#FF3D71"
                />
              </Pressable>

            </View>

            {/* PROFILE INFO */}

            <View style={styles.profileInfo}>

              <Text style={styles.profileName}>
                {person.name}, {person.age}
              </Text>

              <View
                style={styles.locationRow}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#71717A"
                />

                <Text style={styles.location}>
                  {person.distance}
                </Text>
              </View>

              {/* INTERESTS */}

              <View style={styles.interests}>

                {person.interests.map(
                  (item) => (
                    <View
                      key={item}
                      style={styles.interestTag}
                    >
                      <Text
                        style={
                          styles.interestText
                        }
                      >
                        {item}
                      </Text>
                    </View>
                  )
                )}

              </View>

              {/* ACTIONS */}

              <View style={styles.actions}>

                {/* PASS */}

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.passButton,
                  ]}
                  onPress={handlePass}
                >
                  <Ionicons
                    name="close"
                    size={25}
                    color="#71717A"
                  />
                </Pressable>

                {/* CHAT */}

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.chatButton,
                  ]}
                  onPress={() =>
                    router.push("/")
                  }
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={21}
                    color="#FF3D71"
                  />
                </Pressable>

                {/* LIKE */}

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.likeButton,
                  ]}
                  onPress={handleLike}
                >
                  <Ionicons
                    name="heart"
                    size={25}
                    color="#FFFFFF"
                  />
                </Pressable>

                {/* COMMENT */}

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.commentButton,
                  ]}
                >
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={21}
                    color="#FF3D71"
                  />
                </Pressable>

              </View>

            </View>
          </View>

          {/* NEW PEOPLE */}

          <View style={styles.newPeopleHeader}>

            <View style={styles.newPeopleTitleRow}>

              <View style={styles.sparkleIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={18}
                  color="#FF3D71"
                />
              </View>

              <View>
                <Text
                  style={styles.newPeopleTitle}
                >
                  New people
                </Text>

                <Text
                  style={
                    styles.newPeopleSubtitle
                  }
                >
                  Recently joined LUMORA
                </Text>
              </View>

            </View>

            <Pressable>
              <Text style={styles.seeAll}>
                See all
              </Text>
            </Pressable>

          </View>

          {/* SMALL PROFILE LIST */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.peopleRow
            }
          >

            {people.map((item) => (
              <Pressable
                key={item.id}
                style={styles.smallCard}
              >

                <View
                  style={styles.smallImage}
                >
                  <Ionicons
                    name="person"
                    size={40}
                    color="#FF3D71"
                  />

                  <View
                    style={styles.smallOnline}
                  />
                </View>

                <Text
                  style={styles.smallName}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text style={styles.smallAge}>
                  {item.age} • {item.distance}
                </Text>

              </Pressable>
            ))}

          </ScrollView>

          {/* BOTTOM SPACE */}

          <View style={styles.bottomSpace} />

        </ScrollView>

        {/* BOTTOM NAVIGATION */}

        <View style={styles.bottomNav}>

          <BottomButton
            icon="heart-outline"
            active={false}
            label="Likes"
            onPress={() =>
              router.push("/")
            }
          />

          <BottomButton
            icon="location-outline"
            active={true}
            label="Nearby"
            onPress={() =>
              setActiveTab("nearby")
            }
          />

          <BottomButton
            icon="chatbubble-outline"
            active={false}
            label="Chat"
            onPress={() =>
              router.push("/")
            }
          />

          <BottomButton
            icon="person-outline"
            active={false}
            label="Profile"
            onPress={() =>
              router.push("/")
            }
          />

        </View>
      </View>
    </ResponsiveScreen>
  );
}

/* TAB BUTTON */

function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active && styles.tabActive,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.tabTextActive,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* BOTTOM BUTTON */

function BottomButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.bottomButton}
      onPress={onPress}
    >
      <View
        style={[
          styles.bottomIcon,
          active && styles.bottomIconActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            active
              ? "#FF3D71"
              : "#71717A"
          }
        />
      </View>

      <Text
        style={[
          styles.bottomLabel,
          active &&
            styles.bottomLabelActive,
        ]}
      >
        {label}
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
    paddingTop: 20,
    paddingBottom: 100,
  },

  /* HEADER */

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FF3D71",
    letterSpacing: 2,
  },

  headerRight: {
    flexDirection: "row",
    gap: 8,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF3D71",
    top: 9,
    right: 9,
  },

  /* GREETING */

  greeting: {
    marginTop: 28,
  },

  greetingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#71717A",
  },

  userName: {
    marginTop: 2,
    fontSize: 28,
    fontWeight: "900",
    color: "#18181B",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#71717A",
  },

  /* SEARCH */

  searchBox: {
    height: 54,
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 7,
  },

  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#A1A1AA",
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF6F8",
    alignItems: "center",
    justifyContent: "center",
  },

  /* TABS */

  tabs: {
    flexDirection: "row",
    marginTop: 20,
    gap: 9,
  },

  tab: {
    paddingHorizontal: 17,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE6ED",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  tabActive: {
    backgroundColor: "#FF3D71",
    borderColor: "#FF3D71",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717A",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 27,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#18181B",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#A1A1AA",
  },

  seeAll: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF3D71",
  },

  /* PROFILE CARD */

  profileCard: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
    overflow: "hidden",
  },

  profileImage: {
    height: 330,
    backgroundColor: "#FFF6F8",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6F8",
  },

  onlineBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF3D71",
  },

  onlineText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#18181B",
  },

  cardHeart: {
    position: "absolute",
    right: 15,
    top: 15,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    padding: 18,
  },

  profileName: {
    fontSize: 23,
    fontWeight: "900",
    color: "#18181B",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  location: {
    marginLeft: 4,
    fontSize: 12,
    color: "#71717A",
  },

  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
  },

  interestTag: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#FFF6F8",
  },

  interestText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF3D71",
  },

  /* ACTIONS */

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 19,
  },

  actionButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  passButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F7F7F8",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },

  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF6F8",
    borderWidth: 1,
    borderColor: "#FFE6ED",
  },

  likeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FF3D71",
  },

  commentButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF6F8",
    borderWidth: 1,
    borderColor: "#FFE6ED",
  },

  /* NEW PEOPLE */

  newPeopleHeader: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  newPeopleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sparkleIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFE6ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  newPeopleTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#18181B",
  },

  newPeopleSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#A1A1AA",
  },

  peopleRow: {
    gap: 12,
    marginTop: 14,
  },

  smallCard: {
    width: 105,
    padding: 9,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6ED",
  },

  smallImage: {
    width: 87,
    height: 105,
    borderRadius: 14,
    backgroundColor: "#FFF6F8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  smallOnline: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3D71",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  smallName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#18181B",
  },

  smallAge: {
    marginTop: 2,
    fontSize: 9,
    color: "#71717A",
  },

  bottomSpace: {
    height: 20,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFE6ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },

  bottomButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomIcon: {
    width: 35,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomIconActive: {
    backgroundColor: "#FFF6F8",
    borderRadius: 15,
  },

  bottomLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: "#71717A",
  },

  bottomLabelActive: {
    color: "#FF3D71",
  },
});