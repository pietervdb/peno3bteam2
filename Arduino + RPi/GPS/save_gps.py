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

target = open('GPSdata/tripID.txt','w')
last_fix = False


while(True):
    target = open('GPSdata/tripID.txt','a')
    v = arduino.readline()
    if v[0:4]=="Fix:":
        if v[4:7]=="[1]":
            print "fix!!"
            last_fix = True
        else:
            last_fix = False
            target.write("No Fix\n")
            print "no fix"    
    elif last_fix and v[0] != "$":
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
        target.write(v[0:i]+"\n") #schrijft de naam van de data
        target.write(v[i+1:j]+"\n")  #schrijft de data
        
        
        
    target.close()
        
    






#'groupID':'CWB2','userID':'r0369676','timestamp':'yr-dy-mnth hr-min-sec',
#'sensorData':[{'sensorID': 1,'data': [{'type': 'Point', 'coordinates': ['Location(JSON)'], 'height': ['Height']}],'timestamp': 'yr-dy-mnth hr-min-sec'}]))






    
    
