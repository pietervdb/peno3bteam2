import os
import RPi.GPIO as GPIO
import time
import picamera

current_folder = ""

def make_photo_dir(time):
    "makes dir where pictures will be stored"
    foldername = "fotos/"+time
    #foldername = "/home/pi/Desktop/fotos/"+time
    os.makedirs(foldername)
    current_folder = "fotos/"+time+"/"
    pic_number = 0

def snap(time, number):
    with picamera.PiCamera() as camera:
        camera.capture(current_folder+str(number)+'.jpg')
    
    


