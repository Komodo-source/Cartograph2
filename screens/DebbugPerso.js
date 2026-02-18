import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as FM from '../util/file-manager';
import Navbar from '../components/Navbar';

const FILE = 'character.json';

const DebbugPerso = ({ navigation }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [status, setStatus] = useState('');

  const loadCurrent = async () => {
    const data = await FM.read_file(FILE);
    if (data !== null) {
      setCurrentFile(JSON.stringify(data, null, 2));
      setStatus('Fichier chargé');
    } else {
      setCurrentFile(null);
      setStatus('Aucun fichier existant');
    }
  };

  useEffect(() => {
    loadCurrent();
  }, []);

  const handleSave = async () => {
    let parsed;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e) {
      Alert.alert('JSON invalide', 'Vérifie la syntaxe JSON avant de sauvegarder.');
      return;
    }
    await FM.save_storage_local_storage_data(parsed, FILE);
    setStatus('Sauvegardé !');
    loadCurrent();
  };

  const handleClear = async () => {
    await FM.save_storage_local_storage_data({}, FILE);
    setJsonInput('');
    setStatus('Fichier réinitialisé');
    loadCurrent();
  };

  const handleDelete = async () => {
    await FM.delete_file(FILE);
    setCurrentFile(null);
    setJsonInput('');
    setStatus('Fichier supprimé');
  };

  const handleFill = (preset) => {
    setJsonInput(JSON.stringify(preset, null, 2));
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>// DEBUG</Text>
        <Text style={styles.subheader}>CHARACTER.JSON</Text>

        {/* Presets */}
        <Text style={styles.label}>PRESETS RAPIDES</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleFill({ IdJoueur: 'debug-0001', Nickname: 'DEBUG', OrJoueur: 500, xpJoueur: 1200, NiveauJoueur: 3, NbZoneCapturee: 7, IdFaction: 'ROUGE', IdClasse: 'vanguard' })}
          >
            <Text style={styles.presetText}>ROUGE / VANGUARD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleFill({ IdJoueur: 'debug-0002', Nickname: 'TEST', OrJoueur: 200, xpJoueur: 300, NiveauJoueur: 1, NbZoneCapturee: 2, IdFaction: 'BLEU', IdClasse: 'saboteur' })}
          >
            <Text style={styles.presetText}>BLEU / SABOTEUR</Text>
          </TouchableOpacity>
        </View>

        {/* JSON input */}
        <Text style={styles.label}>JSON À ÉCRIRE</Text>
        <TextInput
          style={styles.jsonInput}
          value={jsonInput}
          onChangeText={setJsonInput}
          multiline
          placeholder={'{\n  "Nickname": "...",\n  "IdFaction": "ROUGE",\n  "IdClasse": "vanguard"\n}'}
          placeholderTextColor="#2a2a2a"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
            <Text style={styles.btnText}>SAUVEGARDER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleClear}>
            <Text style={styles.btnTextSecondary}>VIDER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDanger} onPress={handleDelete}>
            <Text style={styles.btnTextDanger}>SUPPRIMER</Text>
          </TouchableOpacity>
        </View>

        {status !== '' && (
          <Text style={styles.status}>{status}</Text>
        )}

        {/* Current file */}
        <Text style={styles.label}>CONTENU ACTUEL</Text>
        <View style={styles.currentBox}>
          <Text style={styles.currentText}>
            {currentFile ?? '— aucun fichier —'}
          </Text>
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={loadCurrent}>
          <Text style={styles.btnTextSecondary}>RECHARGER</Text>
        </TouchableOpacity>
      </ScrollView>

      <Navbar navigation={navigation} active="DebbugPerso" />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080808',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
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
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: 6,
    fontWeight: 'bold',
    marginBottom: 36,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#444',
    letterSpacing: 4,
    marginBottom: 10,
    marginTop: 20,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  presetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 10,
    alignItems: 'center',
  },
  presetText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
  },
  jsonInput: {
    borderWidth: 1,
    borderColor: '#222',
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 13,
    padding: 12,
    minHeight: 160,
    textAlignVertical: 'top',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  btnSave: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#d4a820',
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDanger: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aa1111',
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#d4a820',
    letterSpacing: 3,
  },
  btnTextSecondary: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#555',
    letterSpacing: 3,
  },
  btnTextDanger: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#aa1111',
    letterSpacing: 3,
  },
  status: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#d4a820',
    letterSpacing: 2,
    marginTop: 12,
    textAlign: 'center',
  },
  currentBox: {
    borderWidth: 1,
    borderColor: '#161616',
    backgroundColor: '#0a0a0a',
    padding: 12,
    minHeight: 80,
  },
  currentText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
  },
});

export default DebbugPerso;
