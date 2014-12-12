import serial
import urllib2
import base64
import json
import requests
import os
from socketIO_client import SocketIO
from help_functions import *
##arduino = serial.Serial('COM7',9600)
arduino = serial.Serial('/dev/serial/by-id/usb-Gravitech_ARDUINO_NANO_13BP0853-if00-port0',9600)
whitelist = ['Qua','Loc','Spe','Ang','Alt','Pre','Tem']
whitelist2 = ['Locat','Speed','Alt2t','Press','Tempe']
##EDIT######
##step: 24 => 18
##find_time(st) 4 => 2 (2 times)

def save_arduino_raw(tripnumber):
    text = 'Data/'+tripnumber+'raw.txt'
    target = open(text,'a')
    stop = False
    while not stop:
        line = arduino.readline()
        print line
        target.write(line)
        if line[0] == 'S':
            a , speed = split_data(line)
        if line[0]=='T':
            target.close()
            stop = True
    return speed

def connected():
    try:
        response=urllib2.urlopen('http://74.125.228.100', timeout=1)
        return True
    except urllib2.URLError as err: pass
    return False

def process_raw_data(tripnumber):
    textfile = 'Data/'+tripnumber+'.txt'
    target = open(textfile,'a')
    text = 'Data/'+tripnumber+'raw.txt'
    target2 = open(text,'r')
    raw_lijnen_lijst = target2.readlines()
    last = ''
    first = ''
    for line in raw_lijnen_lijst:
        if line[:3] == 'Fix':
            if line[4:7] == '[1]':
                first = 'Fix:Y'
            else:
                first = 'Fix:N'
            second = '\n'
        
        if line[:3] == 'Dat':
            [intro, datime] = split_data(line)
            correct_datime = timewriter(datime)                         
            first = intro + '\n'
            second = correct_datime + '\n'
        elif line[:3] in whitelist: #line[:5] in whitelist2 (geen alt1, angle, sat#, quality)
            [intro, data] = split_data(line)
            first = intro + '\n'
            second = data + '\n'
            
        if last != first:
            target.write(first)
            target.write(second)
        last = first
        if line[0] == 'T':
            target.write('End\n')
    target.close

            
##    while not stop:
##        line = arduino.readline()
##        print line
##        while start:            
##            if line[:3] == 'Fix':
##            
##                if not first_time:
##                    target.write('\n')
##                    
##                if line[4:7] == '[1]':
##                    first = 'Fix:Y'
##                else:   #misschien moet dit 'elif line[4:7] == '[0]':' worden
##                    first = 'Fix:N'
##                    
##                second = '\n'
##                start = False
##            else:
##                line = arduino.readline()           
##
##        if line[:3] == 'Dat':
##            [intro, datime] = split_data(line)
##            correct_datime = timewriter(datime)                         
##            first = intro + '\n'
##            second = correct_datime + '\n'
##            
##        elif line[:3] in whitelist: #line[:5] in whitelist2 (geen alt1, angle, sat#, quality)
##            [intro, data] = split_data(line)
##            first = intro + '\n'
##            second = data + '\n'
##            
##        if last != first:
##            target.write(first)
##            target.write(second)
##        last = first
##        
##        if line[0] == 'T':
##            target.write('End')
##            target.close()
##            stop = True
##
