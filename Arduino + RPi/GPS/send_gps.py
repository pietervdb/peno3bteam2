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
tripID = ''
userID = "r0369676"
groupID = 'CWB2'


def find_time(tripID,st):
    target = open('GPSdata/'+'tripID'+'.txt')
    with target as f:
        lijnen_lijst = f.readlines()
    if st == 'start':
        return lijnen_lijst[1]
    elif st == 'stop':
        return lijnen_lijst[-15]
                

    
def find_data(tripID,first_five):
    target = open('GPSdata/'+'tripID'+'.txt')
    aantal_punten = 0
    with target as f:
        lijnen_lijst = f.readlines()
    for lijn in lijnen_lijst:
        if lijn[0:3] == "Sat":
            aantal_punten +=1
    data_lijst = []
    i = 0
    aantal_punten_gevonden = 0
    while i < len(lijnen_lijst) and aantal_punten_gevonden < aantal_punten:
        if lijnen_lijst[i][0:5] == first_five:
            data_lijst.append(lijnen_lijst[i+1][0:-2])
            aantal_punten_gevonden += 1
        i+=1
    return data_lijst

def compose_GPS(tripID):
    a = find_data(tripID,'Loc_x')
    b = find_data(tripID,'Loc_y')
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


def send_GPS():
    startTime = find_data(tripID,'start')[0:-1]
    endTime = find_data(tripID,'stop')[0:-1]
    GPS_lijst = compose_GPS(tripID)
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)

    socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet
    
    #tripID = lrs[0][u'_id']
    sensorData = []
    for point in GPS_lijst:
        sensorData.append({'sensorID':1,'data':[{'type':'MultiPoint',"coordinates":[point]}]})
    print ""
    print ""
    print ""
    print ""
    print ""
    print "check dit:"
    print sensorData
    print socketIO.emit('batch-tripdata',json.dumps([{'userID':userID,'groupID':groupID,'sensorData':[{'sensorID': 1, 'data': [{'type': 'MultiPoint', 'coordinates': [[50.863998, 4.679131]]}]}]}]), on_response)
    print ""
    print ""
    print ""
    print ""
    socketIO.wait(5000)
        
    
    
#send_GPS()




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









