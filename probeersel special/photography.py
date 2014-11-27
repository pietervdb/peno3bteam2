import os
import picamera
import shutil
from PIL import Image

tripnumber = ''
current_photo = 0
current_special = 0

def make_photo_dir(tripnumber):
    "makes dir where pictures will be stored"
    global tripnumber
    os.makedirs('Data/Photos/'+tripnumber)
    os.makedirs('Data/Specials/'+tripnumber)
    current_photo = 0
    current_special = 0

def snap():
    "takes picture and resizes it"
    global current_photo
    with picamera.PiCamera() as camera:
        camera.capture('Data/Photos/'+tripnumber+'/'+str(current_photo)+'.jpg')
        
    img = Image.open('Data/Photos/'+tripnumber+'/'+str(current_photo)+'.jpg')
    img = img.resize((600,338), Image.ANTIALIAS)
    img.save('Data/Photos/'+tripnumber+'/'+str(current_photo)+".jpg","JPEG")
        
    current_photo += 1

def remove_photos(queue):
    for trip in queue:
        shutil.rmtree('Data/Photos/'+trip)
        shutil.rmtree('Data/Specials/'+trip)

def remove_specials(amount):
    i = 0
    while i < amount:
        os.remove('Data/Photos/'+str(i)+'.jpg')
        i += 1
    shutil
    
def special_snap(number, on):
    if on:
        with picamera.PiCamera() as camera:
            camera.capture('Data/Specials/'+tripnumber+'/'+str(number)+'.jpg')
        current_special += 1
    else:
        with picamera.PiCamera() as camera:
            camera.capture('Data/Photos/'+str(number)+'.jpg')
        
    ##special snaps not resized because I think it would be nice to show these pictures in a different pane
    ##does it need gps coordinates?
   
    
