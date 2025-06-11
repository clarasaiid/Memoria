import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

export default function CustomDateTimePicker({ value, onChange, minimumDate }: CustomDateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };
  
  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString(undefined, options);
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const newDate = new Date(tempDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      
      setTempDate(newDate);
      if (Platform.OS === 'ios') {
        onChange(newDate);
      } else {
        onChange(newDate);
      }
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const newDate = new Date(tempDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      
      setTempDate(newDate);
      if (Platform.OS === 'ios') {
        onChange(newDate);
      } else {
        onChange(newDate);
      }
    }
  };
  
  // Web: use native HTML inputs
  if (Platform.OS === 'web') {
    const handleDateChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateStr = e.target.value;
      if (!dateStr) return;
      const [year, month, day] = dateStr.split('-').map(Number);
      const newDate = new Date(tempDate);
      newDate.setFullYear(year);
      newDate.setMonth(month - 1);
      newDate.setDate(day);
      setTempDate(newDate);
      onChange(newDate);
    };
    const handleTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
      const timeStr = e.target.value;
      if (!timeStr) return;
      const [hour, minute] = timeStr.split(':').map(Number);
      const newDate = new Date(tempDate);
      newDate.setHours(hour);
      newDate.setMinutes(minute);
      setTempDate(newDate);
      onChange(newDate);
    };
    const dateValue = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
    const timeValue = `${String(tempDate.getHours()).padStart(2, '0')}:${String(tempDate.getMinutes()).padStart(2, '0')}`;
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <input
          type="date"
          value={dateValue}
          min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
          onChange={handleDateChangeWeb}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
        />
        <input
          type="time"
          value={timeValue}
          onChange={handleTimeChangeWeb}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity 
          style={styles.dateContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={16} color="#64748B" />
          <Text style={styles.dateText}>{formatDate(value)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.timeContainer}
          onPress={() => setShowTimePicker(true)}
        >
          <Clock size={16} color="#64748B" />
          <Text style={styles.timeText}>{formatTime(value)}</Text>
        </TouchableOpacity>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
});