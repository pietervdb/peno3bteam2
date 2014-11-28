import os
import picamera
from PIL import Image

foldername = ''
current_photo = 0

def make_photo_dir(tripnumber):
    "makes dir where pictures will be stored"
    global foldername
    foldername = 'Data/Photos/'+tripnumber
    os.makedirs(foldername)
    current_photo = 0

def snap():
    "takes picture and resizes it"
    global current_photo
    with picamera.PiCamera() as camera:
        camera.capture(foldername+'/'+str(current_photo)+'.jpg')
        
    img = Image.open(foldername+'/'+str(current_photo)+'.jpg')
    img = img.resize((600,338), Image.ANTIALIAS)
    img.save(foldername+'/'+str(current_photo)+".jpg","JPEG")
        
    current_photo += 1
