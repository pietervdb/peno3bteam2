import RPi.GPIO
import serial
import picamera
import time
from socketIO_client import SocketIO
import json
import os
import base64
import requests

class photo:

    def __init__(self):
        self.nbOfPhoto = 0
        self.photoNb = 1
        self.aan = 0
        self.value = 0

     def setConnection(self, connection):
        self.connection = connection

    #Maakt een map aan waar foto's tijdelijk in gestokeerd worden.
    def makeDir(time):
        self.foldername = "/home/pi/Desktop/fotos/"+time
        os.makedirs(self.foldernamer)
    

    def getTime():
        return str(time.localtime()[0])+"-"+str(time.localtime()[1])+"-"+str(time.localtime()[2])+' '+str(time.localtime()[3])+'u'+str(time.localtime()[4])+'min'+str(time.localtime()[5])

    def drukknop(last_result=0):
    result = GPIO.input(7)
    if result ==1 and last_result != 1:
        last_result = 1
        time.sleep(1)
    result = GPIO.input(7)
    if result ==1 and last_result==1:
        last_result=0
        time.sleep(1)
    return last_result
        
    
