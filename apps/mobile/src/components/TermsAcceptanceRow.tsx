import React from 'react';
import {
  GestureResponderEvent,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '../constants/legal';

type Props = {
  accepted: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** Dark pitch auth screens use light text; Settings-style can pass dark. */
  light?: boolean;
};

/**
 * Required Terms + Privacy acceptance control shown before register/login.
 */
export default function TermsAcceptanceRow({
  accepted,
  onToggle,
  disabled,
  light = true,
}: Props) {
  const textColor = light ? '#cbd5e1' : '#334155';
  const linkColor = light ? '#c7f349' : '#0f766e';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{checked: accepted}}
      accessibilityLabel="Accept Terms of Use and Privacy Policy">
      <View style={[styles.box, accepted && styles.boxChecked]}>
        {accepted ? (
          <Ionicons name="checkmark" size={14} color="#030712" />
        ) : null}
      </View>
      <Text style={[styles.label, {color: textColor}]}>
        I agree to the{' '}
        <Text
          style={{color: linkColor}}
          onPress={(e: GestureResponderEvent) => {
            e.stopPropagation();
            void Linking.openURL(TERMS_OF_SERVICE_URL);
          }}>
          Terms of Use
        </Text>{' '}
        and{' '}
        <Text
          style={{color: linkColor}}
          onPress={(e: GestureResponderEvent) => {
            e.stopPropagation();
            void Linking.openURL(PRIVACY_POLICY_URL);
          }}>
          Privacy Policy
        </Text>
        . Fucci has zero tolerance for objectionable content or abusive users.
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: '#c7f349',
    borderColor: '#c7f349',
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
