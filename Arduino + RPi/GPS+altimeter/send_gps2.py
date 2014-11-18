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
tripID = "tripID"
userID = "r0369676"
groupID = "CWB2"
starTime = ""
endTime = ""
lijnen_lijst = []
######NEEDS TO BE REMOVED UPON ACTUAL SERVER USE: only for individual function diagnostics######################
target = open('GPSdata/'+tripID+'.txt')
with target as f:
    lijnen_lijst = f.readlines()
##target.close()

#################################################################################################################

def find_time(tripID,st):
    if st == 'start':
        return lijnen_lijst[4][:-1]
    elif st == 'stop':
        return lijnen_lijst[-20][:-1]

        
def find_GPS_data(tripID,first_five):
    "data die afhankelijk is van GPS-fix"
    punt_start = []
        
    i = 0
    while i < len(lijnen_lijst):
        if lijnen_lijst[i][0:5] == "Fix:Y":     #veranderen in Y uiteraard!!!
            punt_start.append(i)
        i += 24
        
    i = 0
    while True:
        if lijnen_lijst[i][0:5] == first_five:
            add_number = i+1
            break
        i += 1
            
    data_lijst = []
    if first_five == "Date/":
        for i in punt_start:
            data_lijst.append(lijnen_lijst[i+add_number][0:-1])
        target.close()
        return data_lijst
        
    for i in punt_start:
        data_lijst.append(float(lijnen_lijst[i+add_number][0:-1]))

    target.close()
    return data_lijst


def find_data(tripID,first_five):
    "data die afhankelijk is van GPS-fix"
    punt_start = []
        
##    i = 0
##    while i < len(lijnen_lijst):
##        if lijnen_lijst[i][0:3] == "Fix":     #veranderen in Y uiteraard!!!
##            punt_start.append(i)
##        i += 22
##    print punt_start
    i = 0
    while True:
        if lijnen_lijst[i][0:5] == first_five:
            i+=1
            break
        i += 1
        
    data_lijst = []
    while i < len(lijnen_lijst):
        data_lijst.append(float(lijnen_lijst[i][:-1]))
        i += 24

    target.close()
    return data_lijst

def compose_GPS_coordinates(tripID):
    a = find_GPS_data(tripID,'Loc_x')
    b = find_GPS_data(tripID,'Loc_y')
    c = []
    d = len(a)
    i = 0
    while i < d:
        c.append([a[i],b[i]])
        i+=1
    return c

def on_response(*args):
    global lrs
    print 'server message is',args
    lrs = args

def send_GPS_lijst():
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)

    socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet
    #tripID = lrs[0][u'_id']
    startTime = find_time(tripID,'start')
    endTime = find_time(tripID,'stop')
    GPS_lijst = compose_GPS_coordinates(tripID)

    print socketIO.emit('batch-tripdata',json.dumps([{'userID':userID,'groupID':groupID,'startTime':startTime,'endTime':endTime,\
            'sensorData':[{'sensorID': 1, 'data': [{'type':'MultiPoint', 'coordinates':GPS_lijst, 'unit':'google'}]}]}]), on_response)

    socketIO.wait(5000)





    
def send_all():
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    socketIO.wait(0.5)
    #print "lrs is",lrs
    #echt_tripID = lrs[0][u'_id']
    target = open('GPSdata/'+tripID+'.txt')
    with target as f:
        lijnen_lijst = f.readlines()
    
    
    startTime = find_time(tripID,'start')
    endTime = find_time(tripID,'stop')   
    datalist = make_data_list(tripID)
    meta_dict = make_meta_list(tripID)
    target.close()
    print socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,'groupID':groupID,'startTime':startTime,'endTime':endTime,\
        'sensorData':datalist,'meta':meta_dict}]),on_response)
    socketIO.wait(5)
    

def make_data_list(tripID):
    datalist = []
    #gps
    GPS_coordinaten = compose_GPS_coordinates(tripID)
    timestamp_list = find_GPS_data(tripID,"Date/")
    i = 0
    while i < len(GPS_coordinaten):
        datalist.append({'sensorID':1,"timestamp":timestamp_list[i],'data': [{'type':'Point', 'coordinates':GPS_coordinaten[i],\
                                                 'unit':'google'}]})
        i += 1

    #barometer
    temperature_list = find_data(tripID,"Tempe")
    pressure_list = find_data(tripID,"Press")
    alt2tude_list = find_data(tripID,"Alt2t")
    i = 0
    while i < len(temperature_list):
        datalist.append({'sensorID':10, 'data': [{"pressure":[pressure_list[i]],\
                                    "temperature":[temperature_list[i]],"height":[alt2tude_list[i]]}]})
        i += 1
    
    return datalist

def make_meta_list(tripID):
    speed_list = find_GPS_data(tripID,"Speed")
    averageSpeed = sum(speed_list)/len(speed_list)
    maxSpeed = max(speed_list)
    meta_dict = {"averageSpeed":averageSpeed,"maxSpeed":maxSpeed}
    return meta_dict
    
    
    
    
    





    

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









