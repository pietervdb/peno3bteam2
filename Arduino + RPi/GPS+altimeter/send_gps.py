import base64 
import json 
from socketIO_client import SocketIO
import requests
import sys
import os

global lrs
lrs = 0
start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO('dali.cs.kuleuven.be',8080)
tripID = ""
userID = "r0369676"
groupID = "CWB2"
starTime = ""
endTime = ""

def find_time(tripID,st):
    target = open('GPSdata/'+'tripID'+'.txt')
    with target as f:
        lijnen_lijst = f.readlines()
    if st == 'start':
        target.close()
        return lijnen_lijst[2]
    elif st == 'stop':
        target.close()
        return lijnen_lijst[-22]

def find_non_GPS_data(tripID,first_five):
    "data van de altimeter-sensor"
    target = open('GPSdata/'+'tripID'+'.txt')
    with target as f:
        lijnen_lijst = f.readlines()
        
    data_lijst = []
    i = 0
    while i < len(lijnen_lijst):
        if lijnen_lijst[i][0:5] == first_five:
            data_lijst.append(lijnen_lijst[i+1][:-1])
        i += 1
        
    return data_lijst
        
def find_GPS_data(tripID,first_five):
    "data die afhankelijk is van GPS-fix"
    target = open('GPSdata/'+'tripID'+'.txt')
    punt_start = []
    with target as f:
        lijnen_lijst = f.readlines()
        
    i = 0
    while i < len(lijnen_lijst):
        if lijnen_lijst[i][0:5] == "Fix:N":     #veranderen in Y uiteraard!!!
            punt_start.append(i)
        i += 24
        
    i = 0
    while True:
        if lijnen_lijst[i][0:5] == first_five:
            add_number = i+1
            break
        i += 1
            
    data_lijst = []
    for i in punt_start:
        data_lijst.append(lijnen_lijst[i+add_number][0:-1])

    target.close()
    return data_lijst

def compose_GPS_data(tripID):
    a = find_GPS_data(tripID,'Loc_x')
    b = find_GPS_data(tripID,'Loc_y')
    c = []
    d = len(a)
    i = 0
    while i < d:
        c.append([float(a[i]),float(b[i])])
        i+=1
    return c

def on_response(*args):
    global lrs
    print 'server message is',args
    lrs = args

def send_GPS_lijst():
    startTime = find_time(tripID,'start')[:-1]
    endTime = find_time(tripID,'stop')[:-1]
    GPS_lijst = compose_GPS_data(tripID)
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)

    socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet
    #tripID = lrs[0][u'_id']


    print socketIO.emit('batch-tripdata',json.dumps([{'userID':userID,'groupID':groupID,'startTime':startTime,'endTime':endTime,\
            'sensorData':[{'sensorID': 1, 'data': [{'type': 'MultiPoint', 'coordinates': GPS_lijst}]}]}]), on_response)

    socketIO.wait(5000)
  
def send_GPS_points():
    startTime = find_time(tripID,'start')[:-1]
    endTime = find_time(tripID,'stop')[:-1]
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    


##
##socketIO.emit('batch-tripdata',json.dumps('groupID':'CWB2',\
##            'userID':'r0369676','timestamp':'yr-dy-mnth hr-min-sec',\
##'sensorData':X))
##
##X = [
##
##    {'sensorID': 1,'data': [{'type': 'Point',\
##'coordinates': ['Location(JSON)']}],\
##    'timestamp': 'yr-dy-mnth hr-min-sec'},
##
##    {'sensorID': 1,'data': [{'type': 'Point',\
##'coordinates': ['Location(GM)'], 'height': ['Height']}],\
##    'timestamp': 'yr-dy-mnth hr-min-sec'},
##
##    {'sensorID': 1,'data': [{'type': 'Point',\
##'coordinates': ['Location(GM)'], 'height': ['Height']}],\
##    'timestamp': 'yr-dy-mnth hr-min-sec'}
##
##    ]
##









