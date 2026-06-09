import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  AntDesign,
  Octicons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";

/* ------------------ Reusable Components ------------------ */
const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className="w-1/2 p-2">
    <View className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={24} color="#374151" />
      <View className="ml-3">
        <Text className="text-lg font-bold text-gray-800">{value}{unit}</Text>
        <Text className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{title}</Text>
      </View>
    </View>
  </View>
);

const StatusChip = ({ label, isActive, activeColor, icon }) => (
  <View className={`flex-1 flex-row items-center justify-center m-1 p-3 rounded-xl border ${isActive ? activeColor : 'bg-gray-50 border-gray-100'}`}>
    <MaterialCommunityIcons name={icon} size={16} color={isActive ? '#ffffff' : '#9ca3af'} />
    <Text className={`ml-2 text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
      {label}
    </Text>
  </View>
);

/* ------------------ Main Component ------------------ */
const DeviceDetails = () => {
  const { deviceID } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [device, setDevice] = useState({});
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newDeviceID, setNewDeviceID] = useState("");

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const reloadData = async () => {
    try {
      const response = await axiosInstance.get(`/device/get-a-device/${deviceID}`, {withCredentials: true});
      if (response.data.success) {
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const confirmRenamePress = async () => {
    setShowRenameModal(false);
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/device/update/${device._id}`, { deviceID: newDeviceID });
      if (response.data.success) {
        Toast.show({ type: "success", text1: "✅ Device ID updated" });
        setDevice(response.data.data[0]);
        setNewDeviceID("");
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "❌ Update error", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {isLoading && loadingOverlay()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.keys(device).length > 0 && (
          <>
            {/* Header Section */}
            <View className="p-6 bg-white shadow-sm border-b border-gray-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-3xl font-black text-gray-900">{device.deviceID}</Text>
                  <View className="flex-row items-center mt-1">
                    <Octicons name="dot-fill" size={18} color={device.isOnline ? "#22c55e" : "#ef4444"} />
                    <Text className="ml-2 text-gray-500 font-medium">
                      {device.isOnline ? "System Online" : "System Offline"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowRenameModal(true)}
                  className="bg-gray-100 p-3 rounded-full"
                >
                  <MaterialIcons name="edit" size={20} color="#4b5563" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
                Last Sync: {new Date(device.lastUpdate).toLocaleString()}
              </Text>
            </View>

            {/* Core Metrics Grid */}
            <View className="p-4">
              <View className="flex-row flex-wrap -m-1">
                <MetricCard title="Temperature" value={device.temperature} unit="°C" iconName="temperature-celsius" color="bg-orange-50" />
                <MetricCard title="Humidity" value={device.humidity} unit="%" iconName="water-percent" color="bg-blue-50" />
                <MetricCard title="Tank Level" value={device.tankLevel} unit="%" iconName="database" color="bg-cyan-50" />
                <MetricCard title="Rain Gauge" value={device.rainGauge} unit="mm" iconName="weather-rainy" color="bg-indigo-50" />
              </View>

              {/* Rain Alert Banner */}
              {device.isRaining && (
                <View className="mt-4 bg-blue-500 p-4 rounded-2xl flex-row items-center shadow-blue-200 shadow-lg">
                  <MaterialCommunityIcons name="weather-pouring" size={24} color="white" />
                  <View className="ml-3">
                    <Text className="text-white font-bold">Precipitation Detected</Text>
                    <Text className="text-blue-100 text-xs">System is in active rain monitoring mode</Text>
                  </View>
                </View>
              )}

              {/* Irrigation Section */}
              <View className="mt-6">
                <View className="flex-row items-center mb-3 ml-1">
                  <MaterialCommunityIcons name="sprinkler-variant" size={18} color="#374151" />
                  <Text className="ml-2 text-sm font-bold text-gray-700 uppercase tracking-wider">Irrigation Status</Text>
                </View>
                <View className="flex-row justify-between">
                  <StatusChip label="Zone 1" isActive={device.isIrrigating1} activeColor="bg-emerald-500 border-emerald-600" icon="valve" />
                  <StatusChip label="Zone 2" isActive={device.isIrrigating2} activeColor="bg-emerald-500 border-emerald-600" icon="valve" />
                  <StatusChip label="Zone 3" isActive={device.isIrrigating3} activeColor="bg-emerald-500 border-emerald-600" icon="valve" />
                </View>
              </View>

              {/* Soil Moisture Section */}
              <View className="mt-6 mb-10">
                <View className="flex-row items-center mb-3 ml-1">
                  <MaterialCommunityIcons name="sprout" size={18} color="#374151" />
                  <Text className="ml-2 text-sm font-bold text-gray-700 uppercase tracking-wider">Soil Moisture Status</Text>
                </View>
                <View className="flex-row justify-between">
                  <StatusChip label="Sensor 1" isActive={device.isSoilMoist1} activeColor="bg-blue-500 border-blue-600" icon="water-check" />
                  <StatusChip label="Sensor 2" isActive={device.isSoilMoist2} activeColor="bg-blue-500 border-blue-600" icon="water-check" />
                  <StatusChip label="Sensor 3" isActive={device.isSoilMoist3} activeColor="bg-blue-500 border-blue-600" icon="water-check" />
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Rename Modal (kept for functionality) */}
      <Modal transparent visible={showRenameModal} animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-8 shadow-2xl">
            <Text className="text-xl font-bold text-gray-900 mb-2">Rename Device</Text>
            <Text className="text-gray-500 mb-6">Enter a new identifier for this hardware unit.</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-8">
              <AntDesign name="barcode" size={20} color="#4b5563" />
              <TextInput
                value={newDeviceID}
                onChangeText={setNewDeviceID}
                placeholder="Ex. FIELD_STATION_01"
                className="flex-1 py-4 ml-3 font-semibold text-gray-800"
              />
            </View>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => setShowRenameModal(false)} className="flex-1 bg-gray-200 py-4 rounded-xl">
                <Text className="text-center font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRenamePress} className="flex-1 bg-blue-600 py-4 rounded-xl">
                <Text className="text-center font-bold text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeviceDetails;