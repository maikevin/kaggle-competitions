import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, RadioButton, Divider } from 'react-native-paper';
import { useFontSize, FontSize, getFontSizeLabel } from '../contexts/FontSizeContext';

export default function SettingsScreen() {
  const { fontSize, setFontSize, fontScale } = useFontSize();

  const fontSizes: FontSize[] = ['small', 'medium', 'large', 'extra-large', 'extra-extra-large'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * fontScale }]}>Font Size</Text>
        <Text style={[styles.sectionDescription, { fontSize: 14 * fontScale }]}>
          Choose a font size that's comfortable for you
        </Text>
      </View>

      <Divider />

      <RadioButton.Group onValueChange={(value) => setFontSize(value as FontSize)} value={fontSize}>
        {fontSizes.map((size) => (
          <View key={size} style={styles.radioItem}>
            <RadioButton.Item
              label={getFontSizeLabel(size)}
              value={size}
              labelStyle={[styles.radioLabel, { fontSize: 16 * fontScaleMap[size] }]}
              color="#6200ee"
            />
          </View>
        ))}
      </RadioButton.Group>

      <Divider />

      <View style={styles.previewSection}>
        <Text style={[styles.previewTitle, { fontSize: 16 * fontScale }]}>Preview</Text>
        <View style={styles.previewCard}>
          <Text style={[styles.previewTime, { fontSize: 32 * fontScale }]}>7:30 AM</Text>
          <Text style={[styles.previewLabel, { fontSize: 16 * fontScale }]}>Wake up</Text>
          <Text style={[styles.previewSubtext, { fontSize: 14 * fontScale }]}>Weekdays</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const fontScaleMap: Record<FontSize, number> = {
  'small': 0.85,
  'medium': 1.0,
  'large': 1.15,
  'extra-large': 1.3,
  'extra-extra-large': 1.5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#666666',
  },
  radioItem: {
    backgroundColor: '#ffffff',
  },
  radioLabel: {
    color: '#000000',
  },
  previewSection: {
    padding: 16,
    marginTop: 16,
  },
  previewTitle: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewTime: {
    fontWeight: 'bold',
    color: '#000000',
  },
  previewLabel: {
    color: '#333333',
    marginTop: 4,
  },
  previewSubtext: {
    color: '#666666',
    marginTop: 2,
  },
});
