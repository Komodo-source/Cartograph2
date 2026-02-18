  import React, { useEffect, useState} from 'react';
  import { View, Text, Button, StyleSheet } from 'react-native';



  const Loading = ({ navigation }) => {

    const load = () =>{
      //fonction a implémenté pour load
      navigation.navigate("MainMap")
    }

  useEffect(() => {
    load();
  }, []);

  
    return (
      <View style={styles.wrapper}>
        <Text>loading</Text>
      </View>
    );
  };

  const styles = StyleSheet.create({

  });

  export default Loading;
