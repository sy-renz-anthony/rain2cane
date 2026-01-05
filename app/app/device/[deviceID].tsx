import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
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
import { reload } from "expo-router/build/global-state/routing";

/* ------------------ Metric Card ------------------ */
const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className="w-1/2 p-2">
    <View
      className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}
    >
      <MaterialCommunityIcons name={iconName} size={24} color="#374151" />
      <View className="ml-3">
        <Text className="text-lg font-bold text-gray-800">
          {value}
          {unit}
        </Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
  </View>
);

/* ------------------ Device Details ------------------ */
const DeviceDetails = () => {
  const { deviceID } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [device, setDevice] = useState({});
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newDeviceID, setNewDeviceID] = useState("");

  /* Auto refresh */
  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 20000);
    return () => clearInterval(interval);
  }, []);

  /* Fetch device */
  const reloadData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/device/get-a-device/${deviceID}`,
        { withCredentials: true }
      );

      if (!response.data.success) {
        Toast.show({
          type: "error",
          text1: "❌ Failed to load device",
          text2: response.data.message,
        });
        setDevice({});
      } else {
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "❌ Error loading device",
        text2: error.message,
      });
      setDevice({});
    } finally {
      setIsLoading(false);
    }
  };

  /* Rename handlers */
  const confirmRenamePress = async () => {
    setShowRenameModal(false);
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        `/device/update/${device._id}`,
        { deviceID: newDeviceID },
        { withCredentials: true }
      );

      if (!response.data.success) {
        Toast.show({
          type: "error",
          text1: "❌ Device ID update failed!",
          text2: response.data.message,
        });
        setShowRenameModal(true);
      } else {
        Toast.show({
          type: "success",
          text1: "✅ Device ID updated",
        });
        setNewDeviceID("");
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "❌ Update error",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}

      {Object.keys(device).length > 0 && (
        <>
          {/* Header */}
          <View className="p-4 bg-white shadow-sm border-b border-gray-100 pt-10">
            <View className="flex-row items-center">
              <Text className="flex-1 text-3xl font-extrabold text-green-700">
                {device.deviceID}
              </Text>
              <TouchableOpacity
                onPress={() => setShowRenameModal(true)}
                className="flex-row gap-2 bg-blue-600 py-3 px-4 rounded-lg"
              >
                <MaterialIcons name="edit" size={16} color="white" />
                <Text className="text-white font-semibold text-sm">Edit</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-2">
              <Text className="text-base text-gray-500 mr-2">
                Current status:
              </Text>
              <Octicons
                name="dot-fill"
                size={28}
                color={device.isOnline ? "green" : "red"}
              />
            </View>
          </View>

          {/* Metrics */}
          <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100">
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
                value={device.isRaining ? "Yes" : "No"}
                unit=""
                iconName="weather-rainy"
                color="bg-indigo-50"
              />
              <MetricCard
                title="Irrigating"
                value={device.isIrrigating ? "Yes" : "No"}
                unit=""
                iconName="sprinkler"
                color="bg-emerald-50"
              />
            </View>
          </View>
        </>
      )}

      {/* Rename Modal */}
      <Modal transparent visible={showRenameModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-lg p-6 w-80">
            <Text className="text-lg font-bold text-center mb-4">
              New Device ID
            </Text>

            <View className="flex-row mb-6">
              <View className="border border-gray-300 rounded-l-lg px-2 justify-center">
                <AntDesign name="barcode" size={26} color="green" />
              </View>
              <TextInput
                value={newDeviceID}
                onChangeText={setNewDeviceID}
                placeholder="Device ID"
                className="flex-1 border border-gray-300 border-l-0 rounded-r-lg px-4"
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                className="bg-gray-300 py-2 px-4 rounded-lg"
              >
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmRenamePress}
                className="bg-blue-600 py-2 px-4 rounded-lg"
              >
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeviceDetails;
