import React from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';

type ResponsiveScreenProps = {
  children: React.ReactNode;
};

export default function ResponsiveScreen({
  children,
}: ResponsiveScreenProps) {
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.app,
          isWeb && {
            maxWidth: 480,
          },
          width < 480 && {
            maxWidth: '100%',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#080808',
  },

  app: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#080808',
  },
});