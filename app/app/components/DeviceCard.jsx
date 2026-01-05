import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className="w-1/2 p-2">
    <View className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={24} color="#374151" />
      <View className="ml-3">
        <Text className="text-lg font-bold text-gray-800">
          {value}{unit}
        </Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
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
        <Text className="text-xl font-extrabold text-gray-900">
          {device.deviceID}
        </Text>
        <Octicons
          name="dot-fill"
          size={30}
          color={device.isOnline ? 'green' : 'red'}
        />
      </View>

      {/* Environment Metrics */}
      <View className="flex-row flex-wrap -m-2">
        <MetricCard
          title="Humidity"
          value={device.humidity}
          unit="%"
          iconName="water-percent"
          color="bg-blue-50"
        />
        <MetricCard
          title="Temperature"
          value={device.temperature}
          unit="°C"
          iconName="temperature-celsius"
          color="bg-red-50"
        />
        <MetricCard
          title="Tank Level"
          value={device.tankLevel}
          unit="%"
          iconName="water"
          color="bg-cyan-50"
        />
        <MetricCard
          title="Raining"
          value={device.isRaining ? 'Yes' : 'No'}
          unit=""
          iconName="weather-rainy"
          color="bg-indigo-50"
        />
        <MetricCard
          title="Irrigating"
          value={device.isIrrigating ? 'Yes' : 'No'}
          unit=""
          iconName="sprinkler"
          color="bg-emerald-50"
        />
      </View>
    </TouchableOpacity>
  );
};

export default DeviceCard;