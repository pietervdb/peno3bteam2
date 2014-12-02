import base64 
import json 
from socketIO_client import SocketIO
import requests
import serial
import time
arduino = serial.Serial('COM7',115200)
arduino.readline()
arduino.readline()
arduino.readline()
index_woord=0
co=[]


while(True):
    v =  arduino.readline()
    if v[0]!='$':
        print v



    
    
