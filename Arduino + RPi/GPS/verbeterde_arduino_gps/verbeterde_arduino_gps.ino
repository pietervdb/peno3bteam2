#include <Adafruit_GPS.h>
#include <SoftwareSerial.h>
SoftwareSerial mySerial(3, 2);
Adafruit_GPS GPS(&mySerial);
#define GPSECHO  true
boolean usingInterrupt = false;
void useInterrupt(boolean);


void setup(){
  Serial.begin(115200);
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
  } else {
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
      if (c) Serial.print(c);
  }
  
  if (GPS.newNMEAreceived()) {
    if (!GPS.parse(GPS.lastNMEA())) 
    return;}
  if (timer > millis())  timer = millis();
  if (millis() - timer > 2000) { timer = millis();
    Serial.print("Fix: "); Serial.print((int)GPS.fix);
    
    Serial.print("\nDate/Time: [");Serial.println("20");
    Serial.println(GPS.year, DEC);Serial.print("-");
    Serial.println(GPS.day, DEC);Serial.print("-");
    Serial.println(GPS.month, DEC);Serial.print(" ");    
    Serial.print(GPS.hour, DEC); Serial.print(':');
    Serial.print(GPS.minute, DEC); Serial.print(':');
    Serial.print(GPS.seconds, DEC);Serial.print("]");

    Serial.print(" quality: "); Serial.println((int)GPS.fixquality); 
    if (GPS.fix) {
      Serial.print("Loc(GM):[");
      Serial.print(GPS.latitudeDegrees, 4);
      Serial.print(", "); 
      Serial.println(GPS.longitudeDegrees, 4);Serial.print("]");
      Serial.print("Loc(JSON):[");
      Serial.print(GPS.latitude, 4); Serial.print(GPS.lat);
      Serial.print(", "); 
      Serial.print(GPS.longitude, 4); Serial.println(GPS.lon);Serial.print("]");
      
      Serial.print("Speed (knots):["); Serial.println(GPS.speed);Serial.print("]");
      Serial.print("Angle: "); Serial.println(GPS.angle);
      Serial.print("Altitude:["); Serial.println(GPS.altitude);Serial.print("]");
      Serial.print("Satellites: "); Serial.println((int)GPS.satellites);
    }
  }
}
  
  
