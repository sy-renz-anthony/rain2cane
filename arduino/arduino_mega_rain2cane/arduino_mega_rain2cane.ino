#include <Servo.h>
#include <DHT.h>
#include <Wire.h>
#include <Stepper.h>

#define PIN_5MM 30
#define PIN_10MM 31
#define PIN_15MM 32
#define PIN_20MM 33

#define PIN_RAINSENSOR A1
#define PIN_SOILMOISTURE_1 2

#define TYPE_DHT22 DHT22
#define PIN_DHT22 13

#define PIN_BUZZER 11
#define PIN_TRIG 10
#define PIN_ECHO 9
#define PIN_SOILMOISTURE_2 8
#define PIN_SOILMOISTURE_3 7

#define PIN_IN1_1 22
#define PIN_IN2_1 23
#define PIN_IN3_1 24
#define PIN_IN4_1 25

#define PIN_IN1_2 26
#define PIN_IN2_2 27
#define PIN_IN3_2 28
#define PIN_IN4_2 29

#define PIN_PUMP1 6
#define PIN_PUMP2 5
#define PIN_PUMP3 4
#define PIN_SPRINKLER1 52
#define PIN_SPRINKLER2 51
#define PIN_SPRINKLER3 50

DHT dht(PIN_DHT22, TYPE_DHT22);

float humidity;
float temperature;
unsigned long duration, previousDHTandHCSR04Update, previousESP32Update;
int rainSensorReading, isRaining;
int soilMoisture1Reading, isSoil1Moist;
int soilMoisture2Reading, isSoil2Moist;
int soilMoisture3Reading, isSoil3Moist;

int waterLevel;
bool isRoofOpen;

bool isIrrigation1On, isIrrigation2On, isIrrigation3On;
bool isTankEmpty, sprinkler1Active, sprinkler2Active, sprinkler3Active;

int sprinklerDirection;
int sprinklerAngle;

unsigned long currentTime;

const int stepsPerRev = 2048;

Stepper roof1(stepsPerRev, PIN_IN1_1, PIN_IN3_1, PIN_IN2_1, PIN_IN4_1);
Stepper roof1Reverse(stepsPerRev, PIN_IN4_1, PIN_IN3_1, PIN_IN2_1, PIN_IN1_1);

Stepper roof2(stepsPerRev, PIN_IN1_2, PIN_IN3_2, PIN_IN2_2, PIN_IN4_2);
Stepper roof2Reverse(stepsPerRev, PIN_IN1_2, PIN_IN2_2, PIN_IN3_2, PIN_IN4_2);

Servo sprinkler1, sprinkler2, sprinkler3;

int rainGaugeReading;
int mm5Reading, mm10Reading, mm15Reading, mm20Reading;

void readDHT22(){
  float rawHumidity = dht.readHumidity();
  float rawTemperature = dht.readTemperature();

  if (isnan(rawHumidity) || isnan(rawTemperature)) {
    //Serial.println("Failed to read from DHT sensor!");
    return;
  }

  humidity = rawHumidity;
  temperature = rawTemperature;
  /*
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  */
}

int readHCSR04(){
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  duration = pulseIn(PIN_ECHO, HIGH);

  int distance = duration * 0.034 / 2;

  /*
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  //return distance;
  //*/
  ///*
  if(distance >= 16){
    waterLevel = 0;
  }else if(distance <=2){
    waterLevel = 100;
  }else{
    float result = 16-(distance-2);
    result = (result/16)*100;
    //Serial.println(result);
    waterLevel = (int) result;
  }

  return waterLevel;//*/
}

void openRoof(){
  //Serial.println("Open");
  roof2.step(stepsPerRev);
  roof1Reverse.step(-stepsPerRev);
}

void closeRoof(){
  //Serial.println("Close");
  roof1.step(-stepsPerRev);
  roof2Reverse.step(stepsPerRev*2);
}

void setup() {
  Serial.begin(9600);
  delay(15000);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_SOILMOISTURE_1, INPUT);
  pinMode(PIN_SOILMOISTURE_2, INPUT);
  pinMode(PIN_SOILMOISTURE_3, INPUT);
  pinMode(PIN_PUMP1, OUTPUT);
  pinMode(PIN_PUMP2, OUTPUT);
  pinMode(PIN_PUMP3, OUTPUT);
  pinMode(PIN_5MM, INPUT_PULLUP);
  pinMode(PIN_10MM, INPUT_PULLUP);
  pinMode(PIN_15MM, INPUT_PULLUP);
  pinMode(PIN_20MM, INPUT_PULLUP);
  
  dht.begin();

  roof1.setSpeed(10);
  roof1Reverse.setSpeed(10);

  roof2.setSpeed(10);
  roof2Reverse.setSpeed(10);

  sprinkler1.attach(PIN_SPRINKLER1);
  sprinkler2.attach(PIN_SPRINKLER2);
  sprinkler3.attach(PIN_SPRINKLER3);

  humidity=0;
  temperature=0;
  rainSensorReading=0;
  isRaining=0;
  previousDHTandHCSR04Update=0;
  previousESP32Update=0;
  currentTime=0;
  waterLevel=0;
  soilMoisture1Reading=0;
  soilMoisture2Reading=0;
  soilMoisture3Reading=0;
  isSoil1Moist=0;
  isSoil2Moist=0;
  isSoil3Moist=0;
  isIrrigation1On=false;
  isIrrigation2On=false;
  isIrrigation3On=false;

  isRoofOpen=false;
  isTankEmpty=true;
  
  sprinkler1Active=false;
  sprinkler2Active=false;
  sprinkler3Active=false;
  sprinklerDirection=0;
  sprinklerAngle=0;
  rainGaugeReading=0;
  mm5Reading=0; 
  mm10Reading=0; 
  mm15Reading=0; 
  mm20Reading=0;

  digitalWrite(PIN_PUMP1, HIGH);
  digitalWrite(PIN_PUMP2, HIGH);
  digitalWrite(PIN_PUMP3, HIGH);
  sprinkler1.write(0);
  sprinkler2.write(0);
  sprinkler3.write(0);
}

void loop() {
  currentTime=millis();
  //rainSensorReading=digitalRead(PIN_RAINSENSOR);
  rainSensorReading=analogRead(PIN_RAINSENSOR);
  //Serial.print("rain: ");
  //Serial.println(rainSensorReading);
  soilMoisture1Reading=digitalRead(PIN_SOILMOISTURE_1);
  soilMoisture2Reading=digitalRead(PIN_SOILMOISTURE_2);
  soilMoisture3Reading=digitalRead(PIN_SOILMOISTURE_3);
  ///*
  rainGaugeReading=0;
  mm5Reading=digitalRead(PIN_5MM);
  mm10Reading=digitalRead(PIN_10MM);
  mm15Reading=digitalRead(PIN_15MM);
  mm20Reading=digitalRead(PIN_20MM);
  //*/
  /*
  mm5Reading=analogRead(PIN_5MM);
  mm10Reading=analogRead(PIN_10MM);
  mm15Reading=analogRead(PIN_15MM);
  mm20Reading=analogRead(PIN_20MM);
  //*/
  if(mm5Reading == LOW){
    rainGaugeReading=rainGaugeReading+5;
  }
  if(mm10Reading == LOW){
    rainGaugeReading=rainGaugeReading+5;
  }
  if(mm15Reading == LOW){
    rainGaugeReading=rainGaugeReading+5;
  }
  if(mm20Reading == LOW){
    rainGaugeReading=rainGaugeReading+5;
  }
  /*
  Serial.print("5: ");
  Serial.print(mm5Reading);
  Serial.print("  10: ");
  Serial.print(mm10Reading);
  Serial.print("  15: ");
  Serial.print(mm15Reading);
  Serial.print("  20: ");
  Serial.print(mm20Reading);
  Serial.print("  rainGauge: ");
  Serial.println(rainGaugeReading);
  //*/
  if(currentTime-previousDHTandHCSR04Update>=2000){
    readDHT22();
    waterLevel=readHCSR04();
    if(waterLevel<5){
      isTankEmpty=true;
    }else{
      isTankEmpty=false;
    }
  }
  /*
  if(rainSensorReading == LOW){
    //Serial.println("is Raining");
    isRaining=1;
  }else{
    //Serial.println("is not raining");
    isRaining=0;
  }*/
  if(rainSensorReading < 500){
    //Serial.println("is Raining");
    isRaining=1;
  }else{
    //Serial.println("is not raining");
    isRaining=0;
  }

  if(soilMoisture3Reading == LOW){
    isSoil3Moist=1;
    //Serial.println("Soil 3 is moist");
    digitalWrite(PIN_PUMP2, HIGH);
    isIrrigation3On=false;
    sprinkler3Active=false;
  }else{
    isSoil3Moist=0;
    //Serial.println("Soil 3 is dry");
    if(!isTankEmpty){
      delay(1000);
      digitalWrite(PIN_PUMP2, LOW);
      //Serial.println("Pump3!");
      isIrrigation3On=true;
      sprinkler3Active=true;
    }else{
      tone(PIN_BUZZER, 1000);
      delay(300);
      noTone(PIN_BUZZER);
      delay(100);
      tone(PIN_BUZZER, 1000);
      delay(300);
      noTone(PIN_BUZZER);
    }
  }

  //Serial.print("Soil Moisture 1 Reading: ");
  //Serial.println(soilMoisture1Reading);
  if(soilMoisture1Reading == LOW){
    isSoil1Moist=1;
    //Serial.println("Soil 1 is moist");
    digitalWrite(PIN_PUMP1, HIGH);
    isIrrigation1On=false;
    sprinkler1Active=false;
  }else{
    isSoil1Moist=0;
    //Serial.println("Soil 1 is dry");
    if(!isTankEmpty){
      delay(1000);
      digitalWrite(PIN_PUMP1, LOW);
      isIrrigation1On=true;
      sprinkler1Active=true;
      //Serial.println("Pump1!");
    }else{
      tone(PIN_BUZZER, 1000);
      delay(300);
      noTone(PIN_BUZZER);
      delay(100);
      tone(PIN_BUZZER, 1000);
      delay(300);
      noTone(PIN_BUZZER);
    }
  }


  if(soilMoisture2Reading == LOW){
    isSoil2Moist=1;
    //Serial.println("Soil 2 is moist");
    digitalWrite(PIN_PUMP3, HIGH);
    isIrrigation2On=false;
    sprinkler2Active=false;
  }else{
    isSoil2Moist=0;
    //Serial.println("Soil 2 is dry");
    if(!isTankEmpty){
      delay(1000);
      digitalWrite(PIN_PUMP3, LOW);
      //Serial.println("Pump2!");
      isIrrigation2On=true;
      sprinkler2Active=true;
    }else{
      tone(PIN_BUZZER, 1000);
      delay(300);
      noTone(PIN_BUZZER);
      delay(100);
      tone(PIN_BUZZER, 1000);
      delay(300);
      noTone(PIN_BUZZER);
    }
  }


  if(isRaining && !isRoofOpen && waterLevel < 100){
      openRoof();
      isRoofOpen=true;
  }else if(!isRaining && isRoofOpen){
    closeRoof();
    isRoofOpen=false;
  }

  ///*
  if(currentTime-previousESP32Update >= 2000){
    Serial.print(humidity);
    Serial.print(",");
    Serial.print(temperature);
    Serial.print(",");
    Serial.print(waterLevel);
    Serial.print(",");
    Serial.print(isRaining);
    Serial.print(",");
    Serial.print(isSoil1Moist);
    Serial.print(",");
    Serial.print(isSoil2Moist);
    Serial.print(",");
    Serial.print(isSoil3Moist);
    Serial.print(",");
    Serial.print(isIrrigation1On);
    Serial.print(",");
    Serial.print(isIrrigation2On);
    Serial.print(",");
    Serial.print(isIrrigation3On);
    Serial.print(",");
    Serial.println(rainGaugeReading);
    previousESP32Update=currentTime;
  }
  //*/
  if(sprinkler1Active){
    //Serial.println("Sprinkler 1");
    sprinkler1.write(sprinklerAngle);
    delay(100);
  }

  if(sprinkler2Active){
    //Serial.println("Sprinkler 2");
    sprinkler2.write(sprinklerAngle);
    delay(100);
  }
  if(sprinkler3Active){
    //Serial.println("Sprinkler 3");
    sprinkler3.write(sprinklerAngle);
    delay(100);
  }

  if(sprinkler1Active||sprinkler2Active||sprinkler3Active){
  //if(sprinkler1Active){
    if(sprinklerDirection>0){
      sprinklerAngle=sprinklerAngle+45;
      if(sprinklerAngle>180){
        sprinklerDirection=0;
        sprinklerAngle=180;
      }
    }else{
      sprinklerAngle=sprinklerAngle-45;
      if(sprinklerAngle<0){
        sprinklerDirection=15;
        sprinklerAngle=0;
      }
    }
    
  }

  delay(500);
}