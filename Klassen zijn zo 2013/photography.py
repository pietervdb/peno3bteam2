import os
import picamera
from PIL import Image

foldername = ''

def make_photo_dir(tripnumber):
    "makes dir where pictures will be stored"
    global foldername
    foldername = 'Data/Photos/'+tripnumber
    os.makedirs(foldername)

def snap(photonumber):
    "takes picture and resizes it"
    print 'foto nr',photonumber
    with picamera.PiCamera() as camera:
        camera.capture(foldername+'/'+str(photonumber)+'.jpg')
        
    img = Image.open(foldername+'/'+str(photonumber)+'.jpg')
    img = img.resize((600,338), Image.ANTIALIAS)
    img.save(foldername+'/'+str(photonumber)+".jpg","JPEG")
