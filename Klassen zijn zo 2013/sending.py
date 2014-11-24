import base64
import json
import os
import requests
from socketIO_client import SocketIO
from reading import *
from PIL import Image

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
    
def send_pictures(tripID,tripnumber):
    photos = os.listdir('Data/Photos/'+tripnumber)
    resize_pictures(tripnumber,photos)
    photo_lists = split_in(photos,20)
    i = 0
    for photo_list in photo_lists:
##        print "start list"
        socketIO.emit('endBikeTrip',json.dumps({"_id":tripID}),on_response)
##        socketIO.wait(2)
        socketIO.on('server_message',on_response)
        socketIO.emit('start',json.dumps(start),on_response)
        socketIO.wait(2)
        for photo in photo_list:
            file = open('Data/Photos/'+tripnumber+'/'+photo,"rb").read().encode("base64")
            photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file})
            url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
            headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
            r = requests.post(url, data = photodata, headers = headers)
            socketIO.emit('rt-sensordata', photodata,on_response)
            #socketIO.wait(2)
            print "image",i
            i += 1

def split_in(list_complete, number):
    "split in sublists for sending purposes"
    split_list = []
    for i in range(0,len(list_complete), number):
        split_list.append(list_complete[i:i+number])
    return split_list

def resize_pictures(tripnumber,photos):
    max_size = 600
    
    for photo in photos:
        img = Image.open('Data/Photos/'+tripnumber+'/'+photo)
        width = img.size[0]
        length = img.size[1]
        width_length = [width, length]
        biggest = 0
        smallest = 1
        if length > width:
            biggest = 1
            
        if img.size[biggest]>max_size:
            
            percentage = (max_size/float(img.size[biggest]))
            smallestsize = int((float(img.size[smallest])*float(percentage)))
            if biggest == 0:
                img = img.resize((600,smallestsize), Image.ANTIALIAS)
            else:
                img = img.resize((smallestsize,600), Image.ANTIALIAS)
                
            #img.save('Data/Photos/'+tripnumber+'/'+photo[:-4]+".jpg")
            img.save('Data/Photos/'+tripnumber+'/'+photo[:-4]+".jpg","JPEG")
    










