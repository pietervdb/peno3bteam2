import base64
import json
from socketIO_client import SocketIO
from reading import *

domain = 'dali.cs.kuleuven.be'
port = 8080
start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO(domain,port)
userID = "r0369676"
groupID = "CWB2"

def connected():
    try:
        _ = requests.get(url='http://'+domain+':'+str(port)+'/', timeout=5)
        return True
    except requests.ConnectionError:
        return False

def send_queue(queue):
    for trip in queue:
        send_data(trip)

def send_data(tripnumber):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    socketIO.wait(0.5)
    read(tripnumber)
    start_time = find_time('start')
    end_time = find_time('stop')
    datalist = make_data_list()
    meta_dict = make_meta_dict()
    socketIO.emit('batch-tripdata', json.dumps([{'userID':userID,\
                    'groupID':groupID,'startTime':startTime,\
                    'endTime':endTime,'sensorData':datalist,\
                    'meta':meta_dict}]),on_response)
    socketIO.wait(10)
                                                 
    
    
    
