import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SideMenu({
  visible,
  onClose,
}: SideMenuProps) {
  const navigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = () => {
    onClose();

    // Backend logout will be added later.
    console.log("Logout clicked");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Dark background */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        {/* Drawer */}
        <SafeAreaView style={styles.drawer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                style={styles.profileImage}
              />

              <View style={styles.onlineDot} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                Diwakar, 28
              </Text>

              <Pressable
                onPress={() => navigate("/profile")}
              >
                <Text style={styles.viewProfile}>
                  View Profile
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={22}
                color="#555"
              />
            </Pressable>
          </View>

          {/* Premium Card */}
          <Pressable
            style={styles.premiumCard}
            onPress={() => navigate("/premium")}
          >
            <View style={styles.premiumIcon}>
              <Ionicons
                name="diamond"
                size={21}
                color="#FFB800"
              />
            </View>

            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>
                Upgrade to Premium
              </Text>

              <Text style={styles.premiumSubtitle}>
                Unlock more features
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#999"
            />
          </Pressable>

          {/* Main Menu */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>
              MENU
            </Text>

            <MenuItem
              icon="person-outline"
              label="My Profile"
              onPress={() => navigate("/profile")}
            />

            <MenuItem
              icon="heart-outline"
              label="Likes"
              onPress={() => navigate("/likes")}
            />

            <MenuItem
              icon="diamond-outline"
              label="Premium"
              onPress={() => navigate("/premium")}
            />

            <MenuItem
              icon="card-outline"
              label="Payments"
              onPress={() => navigate("/payments")}
            />

            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => navigate("/settings")}
            />

            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy & Safety"
              onPress={() => navigate("/settings/privacy")}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Support */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>
              SUPPORT
            </Text>

            <MenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {}}
            />

            <MenuItem
              icon="information-circle-outline"
              label="About Lumora"
              onPress={() => {}}
            />
          </View>

          <View style={styles.bottomSection}>
            {/* Logout */}
            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <View style={styles.logoutIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={21}
                  color="#E53935"
                />
              </View>

              <Text style={styles.logoutText}>
                Logout
              </Text>
            </Pressable>

            <Text style={styles.version}>
              Lumora v1.0.0
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/* =========================================================
   MENU ITEM
========================================================= */

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#555"
        />
      </View>

      <Text style={styles.menuText}>
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#C5C5C5"
      />
    </Pressable>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.84,
    maxWidth: 360,
    backgroundColor: "#FFF8FA",
    paddingHorizontal: 18,
  },

  /* ================= PROFILE ================= */

  profileHeader: {
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  profileImageWrapper: {
    position: "relative",
  },

  profileImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  onlineDot: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#27C93F",
    borderWidth: 3,
    borderColor: "#FFF8FA",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },

  viewProfile: {
    marginTop: 5,
    fontSize: 13,
    color: "#FF3D71",
    fontWeight: "700",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= PREMIUM ================= */

  premiumCard: {
    backgroundColor: "#FFF1C9",
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  premiumContent: {
    flex: 1,
    marginLeft: 11,
  },

  premiumTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5F4800",
  },

  premiumSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#866D20",
  },

  /* ================= MENU ================= */

  menuSection: {
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#A3A3A3",
    letterSpacing: 1,
    marginBottom: 7,
    paddingLeft: 8,
  },

  menuItem: {
    height: 53,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  menuItemPressed: {
    backgroundColor: "#FFE8EF",
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#EDE2E5",
    marginVertical: 8,
  },

  /* ================= BOTTOM ================= */

  bottomSection: {
    marginTop: "auto",
    paddingBottom: 10,
  },

  logoutButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFF0F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  logoutIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#E53935",
    fontWeight: "700",
  },

  version: {
    textAlign: "center",
    marginTop: 12,
    color: "#AAAAAA",
    fontSize: 11,
  },
});