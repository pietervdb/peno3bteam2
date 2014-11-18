import base64 
import json 
from socketIO_client import SocketIO
import requests
import serial
import time
import sys

arduino = serial.Serial('COM7',9600)
target = open('GPSdata/tripID.txt','w')
last_fix = False

def decimalextender(number):
    "Zorgt ervoor dat getallen uit 2 cijfers bestaan in de datum en tijd"
    if int(number) < 10:
        return "0"+number
    else:
        return number
    
def split_data(line):
    print line
    "Zoekt de haken om effectieve data van intro te splitsen"
    i = 0
    while True:
        if line[i] == "[":
            break
        i += 1
    j = i
    while True:
        if line[j] == "]":
            break
        j += 1
    return [line[:i-1],line[i+1:j]]

def find_signs(line):
    "Vindt de speciale tekens in een lijn"
    signs = []
    i = 0
    special_signs = [":","-"," "]
    while i < len(line):
        if line[i] in special_signs:
            signs.append(i)
        i+=1
    return signs

while(True):
    target = open('GPSdata/tripID.txt','a')
    line = arduino.readline()
    whitelist = ["Qua","Loc","Spe","Ang","Alt","Sat","Pres","Tem"]               #,"Pre","Tem" voor barometer
    if line[0:4]=="Fix:":
        if line[4:7]=="[1]":
            print "fix!!"
            last_fix = True
            target.write("Fix:Y\n")
        else:
            last_fix = False
            target.write("Fix:N\n")
            print "no fix"
    
    elif line[0:4]=="Date":
        [intro,datime] = split_data(line)
        signs_lst = find_signs(datime)
        year = decimalextender(datime[:signs_lst[0]])
        day = decimalextender(datime[signs_lst[0]+1:signs_lst[1]])
        month = decimalextender(datime[signs_lst[1]+1:signs_lst[2]])
        hours = decimalextender(str(1+int(datime[signs_lst[2]+1:signs_lst[3]]))) #UTC+1
        minutes = decimalextender(datime[signs_lst[3]+1:signs_lst[4]])
        seconds = decimalextender(datime[signs_lst[4]+1:])
        correct_datime = "20" + year + "-" + month + "-" + day + "T"+hours+":"+minutes+":"+seconds+".000Z"
        target.write(intro+"\n")
        target.write(correct_datime+"\n")
        
    elif line[:3] in whitelist:
        [intro, data] = split_data(line)
        target.write(intro+"\n") #schrijft de naam van de data
        target.write(data+"\n")  #schrijft de data
    if line[0] == "T":
        target.write("End\n")
    target.close()
