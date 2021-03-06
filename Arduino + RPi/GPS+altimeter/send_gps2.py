import base64 
import json 
from socketIO_client import SocketIO
import requests
import sys
import os
global lrs
global fix_on

start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO('dali.cs.kuleuven.be',8080)

tripID = "tripID"           #moet aangepast worden (duh)
userID = "r0369676"
groupID = "CWB2"

starTime = ""
endTime = ""
lrs = 0
lijnen_lijst = []
fix_on = []

######NEEDS TO BE REMOVED UPON ACTUAL SERVER USE: only for individual function diagnostics######################
target = open('GPSdata/'+tripID+'.txt')
with target as f:
    lijnen_lijst = f.readlines()
target.close()

#################################################################################################################

def find_time(tripID,st):
    if st == 'start':
        return lijnen_lijst[fix_on[0]+4][:-1]
    elif st == 'stop':
        return lijnen_lijst[fix_on[-1]+4][:-1]

def find_fix(tripID):
    fix_on[:] = []
    i = 0
    while i < len(lijnen_lijst):
        if lijnen_lijst[i][0:5] == "Fix:Y":     #veranderen in Y uiteraard!!!
            fix_on.append(i)
        i += 24
    
def add_number(tripID,first_five):
    i = 0
    while True:
        if lijnen_lijst[i][0:5] == first_five:
            solution = i+1
            break
        i += 1
        
    return solution

def find_GPS_data(tripID,first_five):
    "data die afhankelijk is van GPS-fix"
    add_nr = add_number(tripID,first_five)
    data_lijst = []
    
    if first_five == "Date/":
        for i in fix_on:
            data_lijst.append(lijnen_lijst[i+add_nr][:-1])
            
    else:
        for i in fix_on:
            data_lijst.append(float(lijnen_lijst[i+add_nr][:-1]))
                
    return data_lijst


def find_data(tripID,first_five):
    "data die afhankelijk is van GPS-fix"
    i = add_number(tripID,first_five)
    data_lijst = []
    
    if first_five == "Date/":
        while i < len(lijnen_lijst):
            data_lijst.append(lijnen_lijst[i][:-1])
            i += 24

    else:
        while i < len(lijnen_lijst):
            data_lijst.append(float(lijnen_lijst[i][:-1]))
            i += 24
        
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
    
def send_all():
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    socketIO.wait(0.5)
    target = open('GPSdata/'+tripID+'.txt')
    with target as f:
        lijnen_lijst = f.readlines()
    target.close()
    find_fix(tripID)
    startTime = find_time(tripID,'start')
    endTime = find_time(tripID,'stop')   
    datalist = make_data_list(tripID)
    meta_dict = make_meta_list(tripID)
    socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,'groupID':groupID,'startTime':startTime,'endTime':endTime,\
        'sensorData':datalist,'meta':meta_dict}]),on_response)
    socketIO.wait(10)

def make_data_list(tripID):
    datalist = []
    #gps
    GPS_coordinaten = compose_GPS_coordinates(tripID)
    timestamp_gps_list = find_GPS_data(tripID,'Date/')
    speed_list = find_GPS_data(tripID,'Speed')
    for i in range(len(GPS_coordinaten)):
        datalist.append({'sensorID':1,'timestamp':timestamp_gps_list[i],'data': [{'type':'Point', 'coordinates':GPS_coordinaten[i],\
                                                 'unit':'google','speed':[speed_list[i]]}]})
    #barometer
    temperature_list = find_data(tripID,"Tempe")
    pressure_list = find_data(tripID,"Press")
    alt2tude_list = find_data(tripID,"Alt2t")
    #timestamp_list = find_data(tripID,'Date/')
    time_point = 0
    for i in range(len(temperature_list)):
        if i*24 in fix_on:
            datalist.append({'sensorID':10, 'timestamp':timestamp_gps_list[time_point],'data': [{'pressure':[pressure_list[i]],\
                                    'temperature':[temperature_list[i]],'height':[alt2tude_list[i]]}]})
            time_point += 1

        else:
            datalist.append({'sensorID':10,'data': [{'pressure':[pressure_list[i]],\
                                    'temperature':[temperature_list[i]],'height':[alt2tude_list[i]]}]})
    return datalist

def make_meta_list(tripID):
    speed_list = find_GPS_data(tripID,"Speed")
    averageSpeed = sum(speed_list)/len(speed_list)
    maxSpeed = max(speed_list)
    temp_list = find_GPS_data(tripID,"Tempe")
    avgTemp = sum(temp_list)/len(temp_list)
    maxTemp = max(temp_list)
    minTemp = min(temp_list)
    meta_dict = {"averageSpeed":averageSpeed,"maxSpeed":maxSpeed,"other":[{"temperature":[minTemp,avgTemp,maxTemp]}]}
    return meta_dict
