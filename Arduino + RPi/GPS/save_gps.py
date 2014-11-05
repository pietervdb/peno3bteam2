import base64 
import json 
from socketIO_client import SocketIO
import requests
import serial
import time
import sys

arduino = serial.Serial('COM7',115200)
#arduino.readline()
#arduino.readline()
#arduino.readline()

target = open('tripID.txt','w')
last_fix = False


while(True):
    target = open('tripID.txt','a')
    v = arduino.readline()
    if v[0:4]=="Fix:":
        if v[6]==1:
            last_fix = True
        else:
            last_fix = False
    if (v[0:4] == "Date") and last_fix:
        i = 12
        while True:
            if v[i]=="]":
                break
            i += 1
        target.write(v[12:i])   #schrijft de timestamp als er fix is
        
    if last_fix:
        i = 0
        while True:
            if v[i] == "[":
                break
            i += 1
        j = i
        while True:
            if v[j] == "]":
                break
            j += 1
        target.write(v[0:i]) #schrijft de naam van de data
        target.write(v[i+1:j])  #schrijft de data
    target.close()
        
    











    
    
