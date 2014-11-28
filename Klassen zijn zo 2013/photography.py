import os
import picamera
from PIL import Image
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
    "takes picture"
    global current_photo
    with picamera.PiCamera() as camera:
        camera.capture(foldername+'/'+str(current_photo)+'.jpg')
    img = Image.open(foldername+'/'+str(current_photo)+'.jpg')
    img = img.resize((600,338), Image.ANTIALIAS)
    img.save(foldername+'/'+str(current_photo)+".jpg","JPEG")
        
    current_photo += 1
    
def resize_pictures(tripnumber):
    photos = os.listdir('Data/Photos/'+tripnumber)
    max_size = 200
    
    for photo in photos:
        img = Image.open('Data/Photos/'+tripnumber+'/'+photo)
        width_length = [img.size[0], img.size[1]]
        biggest = 0
        smallest = 1
        if img.size[1] > img.size[0]:
            biggest = 1
            smallest = 0
            
        if img.size[biggest]>max_size:
            
            percentage = (max_size/float(img.size[biggest]))
            smallestsize = int((float(img.size[smallest])*float(percentage)))
            if biggest == 0:
                img = img.resize((max_size,smallestsize), Image.ANTIALIAS)
            else:
                img = img.resize((smallestsize,max_size), Image.ANTIALIAS)
                
            #img.save('Data/Photos/'+tripnumber+'/'+photo[:-4]+".jpg")
            img.save('Data/Photos/'+tripnumber+'/'+photo[:-4]+".jpg","JPEG")
            
    return photos

