import base64 
import json 
from socketIO_client import SocketIO
import requests
import serial
import time
import sys
#we creeren een nieuw txt file:
name = 'tripID.txt'
open(name,'w')



arduino = serial.Serial('COM7',115200)
#arduino.readline()
#arduino.readline()
#arduino.readline()

target = open('tripID.txt','w')
line = ''
a = 0
while(True):
    target = open('tripID.txt','a')
    v =  arduino.readline()
    if v[0:4]=="Time":
        a = 0
    if a == 0:
        print "nu wordt aan de file toegevoegd:"
        print line
        target.write(line)
        target.write("\n")
        line = ''
    target.close()
    line+=v+''
    a+=1



    
    
