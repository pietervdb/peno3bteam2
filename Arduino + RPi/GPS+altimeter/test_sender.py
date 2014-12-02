import base64 
import json 
from socketIO_client import SocketIO
b = {}
socketIO = SocketIO('dali.cs.kuleuven.be',8080)

sD1 = [{'sensorID': 10, 'data': [{'pressure': [2620.89], 'temperature': [18.62], 'height': [65521.81]}],\
               'timestamp': '2014-11-19T07:10:36.000Z'}]


sD2 = [{'sensorID': 10, 'data': [{'pressure': [2621.03], 'temperature': [23.81], 'height': [65525.56]}]}]

sD3 = [{'sensorID': 10, 'data': [{'pressure': [2620.89], 'temperature': [18.62], 'height': [65521.81]}],\
                'timestamp': '2014-11-22T07:10:36.000Z'}]


def on_response(*args):
    print 'server message is',args

def test(sensorData):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps({'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}),on_response)
    socketIO.wait(1)
    socketIO.emit('batch-tripdata', json.dumps([{'userID':'r0369676','groupID':'CWB2','sensorData':sensorData}]),on_response)
    socketIO.wait(2)
