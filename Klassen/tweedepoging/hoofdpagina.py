from class_photo import photo
from class_connection import connection
import RPi.GPIO as GPIO
import serial
import picamera
import time
from socketIO_client import SocketIO
import json
import os
import base64
import requests
last_value = 0
photo = photo()
connection = connection( 'CWB2', 'r0373930')
connection.setPhoto(photo)
photo.setConnection(connection)
GPIO.setmode(GPIO.BCM)
GPIO.setup(7,GPIO.IN)
GPIO.setwarnings(False)
GPIO.setup(8,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)
GPIO.output(8,False)
GPIO.output(11,True)
time_start = time.time()


while True:
    
    photo.value = photo.drukknop(photo.value)
    if (photo.value != last_value):

        if photo.value == 1:
            GPIO.output(11,False)
            GPIO.output(8,True)
            photo.total_number= 0
            time_start = time.time()
            first_start = photo.getTime()
             
            photo.makeDir(first_start)
            photo.photoNb = 1
        elif photo.value == 0:
            GPIO.output(8,False)
            GPIO.output(11,True)
            connection.send_Photo()

    last_value = photo.value
    if photo.value == 1:
        if time.time() - time_start >=3:
            with picamera.PiCamera() as camera:
                camera.capture(photo.foldername+'/'+'foto'+str(photo.photoNb)+'.jpg') #duurt 3,4 seconden
            print 'foto genomen'
            photo.photoNb += 1
            photo.total_number += 1
            time_start = time.time()
