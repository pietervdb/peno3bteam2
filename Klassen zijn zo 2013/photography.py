import os
import picamera

foldername = ''
current_photo = 0

def make_photo_dir(tripnumber):
    "makes dir where pictures will be stored"
    foldername = 'Data/Photos/'+tripnumber
    #foldername = "/home/pi/Desktop/fotos/"+tripnumber
    os.makedirs(foldername)
    current_photo = 0

def snap():
    "takes picture"
    with picamera.PiCamera() as camera:
        camera.capture(foldername+'/'+str(current_photo)+'.jpg')
    current_photo += 1
    
    


