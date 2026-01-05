import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Platform,
  Image
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, Redirect } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';
import logo from "../../assets/images/logo.png";

const renderTableHeading = () => {
  return (
    <View className="flex-row w-full py-2 bg-slate-400 rounded-t-lg">
      <Text className="w-24 text-center text-white text-xs">Date</Text>
      <Text className="w-24 text-center text-white text-xs">Device</Text>
      <Text className="flex-1 text-center text-white text-xs">Temp (°C)</Text>
      <Text className="flex-1 text-center text-white text-xs">Hum (%)</Text>
      <Text className="flex-1 text-center text-white text-xs">Tank</Text>
      <Text className="flex-1 text-center text-white text-xs">Rain</Text>
      <Text className="flex-1 text-center text-white text-xs">Irrig.</Text>
    </View>
  );
};


const renderTableData = ({ item }) => {
  if (!item) return null;

  return (
    <View className="flex-row w-full py-2 border-b border-gray-100">
      <Text className="w-32 text-xs pl-2">
        {new Date(item.eventDate).toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>

      <Text className="w-24 text-xs">
        {item.device?.deviceID ?? "—"}
      </Text>

      <Text className="flex-1 text-xs">
        {item.temperature}°
      </Text>

      <Text className="flex-1 text-xs">
        {item.humidity}%
      </Text>

      <Text className="flex-1 text-xs">
        {item.tankLevel}
      </Text>

      <Text className="flex-1 text-xs">
        {item.isRaining ? "Yes" : "No"}
      </Text>

      <Text className="flex-1 text-xs">
        {item.isIrrigating ? "On" : "Off"}
      </Text>
    </View>
  );
};



const ProfileTab =()=>{
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [deviceIDs, setDeviceIDs] = useState([]);
    const [selectedDeviceID, setSelectedDeviceID] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showStartDateSelection, setShowStartDateSelection] = useState(false);
    const [showEndDateSelection, setShowEndDateSelection] = useState(false);
    const [data, setData] = useState([]);
    
    const reloadData = async()=>{
        try{
            const response = await axiosInstance.get("/device/get-my-devices", {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                    type: 'error',
                    text1: '❌ Error while retrieving your Devices!',
                    text2: response.data.message
                });
                setDeviceIDs([]);
            }else{
                
                const ids=[];
                for(let i=0;i<response.data.data.length;i++){
                    ids[i] = response.data.data[i].deviceID;
                }

                setDeviceIDs(ids);
            }
        }catch(error){
            console.log("Error while retrieving your Devices! - "+error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while retrieving your Devices!',
                text2: error.message
            });
            setDeviceIDs([]);
        }
    }
    useEffect(()=>{
        setIsLoading(true);
        reloadData();
        setIsLoading(false);
    }, []);

    const changeStartDate=(event)=>{
        setStartDate(new Date(event.nativeEvent.timestamp));
        setShowStartDateSelection(false);
    }

    const changeEndDate=(event)=>{
        setEndDate(new Date(event.nativeEvent.timestamp));
        setShowEndDateSelection(false);
    }
    
    const searchEvents=async ()=>{
        setData([]);
        setIsLoading(true);
        try{
            const data={};
            if(selectedDeviceID && selectedDeviceID.length>1){
                data.deviceID=selectedDeviceID;
            }
            data.startDate=startDate;
            data.endDate=endDate;

            const response = await axiosInstance.post("/event/sensor-records", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                    type: 'error',
                    text1: '❌ Error while retrieving Device Records!',
                    text2: response.data.message
                });
                setData([]);
            }else{
                setData(response.data.data);
            }
        }catch(error){
            console.log("Error while retrieving your Devices! - "+error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while retrieving your Devices!',
                text2: error.message
            });
            setData([]);
        }
        setIsLoading(false);
    }

    return(
        <SafeAreaView className="flex-1 bg-gray-100">
            {isLoading && loadingOverlay()}
            
                
                <View className="flex flex-row  items-center gap-5 px-5 py-4 bg-white shadow-sm border-b border-gray-100 pt-10">
                    <Image source={logo} style={{ width: 50, height: 50 }} />
                    <Text className="text-3xl font-extrabold text-green-700">Logs</Text>
                </View>

                <View className="flex h-fit px-7 py-1 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg">
                    <View className="flex flex-row w-full h-20 gap-4 my-2 items-center">
                        
                        <Text className="text-gray-500 text-md">Devices: </Text>
                        <View className="flex-1 border border-gray-300 rounded-xl h-fit p-0 text-md">
                        <Picker
                            selectedValue={selectedDeviceID}
                            onValueChange={(itemValue) => setSelectedDeviceID(itemValue)}
                            style={{
                                flex: 1,
                                width: "auto",
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                overflow: 'hidden', 
                                marginRight: 5,
                                fontSize: 12
                            }}
                        >
                            <Picker.Item  label="All" value="" />
                            {deviceIDs.map((item) => (
                                <Picker.Item key={item} label={item} value={item} />
                            ))}
                        </Picker>
                        </View>
                    </View>
                    <View className="flex flex-row w-full h-fit gap-4 my-2 items-center">
                        <View className="flex-1 flex-col justify-center w-fit">
                              <Text className="text-slate-600 text-base">Start Date</Text>
                              <TouchableOpacity 
                                onPress={() => setShowStartDateSelection(true)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-4 flex-row justify-between items-center active:bg-slate-100"
                              >
                                <Text className="text-slate-600 text-base">
                                  {startDate.toLocaleDateString()}
                                </Text>
                                <MaterialIcons name='arrow-drop-down' size={25}/>
                              </TouchableOpacity>
                        
                              {showStartDateSelection && (
                                <DateTimePicker
                                  value={startDate}
                                  mode="date"
                                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                  onChange={changeStartDate}
                                />
                              )}
                            </View>
                            <View className="flex-1 flex-col justify-center w-fit">
                              <Text className="text-slate-600 text-base">End Date</Text>
                              <TouchableOpacity 
                                onPress={() => setShowEndDateSelection(true)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-4 flex-row justify-between items-center active:bg-slate-100"
                              >
                                <Text className="text-slate-600 text-base">
                                  {endDate.toLocaleDateString()}
                                </Text>
                                <MaterialIcons name='arrow-drop-down' size={25}/>
                              </TouchableOpacity>
                        
                              {showEndDateSelection && (
                                <DateTimePicker
                                  value={endDate}
                                  mode="date"
                                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                  minimumDate={startDate}
                                  onChange={changeEndDate}
                                />
                              )}
                            </View>
                    </View>
                    <View className="flex h-10 mx-10 mt-2 mb-5">
                        <TouchableOpacity
                            onPress={searchEvents}
                            className="bg-blue-600 py-2 px-4 rounded-lg "
                        >
                            <Text className="text-center text-white font-semibold">Search</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>

                {data.length>0 && (
                    <View className="flex flex-col mx-2 bg-white shadow-sm border-b border-gray-100 rounded-lg text-md">
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item._id}
                            ListHeaderComponent={renderTableHeading}
                            renderItem={renderTableData}
                            stickyHeaderIndices={[0]}
                        />
                    </View>
                )}
                
            
        </SafeAreaView>
    );
}

export default ProfileTab;
