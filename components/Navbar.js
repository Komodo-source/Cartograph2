import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ITEMS = [
  { label: 'SOLDAT', route: 'CreationPerso' },
  { label: 'DEBUG', route: 'DebbugPerso' },
];

const Navbar = ({ navigation, active }) => {
  return (
    <View style={styles.container}>
      {ITEMS.map((item, i) => {
        const isActive = active === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.btn, i < ITEMS.length - 1 && styles.btnBorder]}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.6}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#161616',
    height: 52,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBorder: {
    borderRightWidth: 1,
    borderRightColor: '#161616',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333',
    letterSpacing: 4,
  },
  labelActive: {
    color: '#d4a820',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: '#d4a820',
  },
});

export default Navbar;
