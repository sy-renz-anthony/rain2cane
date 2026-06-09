import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className="w-1/2 p-2">
    <View className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={22} color="#374151" />
      <View className="ml-3">
        <Text className="text-base font-bold text-gray-800">
          {value}{unit}
        </Text>
        <Text className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{title}</Text>
      </View>
    </View>
  </View>
);

const StatusChip = ({ label, isActive, activeColor, icon }) => (
  <View className={`flex-1 flex-row items-center justify-center m-1 p-2 rounded-lg border ${isActive ? activeColor : 'bg-gray-50 border-gray-100'}`}>
    <MaterialCommunityIcons 
      name={icon} 
      size={14} 
      color={isActive ? '#ffffff' : '#9ca3af'} 
    />
    <Text className={`ml-1.5 text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
      {label}
    </Text>
  </View>
);

const DeviceCard = ({ device, pressEventHandler }) => {
  return (
    <TouchableOpacity
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() => pressEventHandler(device)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-extrabold text-gray-900">{device.deviceID}</Text>
          <Text className="text-[10px] text-gray-400">
            Updated: {new Date(device.lastUpdate).toLocaleTimeString()}
          </Text>
        </View>
        <Octicons name="dot-fill" size={24} color={device.isOnline ? '#22c55e' : '#ef4444'} />
      </View>

      {/* Numerical Metrics Grid */}
      <View className="flex-row flex-wrap -m-2">
        <MetricCard title="Temp" value={device.temperature} unit="°C" iconName="temperature-celsius" color="bg-orange-50" />
        <MetricCard title="Humidity" value={device.humidity} unit="%" iconName="water-percent" color="bg-blue-50" />
        <MetricCard title="Tank" value={device.tankLevel} unit="%" iconName="database" color="bg-cyan-50" />
        <MetricCard title="Rainfall" value={device.rainGauge} unit="mm" iconName="weather-rainy" color="bg-indigo-50" />
      </View>

      {/* Irrigation Status Section */}
      <Text className="text-[10px] font-bold text-gray-400 uppercase mt-4 mb-1 ml-1">Irrigation Zones</Text>
      <View className="flex-row justify-between">
        <StatusChip label="ZONE 1" isActive={device.isIrrigating1} activeColor="bg-emerald-500 border-emerald-600" icon="sprinkler-variant" />
        <StatusChip label="ZONE 2" isActive={device.isIrrigating2} activeColor="bg-emerald-500 border-emerald-600" icon="sprinkler-variant" />
        <StatusChip label="ZONE 3" isActive={device.isIrrigating3} activeColor="bg-emerald-500 border-emerald-600" icon="sprinkler-variant" />
      </View>

      {/* Soil Moisture Section */}
      <Text className="text-[10px] font-bold text-gray-400 uppercase mt-3 mb-1 ml-1">Soil Moisture Status</Text>
      <View className="flex-row justify-between">
        <StatusChip label="MOIST 1" isActive={device.isSoilMoist1} activeColor="bg-blue-500 border-blue-600" icon="sprout" />
        <StatusChip label="MOIST 2" isActive={device.isSoilMoist2} activeColor="bg-blue-500 border-blue-600" icon="sprout" />
        <StatusChip label="MOIST 3" isActive={device.isSoilMoist3} activeColor="bg-blue-500 border-blue-600" icon="sprout" />
      </View>

      {/* Global Rain Alert */}
      {device.isRaining && (
        <View className="mt-3 bg-blue-100 p-2 rounded-lg flex-row items-center justify-center">
          <MaterialCommunityIcons name="weather-pouring" size={16} color="#1e40af" />
          <Text className="ml-2 text-blue-800 font-bold text-xs">Currently Raining</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default DeviceCard;