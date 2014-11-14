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

target = open('GPSdata2/tripID.txt','w')
last_fix = False

def decimalextender(number):
    if int(number) < 10:
        return "0"+number
    
def find_brackets(line):
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
    return [i,j]

def find_signs(line):
    signs = []
    i = 0
    while i < len(line):
        if line[i] == ":" or line[i] == "-" or line[i] == " ":
            signs.append(i)
        i+=1
    return signs
    
    
while(True):
    target = open('GPSdata2/tripID.txt','a')
    v = arduino.readline()
    signs_lst = []
    add = ""
    if v[0:4]=="Fix:":
        if v[4:7]=="[1]":
            print "fix!!"
            last_fix = True
        else:
            last_fix = False
            target.write("No Fix\n")
            print "no fix"
    
    elif v[0:4]=="Date":
        [i,j] = find_brackets(v)
        datime = v[i+1:j]
        signs_lst = find_signs(datime)
        
        year = decimalextender(datime[:signs_lst[0]])
        day = decimalextender(datime[signs_lst[0]+1:signs_lst[1]])
        month = decimalextender(datime[signs_lst[1]+1:signs_lst[2]])
        hours = decimalextender(datime[signs_lst[2]+1:signs_lst[3]])
        minutes = decimalextender(datime[signs_lst[3]+1:signs_lst[4]])
        seconds = decimalextender(datime[signs_lst[4]+1:])

        add = "20" + year + "-" + month + "-" + day + "T"+hours+":"+minutes+":"+seconds+".000Z"
        target.write(v[0:i]+"\n")
        target.write(add+"\n")     
        
    elif last_fix and v[0] != "$":
        [i,j] = find_brackets(v)
        target.write(v[0:i]+"\n") #schrijft de naam van de data
        target.write(v[i+1:j]+"\n")  #schrijft de data
        
        
        
    target.close()
        
    






#'groupID':'CWB2','userID':'r0369676','timestamp':'yr-dy-mnth hr-min-sec',
#'sensorData':[{'sensorID': 1,'data': [{'type': 'Point', 'coordinates': ['Location(JSON)'], 'height': ['Height']}],'timestamp': 'yr-dy-mnth hr-min-sec'}]))






    
    
