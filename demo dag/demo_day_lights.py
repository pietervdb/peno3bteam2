import os
import json
import base64
import picamera
import PIL
from PIL import Image
from PIL import ImageGrab
import time
from socketIO_client import SocketIO
import requests
import datetime
from time import strftime, gmtime
import RPi.GPIO as GPIO

##os.makedirs('Photos')     ##(only if first time on pi)
name_list = []

domain = 'dali.cs.kuleuven.be'
port = 8080
socketIO = SocketIO(domain,port)
answer = 0
timestamp = ''
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(8,GPIO.OUT)
GPIO.setup(9,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)
GPIO.setup(25,GPIO.OUT)
GPIO.output(8,False)
GPIO.output(9,False)
GPIO.output(11,False)
GPIO.output(25,False)

def decimalextender(number):
    "converts one-digit numbers to two-digits: 1 -> 01, 5 -> 05, 10 -> 10"
    if int(number) < 10:
        return "0"+number
    else:
        return number
    
def snap(name):
    with picamera.PiCamera() as camera:
        camera.capture('Photos/'+name+'.jpg')
    img = Image.open('Photos/'+name+'.jpg')
    img = img.resize((500,338), Image.ANTIALIAS)
    img.save('Photos/'+name+'.jpg',"JPEG")    

def snap2(name):
    "snaps screenshot"
    img = PIL.ImageGrab.grab()
    ##img = img.resize((500,338), Image.ANTIALIAS)
    img.save('Photos/'+name+'.jpg',"JPEG")
    
def on_response(*args):
    global answer
    print 'server message is',args
    answer = args

def send(name):
    "sends gps, time, picture"
    userID = name
    groupID = name
    time = strftime("%Y-", gmtime())+decimalextender(strftime("%m", gmtime()))+\
           '-'+decimalextender(strftime("%d", gmtime()))+'T'+decimalextender(strftime("%H", gmtime()))+\
           ':'+decimalextender(strftime("%M", gmtime()))+':'+decimalextender(strftime('%S', gmtime()))+".000z"
    socketIO.on('server_message',on_response)
    ##socketIO.wait(1)
    start = {'purpose':'batch-sender','groupID':name,'userID':name}
    socketIO.emit('start',json.dumps(start),on_response)
    ##socketIO.wait(1)
    socketIO.emit('batch-tripdata', json.dumps([{'userID':name,\
                    'groupID':name,'startTime':time,\
                    'endTime':time,'sensorData':[{'sensorID':1,'timestamp':time,'data': [{'type':'Point',\
                                    'coordinates':[50.8611926,4.681042],'unit':'google','speed':[0.0]}]}],}]),on_response)
    socketIO.wait(5)
    tripID = str(answer[0][u'_id'])
    file = open('Photos/'+name+'.jpg',"rb").read().encode("base64")
    photodata = json.dumps({"imageName" : name+".jpg", "tripID" : tripID, "userID" : name, "raw" : file, "timestamp" : time})
    url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    r = requests.post(url, data = photodata, headers = headers)
    socketIO.emit('rt-sensordata', photodata,on_response)
    socketIO.wait(1)
    socketIO.emit('endBikeTrip',json.dumps({"_id":tripID}),on_response)
    socketIO.wait(2)

while True:
    name = raw_input("What's your name?\n>>>")
    while name in name_list:
        print "\n\n\nName already in use, try another one:"
        name = raw_input(">>>")
    name_list.append(name)
        
    print "Taking picture in 3..."
    time.sleep(1)
    print "2..."
    time.sleep(1)
    print "1..."
    time.sleep(1)
    print 'Smile!'
    snap(name)
    send(name)
    time.sleep(3)
    print "\n"*100
