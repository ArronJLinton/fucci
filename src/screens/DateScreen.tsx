import React from 'react';
import {Text, StyleSheet, View} from 'react-native';

interface DateScreenProps {
  date: Date;
  isSelected?: boolean;
}

const formatDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return formatter.format(date);
};

const getRelativeDay = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return '';
};

const DateScreen: React.FC<DateScreenProps> = ({date, isSelected = false}) => {
  const formattedDate = formatDate(date);
  const relativeDay = getRelativeDay(date);

  // Add debug logging
  console.log('DateScreen rendering:', {
    receivedDate: date.toISOString(),
    formattedDate,
    relativeDay,
  });

  return (
    <View style={styles.container}>
      <View style={[styles.card, isSelected && styles.selectedCard]}>
        <View style={styles.content}>
          {relativeDay ? (
            <Text
              style={[styles.relativeDay, isSelected && styles.selectedText]}>
              {relativeDay}
            </Text>
          ) : null}
          <Text style={[styles.dateText, isSelected && styles.selectedText]}>
            {formattedDate}
          </Text>
          <View style={styles.separator} />
          <Text style={[styles.contentText, isSelected && styles.selectedText]}>
            Schedule for {relativeDay.toLowerCase() || formattedDate}
          </Text>
          {/* Add debug text */}
          <Text style={styles.debugText}>ISO: {date.toISOString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    minHeight: 150,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
    shadowColor: '#2196f3',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  relativeDay: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 12,
  },
  selectedText: {
    color: '#1976d2',
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
  },
});

export default React.memo(DateScreen, (prev, next) => {
  return (
    prev.date.getTime() === next.date.getTime() &&
    prev.isSelected === next.isSelected
  );
});
