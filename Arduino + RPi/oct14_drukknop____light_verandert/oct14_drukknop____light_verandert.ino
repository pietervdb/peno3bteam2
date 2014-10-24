void setup(){Serial.begin(9600);pinMode(5, INPUT);pinMode(9, OUTPUT);pinMode(10, OUTPUT);}

int aan = 0;

void loop() {
  if (aan == 1){digitalWrite(9,HIGH);digitalWrite(10,LOW);}
  if (aan == 0){digitalWrite(10,HIGH);digitalWrite(9,LOW);}
  int drukknop = digitalRead(5);
  Serial.println(aan);
  if (drukknop == 0){
    if (aan == 1){aan = 0;}
    else{aan = 1;}
    delay(500);
  }
  delay(50);
}
