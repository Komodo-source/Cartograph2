import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({ latitude = 9.3077, longitude = 2.3158, selectable = false, onLocationChange, onMapTouchStart, onMapTouchEnd }) => {
  const webViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Build the JS for selectable mode
  const selectableJS = `
    function updateMarker(lat, lng) {
      marker.setLatLng([lat, lng]);
      window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
    }
    map.on('click', function(e) {
      updateMarker(e.latlng.lat, e.latlng.lng);
    });
    marker.on('dragend', function(e) {
      var latlng = marker.getLatLng();
      updateMarker(latlng.lat, latlng.lng);
    });
  `;

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
      <script src="https://unpkg.com/leaflet-hexbin"></script>

      <script>

      var playerTeam = "red"; // peut venir de React Native plus tard
      var influence = {};

      var map = L.map('map', {
        zoomControl: false
      }).setView([${latitude}, ${longitude}], 16);

      // Dark style OSM
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // ===== HEX GRID SYSTEM =====

      function createHex(lat, lng, size) {
        var points = [];
        for (var i = 0; i < 6; i++) {
          var angle_deg = 60 * i;
          var angle_rad = Math.PI / 180 * angle_deg;
          points.push([
            lat + size * Math.cos(angle_rad),
            lng + size * Math.sin(angle_rad)
          ]);
        }
        return points;
      }

      function getHexId(lat, lng) {
        return Math.round(lat*1000) + "_" + Math.round(lng*1000);
      }

      function spawnHex(lat, lng) {
        var size = 0.0005;
        var hexPoints = createHex(lat, lng, size);
        var id = getHexId(lat, lng);

        if(!influence[id]) {
          influence[id] = { red: 0, blue: 0 };
        }

        var hex = L.polygon(hexPoints, {
          color: "#334155",
          weight: 1,
          fillColor: "#1e293b",
          fillOpacity: 0.4
        }).addTo(map);

        hex.on("click", function(e) {

          // Envoie à React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "HEX_TOUCHED",
            id: id,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            influence: influence[id]
          }));

        });
      }

      function captureHex(id, hex) {
        influence[id][playerTeam] += 10;

        var red = influence[id].red;
        var blue = influence[id].blue;

        var color = "#1e293b";

        if (red > blue) color = "rgba(255,0,0,0.5)";
        if (blue > red) color = "rgba(0,0,255,0.5)";

        hex.setStyle({
          fillColor: color,
          fillOpacity: 0.6
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "capture",
          id: id,
          red: red,
          blue: blue
        }));
      }

      // Spawn grid around player
      function generateGrid(centerLat, centerLng) {
        var offset = 0.001;
        for (var x = -3; x <= 3; x++) {
          for (var y = -3; y <= 3; y++) {
            spawnHex(centerLat + x * offset, centerLng + y * offset);
          }
        }
      }

      generateGrid(${latitude}, ${longitude});

      // ===== Player marker =====
      var player = L.circleMarker([${latitude}, ${longitude}], {
        radius: 8,
        color: playerTeam === "red" ? "red" : "blue",
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


  const handleHexTouch = (hexData) => {
    {/* Doit get les factions qui ont revendiqué ca */}
    console.log("Le joueur a Hex touché: ", hexData);
    return (
      <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
           <View style={styles.modalOverlay}>
              {hexData.influence.red ? (
                <Text>Revendiqué par les Rouges</Text>
              ) : null }

              {hexData.influence.blue ? (
                <Text>Revendiqué par les Bleus</Text>
              ) : null }

              {hexData.influence.blue === 0 && hexData.influence.red === 0 ? (
                <Text>Revendiqué par personne</Text>
              ) : null }

              <Text>Hex: Point de controle</Text>
              <Text>{hexData.lat} , {hexData.lng}</Text>

              <Text>Prix du point d'Ancrage: 15 Gold</Text>
              <Text>Temps de Vulnérabilité: 2h</Text>
              <Text>Xp récupérer: 20</Text>
              <Button title="Installer" ></Button>
           </View>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
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
});

export default LeafletMap;
