// @ts-nocheck
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { scale } from '@/utils/styling';

const BottomNav = ({ activeTab = 'Dashboard', onTabPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onTabPress('Dashboard')} style={styles.tab}>
        <MaterialIcons name="dashboard" size={22} color={activeTab === 'Dashboard' ? '#B2D430' : '#6B6B6B'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('Budgets')} style={styles.tab}>
        <MaterialIcons name="pie-chart" size={22} color={activeTab === 'Budgets' ? '#B2D430' : '#6B6B6B'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('Goals')} style={styles.tab}>
        <MaterialCommunityIcons name="target" size={22} color={activeTab === 'Goals' ? '#B2D430' : '#6B6B6B'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('Reports')} style={styles.tab}>
        <MaterialIcons name="bar-chart" size={22} color={activeTab === 'Reports' ? '#B2D430' : '#6B6B6B'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: scale(24),
    paddingVertical: scale(10),
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
});

export default BottomNav;
