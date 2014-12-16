import base64
import json
import requests
import os
from socketIO_client import SocketIO
from reading import *
from saving import *
import urllib2
import time
domain = 'dali.cs.kuleuven.be'
port = 8080
start = {'purpose':'batch-sender','groupID':'cwb2','userID':'r0369676'}
socketIO = SocketIO(domain,port)
userID = "r0369676"
groupID = "cwb2"
answer = 0
tripID = ''
def connected2():
    "checks whether the pi is connected tot the internet"
    try:
        _ = requests.get(url='http://'+domain+':'+str(port)+'/', timeout=5)
        return True
    except requests.ConnectionError:
        return False


def on_response(*args):
    global answer
    print 'server message is',args
    answer = args
    return answer

def send_queue(queue):
    "send a queue of trips"
    for trip in queue:
        send_data(trip)

def send_data(tripnumber):
    "send the trips' data"
    process_raw_data(tripnumber)
    global tripID
    socketIO.on('server_message',on_response)
    socketIO.wait(2)
    socketIO.emit('start',json.dumps(start),on_response)
    socketIO.wait(2)
    
    read(tripnumber)
    start_time = find_time('start')
    end_time = find_time('stop')
    datalist = make_data_list()
    meta_dict = make_meta_dict()
    if start_time == None:
        print 'emitting'
        socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,\
                    'groupID':groupID,\
                    'sensorData':datalist,\
                    'meta':meta_dict}]),on_response)
    
    else:
        print 'emitting'
        socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,\
                    'groupID':groupID,'startTime':start_time,\
                    'endTime':end_time,'sensorData':datalist,\
                    'meta':meta_dict}]),on_response)
    
    socketIO.wait(5)
    tripID = str(answer[0][u'_id'])
    print 'send pictures'
    send_pictures(tripnumber)
            
def send_pictures(tripnumber):
    photo_lists = split_in(tripnumber,20)   #more/less? test!
    a,fix_list = find_fix(True)
    data_fix_list = []
    timestamp_list = find_data('Date/')
    i=0
    while i<len(fix_list):
        if fix_list[i] == 'y':
            data_fix_list.append(i)
        i+=1
    i = 1
    for photo_list in photo_lists:
        socketIO.emit('endBikeTrip',json.dumps({"_id":tripID}),on_response) #is this required? also check socketIO.wait(x)
        socketIO.wait(2)
        socketIO.on('server_message',on_response)
        socketIO.emit('start',json.dumps(start),on_response)
        socketIO.wait(2)
        for photo in photo_list:
            print photo_list
            file = open('Data/Photos/'+tripnumber+'/'+photo,"rb").read().encode("base64")
            
            if i in data_fix_list:
                photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file, "timestamp" : timestamp_list[i]})
##            elif i+1 in data_fix_list:
##                photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file, "timestamp" : timestamp_list[i+1]})  
##            elif i+2 in data_fix_list:
##                photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file, "timestamp" : timestamp_list[i+2]})  
##            elif i+3 in data_fix_list:
##                photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file, "timestamp" : timestamp_list[i+3]})  


            else:
                photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file})
                
            url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
            headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
            r = requests.post(url, data = photodata, headers = headers)
            socketIO.emit('rt-sensordata', photodata,on_response)
            socketIO.wait(0.2)
            print "image",i
            i += 1


def split_in(tripnumber,number=10):
    "split in sublists for sending purposes"
    list_sorted = sort_photos(os.listdir('Data/Photos/'+tripnumber))
    split_list = []
    for i in range(0,len(list_sorted), number):
        split_list.append(list_sorted[i:i+number])
    return split_list

def sort_photos(photolist):
    "sorteert de foto's: ze moeten a) juist genoemd en b) jpg zijn"
    sorted_list = []
    i = 0
    while i < len(photolist):
        sorted_list.append(str(i)+".jpg")
        i += 1
    return sorted_list
