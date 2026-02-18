import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LeafletMap from '../components/LeafletMap';
import Navbar from '../components/Navbar';
import * as FM from '../util/file-manager';

const DEFAULT_LOCATION = { // a def dans un fichier pour la récup
  latitude: 48.8666,
  longitude: 2.3333,
};

const FACTION_COLORS = {
  ROUGE: '#aa1111',
  BLEU:  '#1133bb',
};

const MainMap = ({ navigation }) => {
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    FM.read_file('character.json').then((data) => {
      if (data) setCharacter(data);
    });
  }, []);

  const factionColor = FACTION_COLORS[character?.IdFaction] ?? '#2a2a2a';

  return (
    <View style={styles.main}>

      {/* MAP + HUD */}
      <View style={styles.mapContainer}>
        <LeafletMap
          latitude={DEFAULT_LOCATION.latitude}
          longitude={DEFAULT_LOCATION.longitude}
          selectable={true}
          onLocationChange={() => null}
          onMapTouchStart={() => null}
          onMapTouchEnd={() => null}
        />

        {/* HUD TOP — identity */}
        <View style={styles.hudTop}>
          <View style={[styles.factionBar, { backgroundColor: factionColor }]} />
          <View style={styles.hudTopInner}>
            <View>
              <Text style={styles.nickname}>
                {character ? character.Nickname : '— AUCUN PROFIL —'}
              </Text>
              <Text style={styles.classe}>
                {character ? character.IdClasse.toUpperCase() : ''}
              </Text>
            </View>
            {character && (
              <Text style={styles.level}>NV.{character.NiveauJoueur}</Text>
            )}
          </View>
        </View>

        {/* HUD BOTTOM — stats */}
        {character && (
          <View style={styles.hudStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>OR</Text>
              <Text style={styles.statValue}>{character.OrJoueur}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>XP</Text>
              <Text style={styles.statValue}>{character.xpJoueur}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ZONES</Text>
              <Text style={styles.statValue}>{character.NbZoneCapturee}</Text>
            </View>
          </View>
        )}
      </View>

      {/* NAVBAR */}
      <Navbar navigation={navigation} />

    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },

  /* HUD TOP */
  hudTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 8, 8, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  factionBar: {
    width: 3,
  },
  hudTopInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  nickname: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  classe: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#444',
    letterSpacing: 3,
    marginTop: 3,
  },
  level: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#d4a820',
    letterSpacing: 2,
  },

  /* HUD BOTTOM */
  hudStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 8, 8, 0.88)',
    borderTopWidth: 1,
    borderTopColor: '#161616',
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#444',
    letterSpacing: 3,
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 1,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    backgroundColor: '#161616',
    marginVertical: 4,
  },
});

export default MainMap;
