import RPi.GPIO, serial, picamera, time, json, os, base64, gps, requests
import RPi.GPIO as GPIO
from socketIO_client import SocketIO

class photo:

    def __init__(self):
##        GPIO.setmode(GPIO.BCM)
##        GPIO.setup(7,GPIO.IN)
##        result = GPIO.input(7)
##        GPIO.setwarnings(False)
##        GPIO.setup(8,GPIO.OUT)
##        GPIO.setup(11,GPIO.OUT)
##        GPIO.setup(25,GPIO.OUT)
##        GPIO.output(8,False)
##        GPIO.output(11,True)
        self.aan = 0
        self.value=0

    def drukknop(last_result=0):
        result = GPIO.input(7)
        if result ==1 and last_result != 1:
            last_result = 1
            time.sleep(1)
        result = GPIO.input(7)
        if result ==1 and last_result==1:
            last_result=0
            time.sleep(1)
        return last_result    
        
