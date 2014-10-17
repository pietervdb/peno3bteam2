void setup() {
  Serial.begin(9600);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(A0);
  
  if(sensorValue > 690){ //sensor wordt afgedekt
    Serial.println(sensorValue);
    digitalWrite(11,HIGH);digitalWrite(10,HIGH);digitalWrite(9,HIGH); //drie kleuren worden aangezet
    delay(5000); //er wordt een foto genomen
    digitalWrite(11,LOW);digitalWrite(10,LOW);digitalWrite(9,LOW);
  }
     
  delay(100);}
