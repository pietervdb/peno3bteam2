import foto
import connection

photo = new photo()
connection = new connection( CWB2, r0373930)
connection.setPhoto(photo)
photo.setConnection(connection)
GPIO.setmode(GPIO.BCM)
GPIO.setup(7,GPIO.IN)
GPIO.setwarnings(False)
GPIO.setup(8,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)
GPIO.output(8,False)
GPIO.output(11,True)



while True:
    value = drukknop(photo.value)
##    arduino.readline() #nodig om readline te kunnen lezen
##    last_value = 0
##    time_start = 0
##    value = int(arduino.readline())
    if (value != last_value):
        if value == 1:
            GPIO.output(11,False)
            GPIO.output(8,True)
            photo.nbOfPhoto = 0
            time_start = time.time()
            first_start = photo.getTime()
             
            photo.makeDir(first_start)
            photo.photoNb = 1
        elif value == 0:
            GPIO.output(8,False)
            GPIO.output(11,True)
            send_data("/home/pi/Desktop/fotos/"+str(first_start),photo.nbOfPhoto)

    last_value = value  
    if value == 1:
        if time.time() - time_start >=5:
            with picamera.PiCamera() as camera:
                camera.capture(photo.foldername+'/'+'foto'+str(photo.photoNb)+'.jpg') #duurt 3,4 seconden
            print 'foto genomen'
            photo.photoNb += 1
            photo.nbOfPhoto += 1
            time_start = time.time()
