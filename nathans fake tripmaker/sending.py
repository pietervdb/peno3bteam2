import base64
import json
import requests
import os
from socketIO_client import SocketIO
from reading import *
import urllib2
from zet_in_lijst import *

domain = 'dali.cs.kuleuven.be'
port = 8080

socketIO = SocketIO(domain,port)
userID = "r0369676"
groupID = "cwb2"
answer = 0
tripID = ''
start = {'purpose':'batch-sender','groupID':groupID,'userID':userID}
print 'checked'

def connected2():
    "checks whether the pi is connected tot the internet"
    try:
        _ = requests.get(url='http://'+domain+':'+str(port)+'/', timeout=5)
        return True
    except requests.ConnectionError:
        return False

def connected():
    try:
        response=urllib2.urlopen('http://74.125.228.100', timeout=1)
        return True
    except urllib2.URLError as err: pass
    return False
print 'checked2'

def on_response(*args):
    global answer
    print 'server message is',args
    answer = args
    print answer

def send_queue(queue):
    "send a queue of trips"
    for trip in queue:
        send_data(trip)

def send_GPS(tripnumber):
    global tripID
    socketIO.on('server_message',on_response)
    socketIO.wait(2)
    socketIO.emit('start',json.dumps(start),on_response)
    socketIO.wait(2)
    read2(tripnumber)
    start_time = find_time('start')
    end_time = find_time('stop')
    datalist = make_gps_datalist()
    meta_dict = make_meta_dict2()
    print "emit"
    print "data:"
    for i in datalist:
        print i
    print "meta:"
    print meta_dict
    print start_time
    print end_time
    socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,\
                    'groupID':groupID,'startTime':start_time,'endTime':end_time,'sensorData':datalist,'meta':meta_dict}]),on_response)
    socketIO.wait(5)
    tripID = str(answer[0][u'_id'])
    send_da_picz()


def send_da_picz():
    timestamp_list = give_time()
    i = 0
    socketIO.emit('endBikeTrip',json.dumps({"_id":tripID}),on_response) #is this required? also check socketIO.wait(x)
    socketIO.wait(2)
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    socketIO.wait(2)
    meta_dict = make_meta_dict2()
    a = 0
    while i < len(timestamp_list):
        if a == 100:
            print "reboot serving"
            socketIO.emit('endBikeTrip', json.dumps({"_id":tripID}),on_response)
            socketIO.wait(2)
            socketIO.on('server_message',on_response)
            socketIO.emit('start',json.dumps(start),on_response)
            socketIO.wait(2)
            a = 0
        file = open('screenshots/'+str(i)+'.jpg',"rb").read().encode("base64")
        photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file, "timestamp" : timestamp_list[i],'meta':meta_dict})
        url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(url, data = photodata, headers = headers)
        socketIO.emit('rt-sensordata', photodata,on_response)
        socketIO.wait(0.2)
        print "image",i
        i += 1
        a += 1
    print "sent ;^)"

def send_data(tripnumber):
    "send the trips' data"
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
        socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,\
                    'groupID':groupID,\
                    'sensorData':datalist,\
                    'meta':meta_dict}]),on_response)
    
    else:
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
    fix_list = find_fix(True)
    data_fix_list = []
    timestamp_list = find_data('Date/')
    for fix in fix_list:
        data_fix_list.append(int(float(fix)/24))
    i = 0
    for photo_list in photo_lists:
        socketIO.emit('endBikeTrip',json.dumps({"_id":tripID}),on_response) #is this required? also check socketIO.wait(x)
        socketIO.wait(2)
        socketIO.on('server_message',on_response)
        socketIO.emit('start',json.dumps(start),on_response)
        socketIO.wait(2)
        for photo in photo_list:
            file = open('Data/Photos/'+tripnumber+'/'+photo,"rb").read().encode("base64")
            
            if i in data_fix_list:
                photodata = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : tripID, "userID" : "r0369676", "raw" : file, "timestamp" : timestamp_list[i]})
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
