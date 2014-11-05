import base64 
import json 
from socketIO_client import SocketIO
import requests

global lrs
lrs = 0
start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO('dali.cs.kuleuven.be',8080)

def on_response(*args):
    global lrs
    print 'server message is',args
    lrs = args

def find_data(timestamp,what):
    
    
def send_data(tripID):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)

    socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet

    dictionary = lrs[0]
    tripID = dictionary[u'_id']



        
    file = open("C:\\Users\\User\\Desktop\\fotos\\Nel1.jpg", "rb").read().encode("base64") 
    test = json.dumps({"imageName" : "imgkat1.jpg", "tripID" : str(tripID), "userID" : "r0369676", "raw" : file}) 
    url = "http://dali.cs.kuleuven.be:8080/qbike/upload"
    fotodata = test 
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'} 
    r = requests.post(url, data = test, headers = headers)
    socketIO.emit('rt-sensordata', fotodata,on_response)



socketIO.emit('batch-tripdata',json.dumps('groupID':'CWB2','userID':'r0369676','timestamp':'yr-dy-mnth hr-min-sec',
                'sensorData':[{'sensorID': 1,'data': [{'type': 'Point', 'coordinates': ['Location(GM)'], 'height': ['Height']}],'timestamp': 'yr-dy-mnth hr-min-sec'}]))
