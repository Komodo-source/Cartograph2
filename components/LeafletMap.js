import React, { useRef, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({ latitude = 9.3077, longitude = 2.3158, selectable = false, onLocationChange, onMapTouchStart, onMapTouchEnd }) => {
  const webViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hexTouched, setHexTouched] = useState(null);

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
        maxZoom: 19
      }).addTo(map);

      function createHex(lat, lng, size) {
        var points = [];
        for (var i = 0; i < 6; i++) {
          var angle_rad = Math.PI / 180 * (60 * i);
          points.push([lat + size * Math.cos(angle_rad), lng + size * Math.sin(angle_rad)]);
        }
        return points;
      }

      function getHexId(lat, lng) {
        return Math.round(lat * 1000) + "_" + Math.round(lng * 1000);
      }

      function spawnHex(lat, lng) {
        var size = 0.0005;
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
        var offset = 0.001;
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

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "HEX_TOUCHED") {
        handleHexTouch(data);
      }
    } catch (e) {}
  };

  const start_capture = (hexData) => {
    // TODO:
    // - retirer de l'or
    // - ajouter l'xp
    // - mettre en période de vulnérabilité aléatoire
    // - envoyer à la BD
    // - update les infos locales
    console.log("Capture lancée sur:", hexData);
    setModalVisible(false);
  };

  const handleHexTouch = (hexData) => {
    console.log("Hex touché:", hexData);
    setHexTouched(hexData);
    setModalVisible(true);
  };

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
              <Text style={styles.modalTitle}>⬡ Point de Contrôle</Text>
              <Text style={styles.modalCoords}>
                {hexTouched.lat?.toFixed(5)} , {hexTouched.lng?.toFixed(5)}
              </Text>

              <View style={styles.separator} />

              <Text style={styles.modalInfo}>💰 Prix : 15 Gold</Text>
              <Text style={styles.modalInfo}>⏱ Vulnérabilité : 2h</Text>
              <Text style={styles.modalInfo}>✨ XP : 20</Text>

              <View style={styles.separator} />

              <View style={styles.modalInfluence}>
                <Text style={styles.redText}>🔴 Rouge : {hexTouched.influence?.red ?? 0}</Text>
                <Text style={styles.blueText}>🔵 Bleu : {hexTouched.influence?.blue ?? 0}</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.btnInstall}
                  onPress={() => start_capture(hexTouched)}
                >
                  <Text style={styles.btnText}>Installer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={true}
        automaticallyAdjustContentInsets={false}
        mixedContentMode="always"
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalCoords: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  modalInfo: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 4,
  },
  modalInfluence: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  redText: {
    color: '#f87171',
    fontWeight: 'bold',
  },
  blueText: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  btnInstall: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#475569',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LeafletMap;
