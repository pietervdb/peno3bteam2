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

     def setConnection(self, connection):
        self.connection = connection

    #Maakt een map aan waar foto's tijdelijk in gestokeerd worden.
    def makeDir():
        os.makedirs("/home/pi/Desktop/fotos/"+getTime())
        self.foldername = "/home/pi/Desktop/fotos/"+getTime()

    def getTime():
        return str(time.localtime()[0])+"-"+str(time.localtime()[1])+"-"+str(time.localtime()[2])+' '+str(time.localtime()[3])+'u'+str(time.localtime()[4])+'min'+str(time.localtime()[5])
        
    
