import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FM from '../util/file-manager';

const CLASSES = [
  {
    id: 'vanguard',
    title: 'VANGUARD',
    subtitle: 'Assaut',
    description:
      'Capture les points de contrôle plus rapidement. Premier sur le front.',
  },
  {
    id: 'architecte',
    title: 'ARCHITECTE',
    subtitle: 'Sémantique',
    description:
      'Renforce les points de contrôle acquis. Fortifie les lignes alliées.',
  },
  {
    id: 'saboteur',
    title: 'SABOTEUR',
    subtitle: 'Truand',
    description:
      "Fragilise les points ennemis. Perturbe l'organisation adverse.",
  },
];

const TEAMS = ['ROUGE', 'BLEU'];

const generateId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const CreationPerso = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const isReady =
    nickname.trim().length > 0 &&
    selectedClass !== null &&
    selectedTeam !== null;

  const handleSave = async () => {
    if (!isReady) return;

    const characterData = {
      IdJoueur: generateId(),
      Nickname: nickname.trim(),
      OrJoueur: 0,
      xpJoueur: 0,
      NiveauJoueur: 1,
      NbZoneCapturee: 0,
      IdFaction: selectedTeam,
      IdClasse: selectedClass,
    };

    await FM.save_storage_local_storage_data(characterData, 'character.json');
    navigation.navigate('MainMap');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>// CRÉATION</Text>
      <Text style={styles.subheader}>NOUVEAU SOLDAT</Text>

      {/* Pseudo */}
      <View style={styles.section}>
        <Text style={styles.label}>PSEUDO</Text>
        <TextInput
          style={styles.input}
          placeholder="pseudo"
          placeholderTextColor="#2a2a2a"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="characters"
          maxLength={16}
        />
      </View>

      {/* Classe */}
      <View style={styles.section}>
        <Text style={styles.label}>CLASSE</Text>
        {CLASSES.map((cls) => {
          const active = selectedClass === cls.id;
          return (
            <TouchableOpacity
              key={cls.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelectedClass(cls.id)}
              activeOpacity={0.7}
            >
              {active && <View style={styles.cardAccent} />}
              <View style={styles.cardHeader}>
                <Text
                  style={[styles.cardTitle, active && styles.cardTitleActive]}
                >
                  {cls.title}
                </Text>
                <Text style={styles.cardSubtitle}>{cls.subtitle}</Text>
              </View>
              <Text style={styles.cardDesc}>{cls.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Équipe */}
      <View style={styles.section}>
        <Text style={styles.label}>ÉQUIPE</Text>
        <View style={styles.teamRow}>
          {TEAMS.map((team) => {
            const active = selectedTeam === team;
            const isRed = team === 'ROUGE';
            return (
              <TouchableOpacity
                key={team}
                style={[
                  styles.teamBtn,
                  active && (isRed ? styles.teamBtnRed : styles.teamBtnBlue),
                ]}
                onPress={() => setSelectedTeam(team)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.teamText, active && styles.teamTextActive]}
                >
                  {team}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bouton confirmer */}
      <TouchableOpacity
        style={[styles.saveBtn, !isReady && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!isReady}
        activeOpacity={0.7}
      >
        <Text style={[styles.saveText, !isReady && styles.saveTextDisabled]}>
          CONFIRMER
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333',
    letterSpacing: 3,
    marginBottom: 4,
  },
  subheader: {
    fontFamily: 'monospace',
    fontSize: 26,
    color: '#ffffff',
    letterSpacing: 6,
    fontWeight: 'bold',
    marginBottom: 44,
  },
  section: {
    marginBottom: 36,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#444',
    letterSpacing: 4,
    marginBottom: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'monospace',
    paddingVertical: 10,
    letterSpacing: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: '#161616',
    padding: 16,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: '#d4a820',
    backgroundColor: '#0d0b03',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#d4a820',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#555',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  cardTitleActive: {
    color: '#d4a820',
  },
  cardSubtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#333',
    letterSpacing: 1,
  },
  cardDesc: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#444',
    lineHeight: 18,
  },
  teamRow: {
    flexDirection: 'row',
    gap: 10,
  },
  teamBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#161616',
    paddingVertical: 16,
    alignItems: 'center',
  },
  teamBtnRed: {
    borderColor: '#aa1111',
    backgroundColor: '#130303',
  },
  teamBtnBlue: {
    borderColor: '#1133bb',
    backgroundColor: '#030510',
  },
  teamText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    letterSpacing: 5,
  },
  teamTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    borderWidth: 1,
    borderColor: '#d4a820',
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    borderColor: '#161616',
  },
  saveText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4a820',
    letterSpacing: 7,
  },
  saveTextDisabled: {
    color: '#2a2a2a',
  },
});

export default CreationPerso;
