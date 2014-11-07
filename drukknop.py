import RPi.GPIO as GPIO
import serial, picamera, time, json, os, base64, gps, requests
GPIO.setmode(GPIO.BCM)
GPIO.setup(7,GPIO.IN)
result = GPIO.input(7)
last_result = 0
while True:
    result = GPIO.input(7)
    if result ==1 and last_result != 1:
        last_result = 1
        time.sleep(1)
    result = GPIO.input(7)
    if result ==1 and last_result==1:
        last_result=0
        time.sleep(1)
    print last_result
        
        
