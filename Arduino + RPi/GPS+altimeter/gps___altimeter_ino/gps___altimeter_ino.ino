#include <Adafruit_GPS.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <Adafruit_MPL3115A2.h>
Adafruit_MPL3115A2 baro = Adafruit_MPL3115A2(); //SCL A5 en SDA A4
SoftwareSerial mySerial(3, 2); //RX D2 en TXX D3
Adafruit_GPS GPS(&mySerial);
#define GPSECHO  false
boolean usingInterrupt = false;
void useInterrupt(boolean);
//int sensor_read = 0;
String latitude = " ";

void setup(){
  Serial.begin(9600);
  GPS.begin(9600);
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
  useInterrupt(true);
  delay(1000);
  mySerial.println(PMTK_Q_RELEASE);
            }
  SIGNAL(TIMER0_COMPA_vect) {
  char c = GPS.read();
  #ifdef UDR0
  if (GPSECHO)
    if (c) UDR0 = c;  
  #endif
                             }
  
void useInterrupt(boolean v) {
  if (v) {
    // Timer0 is already used for millis() - we'll just interrupt somewhere
    // in the middle and call the "Compare A" function above
    OCR0A = 0xAF;
    TIMSK0 |= _BV(OCIE0A);
    usingInterrupt = true;
          } 
  else {
    // do not call the interrupt function COMPA anymore
    TIMSK0 &= ~_BV(OCIE0A);
    usingInterrupt = false;
          }
                              }
  
uint32_t timer = millis();
void loop() {

      if (! usingInterrupt) {
    char c = GPS.read();
    if (GPSECHO)
      if (c) Serial.print(c);}
    
  if (GPS.newNMEAreceived()) {
    if (!GPS.parse(GPS.lastNMEA())) 
    return;                   }
    
    //if (timer > millis())  timer = millis();
    //if (millis() - timer > 2000) { timer = millis();
  
    Serial.print("Fix:["); Serial.print((int)GPS.fix);Serial.println("]");
    Serial.print("Quality: ["); Serial.print((int)GPS.fixquality);Serial.println("]");
    Serial.print("Date/Time: [");
    Serial.print(GPS.year, DEC);Serial.print("-");
    Serial.print(GPS.day, DEC);Serial.print("-");
    Serial.print(GPS.month, DEC);Serial.print(" ");    
    Serial.print(GPS.hour, DEC); Serial.print(':');
    Serial.print(GPS.minute, DEC); Serial.print(':');
    Serial.print(GPS.seconds, DEC);Serial.print("]");Serial.println("");
    Serial.print("Loc_x(GM):[");
    Serial.print(GPS.latitudeDegrees, 15);Serial.print("]");Serial.println("");
    Serial.print("Loc_y(GM):[");
    Serial.print(GPS.longitudeDegrees,15);Serial.print("]");Serial.println("");
    Serial.print("Speed (m/s):[");Serial.print(GPS.speed*0.514444444);Serial.print("]");Serial.println("");
    Serial.print("Angle: [");Serial.print(GPS.angle);Serial.print("]");Serial.println("");
    Serial.print("Alt1tude: [");Serial.print(GPS.altitude);Serial.print("]");Serial.println("");
    Serial.print("Satellites: [");Serial.print(GPS.satellites);Serial.print("]");Serial.println("");
    
    //}              
    
    if (! baro.begin()) {
    Serial.println("Couldnt find sensor");
    return;
  }
  
    float pascals = baro.getPressure();
    Serial.print("Pressure: [");Serial.print(pascals/100);Serial.print("]");Serial.println("");
    float altm = baro.getAltitude();
    float tempC = baro.getTemperature();
    
    Serial.print("Alt2tude: [");Serial.print(altm);Serial.print("]");Serial.println("");
    Serial.print("Temperature: [");Serial.print(tempC);Serial.print("]");Serial.println("");
    delay(2000);
                                
}
            
