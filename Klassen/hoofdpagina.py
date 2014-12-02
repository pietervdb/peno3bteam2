import foto
import connection

photo = new photo(0, 1)
connection = new connection( CWB2, r0373930)
connection.setPhoto(photo)
photo.setConnection(connection)



while True:
    arduino = serial.Serial('/dev/serial/by-id/usb-Gravitech_ARDUINO_NANO_13BP0853-if00-port0',9600)
    arduino.readline() #nodig om readline te kunnen lezen
    last_value = 0
    time_start = 0
    value = int(arduino.readline())
    if (value != last_value):
        if value == 1:
            foto.nbOfPhoto = 0
            time_start = time.time()
             
            photo.makeDir()
            foto.photoNb = 1
        elif value == 0:
            send_data("/home/pi/Desktop/fotos/"+str(first_start),number_of_photos)

    last_value = value  
    if value == 1:
        if time.time() - time_start >=5:
            with picamera.PiCamera() as camera:
                camera.capture(photo.foldername+'/'+'foto'+str(photo.photoNb)+'.jpg') #duurt 3,4 seconden
            print 'foto genomen'
            photo.photoNb += 1
            photo.nbOfPhoto += 1
            time_start = time.time()
