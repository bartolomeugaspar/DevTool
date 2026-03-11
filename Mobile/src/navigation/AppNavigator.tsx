import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ServicesScreen from '../screens/ServicesScreen';
import CreateServiceScreen from '../screens/CreateServiceScreen';
import EditServiceScreen from '../screens/EditServiceScreen';
import HireServiceScreen from '../screens/HireServiceScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EditService: { id: string };
  HireService: { id: string };
  CreateService: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Services: undefined;
  Transactions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

// ── Tab icon component ────────────────────────────────────────────────────────
function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const paths: Record<string, string> = {
    Dashboard:    'M3.75 6A2.25 2.25 0 016 3.75h2.25... ',
    Services:     'list',
    Transactions: 'receipt',
  };

  const icons: Record<string, React.ReactNode> = {
    Dashboard: (
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: 16, height: 16 }}>
          {[0,1,2,3].map(i => (
            <View key={i} style={{ width: 6, height: 6, borderRadius: 1.5, backgroundColor: color, opacity: focused ? 1 : 0.6 }} />
          ))}
        </View>
      </View>
    ),
    Services: (
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {[0,1,2].map(i => (
          <View key={i} style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: color, opacity: focused ? 1 : 0.6 }} />
        ))}
      </View>
    ),
    Transactions: (
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 14, height: 18, borderRadius: 2, borderWidth: 1.5, borderColor: color, opacity: focused ? 1 : 0.6, alignItems: 'center', paddingTop: 3, gap: 2 }}>
          {[0,1,2].map(i => (
            <View key={i} style={{ width: 8, height: 1.5, borderRadius: 1, backgroundColor: color }} />
          ))}
        </View>
      </View>
    ),
  };

  return icons[name] ?? null;
}

// ── Main tab navigator ────────────────────────────────────────────────────────
function MainTabs() {
  const { navBg, navBorder, accent, text2 } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: navBg,
          borderTopColor: navBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: text2,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ color, focused }) => (
          <TabIcon name={route.name} color={color} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard"    component={DashboardScreen}    options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Services"     component={ServicesScreen}     options={{ title: 'Serviços' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transações' }} />
    </Tab.Navigator>
  );
}

// ── Root navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main"          component={MainTabs} />
            <Stack.Screen name="CreateService" component={CreateServiceScreen} />
            <Stack.Screen name="EditService"   component={EditServiceScreen} />
            <Stack.Screen name="HireService"   component={HireServiceScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
