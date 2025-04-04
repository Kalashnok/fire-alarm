import { Tabs, Redirect } from 'expo-router';
import { MqttProvider } from '../contexts/MqttContext';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from './styles/theme';

export default function AppLayout() {
  return (
    <MqttProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.textSecondary,
          },
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Devices',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="devices" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="[...unmatched]"
          options={{
            href: null, // This hides the tab
          }}
        />
      </Tabs>
    </MqttProvider>
  );
}
