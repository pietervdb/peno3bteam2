import base64 
import json 
from socketIO_client import SocketIO
b = {}
socketIO = SocketIO('dali.cs.kuleuven.be',8080)
def on_response(*args):
    print 'server message is',args
def datalist(a):
    return {'sensorID':1,'data': [{'type':'MultiPoint', 'coordinates':a,'unit':'google'}]}
def test(a):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps({'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}),on_response)
    socketIO.wait(1)
    b = datalist(a)
    print b
    socketIO.emit('batch-tripdata', json.dumps([{'userID':'r0369676','groupID':'CWB2','sensorData':b}]),on_response)
    socketIO.wait(2)
