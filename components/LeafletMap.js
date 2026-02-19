import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { supabase } from '../util/supabase';
import * as fm from '../util/file-manager';

const LeafletMap = ({
  latitude = 48.86666,
  longitude = 2.333333,
  selectable = false,
  onLocationChange,
  onMapTouchStart,
  onMapTouchEnd,
}) => {
  const webViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hexTouched, setHexTouched] = useState(null);
  const [structure, setStruct] = useState([]);
  const [PointAncrage, setPointAncrage] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);

  const structIconUri = Image.resolveAssetSource(require('../assets/testStruct.png')).uri;

  const leafletHTML = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: #0f172a; }
        .leaflet-container { background: #0f172a; }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      </head>
      <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>

      var playerTeam = "red";
      var influence = {};

      var map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 16);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 35
      }).addTo(map);

      function createHex(lat, lng, size) {
        var points = [];
        for (var i = 0; i < 6; i++) {
          var angle_rad = Math.PI / 180 * (60 * i);
          points.push([lat + size * Math.cos(angle_rad) , lng  + size * Math.sin(angle_rad)]);
        }
        return points;
      }

      function getHexId(lat, lng) {
        return Math.round(lat * 1000) + "_" + Math.round(lng * 1000);
      }

      function spawnHex(lat, lng) {
        var size = 0.0008;
        var id = getHexId(lat, lng);

        if (!influence[id]) influence[id] = { red: 0, blue: 0 };

        var hex = L.polygon(createHex(lat, lng, size), {
          color: "#334155",
          weight: 1,
          fillColor: "#1e293b",
          fillOpacity: 0.4
        }).addTo(map);

        hex.on("click", function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "HEX_TOUCHED",
            id: id,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            influence: influence[id]
          }));
        });
      }

      function generateGrid(centerLat, centerLng) {
        var offset = 0.002;
        for (var x = -3; x <= 3; x++) {
          for (var y = -3; y <= 3; y++) {
            spawnHex(centerLat + x * offset, centerLng + y * offset);
          }
        }
      }

      generateGrid(${latitude}, ${longitude});

      L.circleMarker([${latitude}, ${longitude}], {
        radius: 8,
        color: "red",
        fillOpacity: 1
      }).addTo(map);

      </script>
      </body>
      </html>
  `;

  {
    /* server side function */
  }
  const getStructure = async () => {
    try {
      const { data, error } = await supabase.from('pointimportant').select('*');

      if (error) {
        console.log('getStructure error', error);
      } else {
        console.log('getStructure ok', data);
        setStruct(data);
      }
    } catch (e) {
      console.log('getStructure exception', e);
    }
  };

  const getPointAncrage = async () => {
    try {
      const { data, error } = await supabase.from('pointancrage').select('*');

      if (error) {
        console.log('getPointAncrage error', error);
      } else {
        console.log('getPointAncrage ok', data);
        setPointAncrage(data);
      }
    } catch (e) {
      console.log('getPointAncrage exception', e);
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HEX_TOUCHED') {
        handleHexTouch(data);
      }
    } catch (e) {}
  };



  const start_capture = async (hexData) => {
    // TODO:
    // - retirer de l'or
    // - ajouter l'xp
    // - mettre en période de vulnérabilité aléatoire
    // - envoyer à la BD
    // - update les infos locales

    const zoneId = hexData.id;
    let { data: zone } = await supabase
      .from('zone')
      .select('*')
      .eq('IdZone', zoneId)
      .single();

    if (!zone) {
      await supabase.from('zone').insert([
        {
          IdZone: zoneId,
          center_lat: hexData.lat,
          center_lng: hexData.lng,
          influenceRouge: 0,
          influenceBleu: 0,
        },
      ]);
    }

    const { data: existing } = await supabase
      .from('pointancrage')
      .select('*')
      .eq('IdZone', zoneId)
      .single();

    if (existing) {
      Alert.alert('Zone occupée');
      return;
    }
    /*
    const local_data = await fm.read_file("character.json");
    if(local_data.OrJoueur < 20){
      Alert.alert("Or", "Pas assez d'or");
      return ;
    }*/

    await supabase
      .from('joueur')
      .update({
        OrJoueur: local_data.OrJoueur - 20,
        xp: local_data.xp + 20,
      })
      .eq('IdJoueur', local_data.IdJoueur);

    await supabase.from('pointancrage').insert([
      {
        IdJoueur: local_data.IdJoueur,
        IdZone: zoneId,
        pv: 100,
        dateInstallation: new Date().toISOString(),
        dateVulnerable: new Date(
          Date.now() + Math.random() * 7200000,
        ).toISOString(),
      },
    ]);
    await supabase
      .from('zone')
      .update({
        influenceRouge: zone.influenceRouge + 10,
      })
      .eq('IdZone', zoneId);

    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'REFRESH_ZONE',
        zoneId: zoneId,
      }),
    );
  };

  const placeStruct = (data) => {
    const js = `
      var structIcon = L.icon({
        iconUrl: '${structIconUri}',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
      var points = ${JSON.stringify(data)};
      points.forEach(function(point) {
        L.marker([point.latitude, point.longitude], { icon: structIcon })
          .addTo(map)
          .bindPopup(point.nompointimportant);
      });
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  const handleHexTouch = (hexData) => {
    console.log('Hex touché:', hexData);
    setHexTouched(hexData);
    setModalVisible(true);
  };

  useEffect(() => {
    getStructure();
  }, []);

  useEffect(() => {
    if (mapLoaded && structure.length > 0) {
      placeStruct(structure);
    }
  }, [mapLoaded, structure]);

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {hexTouched && (
            <View style={styles.modalCard}>
              <View style={styles.modalAccent} />
              <View style={styles.modalInner}>
                <Text style={styles.modalHeader}>// ZONE</Text>
                <Text style={styles.modalTitle}>PT. DE CONTROLE</Text>
                <Text style={styles.modalCoords}>
                  {hexTouched.lat?.toFixed(5)} , {hexTouched.lng?.toFixed(5)}
                </Text>

                <View style={styles.separator} />

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>ANCRAGE</Text>
                  <Text style={styles.statValue}>15 OR</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>EXPOSITION</Text>
                  <Text style={styles.statValue}>2H</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>EXPERIENCE</Text>
                  <Text style={styles.statValue}>+20 XP</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.influenceRow}>
                  <Text style={styles.redText}>
                    ROUGE {hexTouched.influence?.red ?? 0}
                  </Text>
                  <Text style={styles.blueText}>
                    BLEU {hexTouched.influence?.blue ?? 0}
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.btnInstall}
                    onPress={() => start_capture(hexTouched)}
                  >
                    <Text style={styles.btnInstallText}>INSTALLER</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>FERMER</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={true}
        automaticallyAdjustContentInsets={false}
        mixedContentMode="always"
        onLoad={() => setMapLoaded(true)}
        onTouchStart={onMapTouchStart}
        onTouchEnd={onMapTouchEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    flexDirection: 'row',
  },
  modalAccent: {
    width: 2,
    backgroundColor: '#d4a820',
  },
  modalInner: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#333',
    letterSpacing: 3,
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 4,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalCoords: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#2a2a2a',
    letterSpacing: 1,
    marginBottom: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#161616',
    marginVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#444',
    letterSpacing: 3,
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 2,
  },
  influenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  redText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#aa1111',
    letterSpacing: 2,
  },
  blueText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#1133bb',
    letterSpacing: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  btnInstall: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#d4a820',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnInstallText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#d4a820',
    letterSpacing: 3,
  },
  btnCancelText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333',
    letterSpacing: 3,
  },
});

export default LeafletMap;
