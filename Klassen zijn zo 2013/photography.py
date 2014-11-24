import os
import picamera

foldername = ''
current_photo = 0

def make_photo_dir(tripnumber):
    global foldername
    "makes dir where pictures will be stored"
    foldername = 'Data/Photos/'+tripnumber
    #foldername = "/home/pi/Desktop/fotos/"+tripnumber
    os.makedirs(foldername)
    current_photo = 0

def snap():
    global current_photo
    "takes picture"
    with picamera.PiCamera() as camera:
        camera.capture(foldername+'/'+str(current_photo)+'.jpg')
    current_photo += 1
    
    


