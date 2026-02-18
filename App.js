import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import 'react-native-reanimated';
import Loading from './screens/Loading';
import MainMap from './screens/MainMap';
import CreationPerso from './screens/CreationPerso';
import DebbugPerso from './screens/DebbugPerso';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Loading">
          <Stack.Screen
            name="Loading"
            component={Loading}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainMap"
            component={MainMap}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreationPerso"
            component={CreationPerso}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DebbugPerso"
            component={DebbugPerso}
            options={{ headerShown: false }}
          />
          {/* Removed empty Index screen (no component provided) to avoid import/prop errors */}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
