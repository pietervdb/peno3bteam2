from socketIO_client import SocketIO
import json
import time
import base64
import requests

class connection:
    
    #De initialisator initialiseert de atrubuten groupID en userID
    def __init__(self, groupID, userID):
        self.groupID = groupID
        self.userID = userID
        self.socketIO = SocketIO('dali.cs.kuleuven.be',8080)

    def setPhoto(self, photo):
        self.photo = photo

    # functie wordt opgeroepen wanneer connectie met server wordt geopend, en geeft een
    # unieke tripID. Deze tripID wordt opgeslagen als attribuut
    def on_response(*args):
        print 'server message is',args
        tripID = args
        tripID = tripID[0]
        tripID = dictionary[u'_id']
        self.tripID = tripID

    # Deze functie stuurt foto naar de server
    def send_Photo(self):
        start = {'purpose':'realtime-sender','groupID':str(self.groupID),'userID':str(self.userID)}
        socketIO.on('server_message',on_response)
        socketIO.emit('start',json.dumps(start),on_response)

        socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet

    
        i = 0
        while i < photo.nbOfPhoto:
            file = open(photo.foldername+"/foto"+str(i+1)+".jpg", "rb").read().encode("base64") 
            PHOTODATA = json.dumps({"imageName" : "foto"+str(i+1)+".jpg", "tripID" : str(self.tripID), "userID" : str(self.userID), "raw" : file}) 
            url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
            headers = {'Content-type': 'application/json', 'Accept': 'text/plain'} 
            r = requests.post(url, data = PHOTODATA, headers = headers)
            socketIO.emit('rt-sensordata', PHOTODATA,on_response)
            print "foto" ,i+1,'van de',total_photos, 'verzonden'
            i+=1




    
