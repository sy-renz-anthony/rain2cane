#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

//const char* WIFI_SSID = "Galaxy A54";
//const char* WIFI_PASS = "qwerty123";

const char* WIFI_SSID = "Katol";
const char* WIFI_PASS = "lumot123";

const char* API_URL = "https://xlgjn5k1-5000.asse.devtunnels.ms/api";

const int JSON_REQUEST_SIZE = 512 + (64 * 15);

const String deviceID="10001A";

float temperature;
float humidity;
int tankLevel;
int isRaining;
int isSoil1Moist, isSoil2Moist, isSoil3Moist;
int isIrrigation1On, isIrrigation2On, isIrrigation3On;
int rainGauge;

String arduinoMessage;

unsigned long previousOnlineUpdate, previousReconnectAttempt, previousDisplayUpdate;
unsigned long currentTime;

unsigned long previousDataSubmit;

bool connectedToWifi;

int loopCounter, currentDisplayIndex;

int firstComma, secondComma, thirdComma, fourthComma, fifthComma, sixthComma, seventhComma, eigthComma, ninethComma, tenthComma;

LiquidCrystal_I2C lcd(0x27, 16, 2); 

HardwareSerial unoSerial(2);

void wifiConnect() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected.");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        connectedToWifi=true;
    } else {
      Serial.println("\nFailed to connect to WiFi disabling wifi connection...");
        //Serial.println("\nFailed to connect to WiFi. Restarting...");
        //delay(5000);
        //ESP.restart();
        connectedToWifi=false;
    }
    Serial.println("------------------------------------");
}

void requestAPIGET(String endPoint) {
    if(!connectedToWifi)
        return;
        
    String urlFull=API_URL+endPoint;
    HTTPClient http;
    http.begin(urlFull);

    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("HTTP Response Code: %d\n", httpResponseCode);
        
        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);

        if (error) {
            Serial.print(F("JSON parsing failed: "));
            Serial.println(error.f_str());
        } else {
            if (httpResponseCode == 200) {
                String message = responseDoc["message"];
                Serial.println(message.c_str());
            } else {
                String errorMsg = responseDoc["message"] | "Unknown API Error";
                Serial.printf("API Error: %s\n", errorMsg.c_str());
            }
        }
    } else {
        Serial.printf("HTTP GET Request failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}

void sendOnlinePing(){
    if(!connectedToWifi)
        return;

    Serial.println("Sending post");
    DynamicJsonDocument doc(JSON_REQUEST_SIZE);
    doc["deviceID"]=deviceID;
    doc["temperature"]=temperature;
    doc["humidity"]=humidity;
    doc["tankLevel"]=tankLevel;
    doc["isRaining"]=isRaining;
    doc["isIrrigating1"]=isIrrigation1On;
    doc["isIrrigating2"]=isIrrigation2On;
    doc["isIrrigating3"]=isIrrigation3On;
    doc["isSoilMoist1"]=isSoil1Moist;
    doc["isSoilMoist2"]=isSoil2Moist;
    doc["isSoilMoist3"]=isSoil3Moist;
    doc["rainGauge"]=rainGauge;
    sendAPIPOST("/device/online", doc);
}

void sendDataSubmission(){
    if(!connectedToWifi)
        return;

    DynamicJsonDocument doc(JSON_REQUEST_SIZE);
    doc["deviceID"]=deviceID;
    doc["temperature"]=temperature;
    doc["humidity"]=humidity;
    doc["tankLevel"]=tankLevel;
    doc["isRaining"]=isRaining;
    doc["isIrrigating1"]=isIrrigation1On;
    doc["isIrrigating2"]=isIrrigation2On;
    doc["isIrrigating3"]=isIrrigation3On;
    doc["isSoilMoist1"]=isSoil1Moist;
    doc["isSoilMoist2"]=isSoil2Moist;
    doc["isSoilMoist3"]=isSoil3Moist;
    doc["rainGauge"]=rainGauge;
    sendAPIPOST("/event/submit-data", doc);
}

void sendAPIPOST(String endPoint, DynamicJsonDocument doc){
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Reconnecting...");
        wifiConnect();
        return;
    }

    String urlFull = API_URL + endPoint;

    String jsonRequest;
    serializeJson(doc, jsonRequest);

    HTTPClient http;

    WiFiClientSecure client;
    client.setInsecure();

    if (!http.begin(client, urlFull)) {
        Serial.println("Failed to begin HTTP connection!");
        return;
    }

    http.addHeader("Content-Type", "application/json");

    
    int httpResponseCode = http.POST(jsonRequest);

    if (httpResponseCode > 0) {
        //Serial.printf("HTTP Response Code: %d\n", httpResponseCode);

        String response = http.getString();
        //Serial.println("Raw Response:");
        //Serial.println(response);

        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);

        if (error) {
            //Serial.print("JSON parsing failed: ");
            //Serial.println(error.c_str());
        } else {
            const char* message = responseDoc["message"] | "No message";
            //Serial.printf("Server Message: %s\n", message);
        }

    } else {
        //Serial.printf("HTTP Request failed: %s\n",
                     // http.errorToString(httpResponseCode).c_str());
    }

    http.end();

}

void setup() {
  Serial.begin(115200);
  
  delay(100);
  unoSerial.begin(9600, SERIAL_8N1, 16, 17);

  connectedToWifi=false;
  wifiConnect();

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();

  temperature=0;
  humidity=0;
  arduinoMessage="";
  previousOnlineUpdate=0;
  currentTime=0;
  previousReconnectAttempt=0;
  previousDisplayUpdate=0;
  currentDisplayIndex=0;

  loopCounter=0;
  tankLevel=0;
  isRaining=0;
  isIrrigation1On=0;
  isIrrigation2On=0;
  isIrrigation3On=0;
  isSoil1Moist=0;
  isSoil2Moist=0;
  isSoil3Moist=0;
  previousDataSubmit=0;

  firstComma=0; 
  secondComma=0; 
  thirdComma=0; 
  fourthComma=0; 
  fifthComma=0; 
  sixthComma=0; 
  seventhComma=0; 
  eigthComma=0; 
  ninethComma=0;
  tenthComma=0;
  rainGauge=0;

  lcd.setCursor(0, 0);
  lcd.print(" Initializing...");
}

void loop() {
  if (unoSerial.available()) {
    String message = unoSerial.readStringUntil('\n');
    Serial.println("From arduino: "+message);
    if(!arduinoMessage.equals(message) || loopCounter>=4){
      firstComma = message.indexOf(',');
      secondComma = message.indexOf(',', firstComma + 1);
      thirdComma = message.indexOf(',', secondComma+1);
      fourthComma = message.indexOf(',', thirdComma+1);
      fifthComma = message.indexOf(',', fourthComma+1); 
      sixthComma = message.indexOf(',', fifthComma+1); 
      seventhComma = message.indexOf(',', sixthComma+1); 
      eigthComma = message.indexOf(',', seventhComma+1); 
      ninethComma = message.indexOf(',', eigthComma+1);
      tenthComma= message.indexOf(',', tenthComma+1);

      humidity = message.substring(0, firstComma).toFloat();
      temperature=message.substring(firstComma+1, secondComma).toFloat();
      tankLevel=message.substring(secondComma+1, thirdComma).toInt();
      isRaining=message.substring(thirdComma+1, fourthComma).toInt();
      isSoil1Moist=message.substring(fourthComma+1).toInt();
      isSoil2Moist=message.substring(fifthComma+1).toInt();
      isSoil3Moist=message.substring(sixthComma+1).toInt();
      isIrrigation1On=message.substring(seventhComma+1).toInt();
      isIrrigation2On=message.substring(eigthComma+1).toInt();
      isIrrigation3On=message.substring(ninethComma+1).toInt();
      rainGauge=message.substring(tenthComma+1).toInt();

      arduinoMessage=message;
      loopCounter=0;
    }else{
      loopCounter++;
    }
  }

  currentTime=millis();
  if(!connectedToWifi && (currentTime-previousReconnectAttempt) > 45000){
    wifiConnect();
    previousReconnectAttempt=currentTime;
  }

  if((currentTime-previousOnlineUpdate) >= 1000){
    /*
    Serial.print("values - h:");
    Serial.print(humidity);
    Serial.print(", t:");
    Serial.print(temperature);
    Serial.print(", Tlvl:");
    Serial.print(tankLevel);
    Serial.print(", raining:");
    Serial.print(isRaining);
    Serial.print(", field1Moist:");
    Serial.print(isSoil1Moist);
    Serial.print(", field2Moist:");
    Serial.print(isSoil2Moist);
    Serial.print(", field3Moist:");
    Serial.print(isSoil3Moist);
    Serial.print(", field1Irrigate:");
    Serial.print(isIrrigation1On);
    Serial.print(", field2Irrigate:");
    Serial.print(isIrrigation2On);
    Serial.print(", field3Irrigate:");
    Serial.println(isIrrigation3On);
    */
    sendOnlinePing();
    previousOnlineUpdate=currentTime;
  }

  if(currentTime-previousDataSubmit >= 43200000 || previousDataSubmit<=0){
    sendDataSubmission();
    previousDataSubmit=currentTime;
  }

  if(currentTime-previousDisplayUpdate>10000){
    
    if(currentDisplayIndex==0){
        lcd.setCursor(0, 0);
        lcd.print("                ");
        lcd.setCursor(0, 0);
        lcd.print("T:");
        lcd.print(temperature);
        lcd.print(" H:");
        lcd.print(humidity);
        lcd.print("%");  
        lcd.setCursor(0, 1);
        if(isRaining==0){
            lcd.print("Network Ok      ");
        }else{
            lcd.print("Network Error   ");
        }
    }else if(currentDisplayIndex==1){
        lcd.setCursor(0, 0);
        lcd.print("                ");
        lcd.setCursor(0, 0);
        lcd.print("Tank Lvl:");
        lcd.print(tankLevel);
        lcd.print("%");
        lcd.setCursor(0, 1);
        lcd.print("Weather: ");
        if(!isRaining){
            lcd.print("Sunny  ");
        }else{
            lcd.print("Raining");
        }
    }else if(currentDisplayIndex==2){
        lcd.setCursor(0, 0);
        lcd.print("Field1 Moist:");
        if(isSoil1Moist==0){
            lcd.print("Dry");
        }else{
            lcd.print("Wet");
        }
        lcd.setCursor(0, 1);
        lcd.print("Field1 Irrig:");
        if(isIrrigation1On){
            lcd.print("On ");
        }else{
            lcd.print("Off");
        }
    }else if(currentDisplayIndex==3){
        lcd.setCursor(0, 0);
        lcd.print("Field2 Moist:");
        if(isSoil2Moist==0){
            lcd.print("Dry");
        }else{
            lcd.print("Wet");
        }
        lcd.setCursor(0, 1);
        lcd.print("Field2 Irrig:");
        if(isIrrigation2On){
            lcd.print("On ");
        }else{
            lcd.print("Off");
        }
    }else{
        lcd.setCursor(0, 0);
        lcd.print("Field3 Moist:");
        if(isSoil3Moist==0){
            lcd.print("Dry");
        }else{
            lcd.print("Wet");
        }
        lcd.setCursor(0, 1);
        lcd.print("Field3 Irrig:");
        if(isIrrigation3On){
            lcd.print("On ");
        }else{
            lcd.print("Off");
        }
    }

    currentDisplayIndex++;
    if(currentDisplayIndex>4){
        currentDisplayIndex=0;
    }
  }
  
  delay(800);
}