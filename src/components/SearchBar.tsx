import React, { useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  isVisible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search matches...',
  isVisible,
  onClose,
}) => {
  const slideAnim = React.useRef(new Animated.Value(width)).current;
  const [isAnimationComplete, setIsAnimationComplete] = React.useState(
    !isVisible
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsAnimationComplete(!isVisible);
      }
    });
  }, [isVisible, slideAnim]);

  if (!isVisible && isAnimationComplete) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
      ]}
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#666"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor="#666"
          returnKeyType="search"
          autoFocus={isVisible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 ? (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onClose} style={styles.clearButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingRight: 8,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
