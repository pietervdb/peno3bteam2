import os
import picamera
import shutil
from PIL import Image

tripnumber = ''
current_photo = 0
current_special = 0

def make_photo_dir(tripnumber):
    'makes directory where pictures will be stored'
    global tripnumber
    os.makedirs('Data/Photos/'+tripnumber)
    os.makedirs('Data/Specials/'+tripnumber)
    current_photo = 0
    current_special = 0

def snap():
    'takes picture and resizes it'
    global current_photo
    with picamera.PiCamera() as camera:
        camera.capture('Data/Photos/'+tripnumber+'/'+str(current_photo)+'.jpg')
        
    img = Image.open('Data/Photos/'+tripnumber+'/'+str(current_photo)+'.jpg')
    img = img.resize((600,338), Image.ANTIALIAS)
    img.save('Data/Photos/'+tripnumber+'/'+str(current_photo)+'.jpg','JPEG')
        
    current_photo += 1

def remove_photos(queue):
    'removes all pictures taken in the trips in the queue'
    for trip in queue:
        shutil.rmtree('Data/Photos/'+trip)
        shutil.rmtree('Data/Specials/'+trip)
    
def special_snap():
    'takes a special picture'
    global current_special
    with picamera.PiCamera() as camera:
        camera.capture('Data/Specials/'+tripnumber+'/'+str(number)+'.jpg')
    current_special += 1
        
    ##special snaps are not resized
    ##does it need gps coordinates?
   
    
