import RPi.GPIO
import serial
import picamera
import time
from socketIO_client import SocketIO
import json
import os
import base64
import requests

global lrs
lrs = 0
start = {'purpose':'realtime-sender','groupID':'CWB2','userID':'r0369676'}
userID = 'r0369676'
groupID = 'CWB2'
socketIO = SocketIO('dali.cs.kuleuven.be',8080)
arduino = serial.Serial('/dev/serial/by-id/usb-Gravitech_ARDUINO_NANO_13BP0853-if00-port0',9600)
last_value = 0
time_start = 0
first_start = 0
photo_number = 1
number_of_photos = 0

def on_response(*args):
    global lrs
    print 'server message is',args
    lrs = args

    
def send_photos(foldername, total_photos):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)

    socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet

    dictionary = lrs[0]
    tripID = dictionary[u'_id']


    i = 0
    while i < total_photos:
        file = open(foldername+"/foto"+str(i+1)+".jpg", "rb").read().encode("base64")
        PHOTODATA = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : str(tripID), "userID" : "r0369676", "raw" : file}) 
        url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'} 
        r = requests.post(url, data = PHOTODATA, headers = headers)
        socketIO.emit('rt-sensordata', PHOTODATA,on_response)
        print "foto" ,i+1,'van de',total_photos, 'verzonden'
        i+=1
        
        
##
##    FOTODATA = {'sensorID':'1','timestamp':'0','data':GPS_data}
##    sensordata = {'_id':tripID,'sensorData':[SENSORDATA]}
##    socketIO.emit('rt-sensordata',json.dumps(sensordata),on_response)
##
##
##    metadata = {"distance":"zoveel meter","averageSpeed":'heel snel','other:':"hij is gevallen"}
##    end = {'_id':tripID,'meta':[metadata]}
##    socketIO.emit('endBikeTrip',json.dumps(end),on_response)
##
##    ##tripdata = {}
##    ##socketIO.emit('batch-tripdata',json.dumps(tripdata),on_response)
##
##    socketIO.wait(0.2)
##
##


while True:
    arduino.readline() #nodig om readline te kunnen lezen
    print arduino.readline()
    value = int(arduino.readline())
    if (value != last_value):
        if value == 1:
            number_of_photos = 0
            time_start = time.time()
            first_start = str(time.localtime()[0])+"-"+str(time.localtime()[1])+"-"+str(time.localtime()[2])+' '+str(time.localtime()[3])+'u'+str(time.localtime()[4])+'min'+str(time.localtime()[5])
            
            os.makedirs("fotos/"+str(first_start))
            photonumber = 1
        elif value == 0:
            send_photos("fotos/"+str(first_start),number_of_photos)

    last_value = value  
    if value == 1:
        if time.time() - time_start >=5:
            with picamera.PiCamera() as camera:
                camera.capture("fotos/"+str(first_start)+'/'+'foto'+str(photonumber)+'.jpg') #duurt 3,4 seconden
            print 'foto genomen'
            photonumber += 1
            number_of_photos += 1
            time_start = time.time()
    
    

