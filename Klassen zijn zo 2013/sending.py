import base64
import json
import os
import requests
from socketIO_client import SocketIO
from reading import *

domain = 'dali.cs.kuleuven.be'
port = 8080
start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO(domain,port)
userID = "r0369676"
groupID = "CWB2"
answer = 0

def connected():
    try:
        _ = requests.get(url='http://'+domain+':'+str(port)+'/', timeout=5)
        return True
    except requests.ConnectionError:
        return False
    
def on_response(*args):
    global answer
    print 'server message is',args
    answer = args

def send_queue(queue):
    for trip in queue:
        send_data(trip)

def send_data(tripnumber):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    read(tripnumber)
    start_time = find_time('start')
    end_time = find_time('stop')
    datalist = make_data_list()
    meta_dict = make_meta_dict()
    socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,\
                    'groupID':groupID,'startTime':start_time,\
                    'endTime':end_time,'sensorData':datalist,\
                    'meta':meta_dict}]),on_response)
    socketIO.wait(5)
    tripID = str(answer[0][u'_id'])
    send_pictures(tripID,tripnumber)
    


#PHOTODATA = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : str(tripID), "userID" : "r0369676", "raw" : file})

def send_pictures(tripID,tripnumber):
    photo_list = os.listdir('Data/Photos/'+tripnumber)
    i = 0
    for photo in photo_list:
        file = open('Data/Photos/'+tripnumber+'/'+photo,"rb").read().encode("base64")
        PHOTODATA = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file})
        url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(url, data = PHOTODATA, headers = headers)
        socketIO.emit('rt-sensordata', PHOTODATA,on_response)
        print "image",i
        i += 1
        
    














    
    
