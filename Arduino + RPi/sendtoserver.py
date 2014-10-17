from socketIO_client import SocketIO
import json
import time
global lrs
lrs = 0
start = {'purpose':'realtime-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO('dali.cs.kuleuven.be',8080)
def on_response(*args):
    global lrs
    print 'server message is',args
    lrs = args


    
socketIO.on('server_message',on_response)
socketIO.emit('start',json.dumps(start),on_response)

socketIO.wait(0.2) #moet hier staan want anders werkt lrs niet

dictionary = lrs[0]
tripID = dictionary[u'_id']

GPS_data = ['N13E24','N34E20']
SENSORDATA = {'sensorID':'1','timestamp':'0','data':GPS_data}
sensordata = {'_id':tripID,'sensorData':[SENSORDATA]}
socketIO.emit('rt-sensordata',json.dumps(sensordata),on_response)


metadata = {"distance":"zoveel meter","averageSpeed":'heel snel','other:':"hij is gevallen"}
end = {'_id':tripID,'meta':[metadata]}
socketIO.emit('endBikeTrip',json.dumps(end),on_response)

##tripdata = {}
##socketIO.emit('batch-tripdata',json.dumps(tripdata),on_response)

socketIO.wait(0.2)

