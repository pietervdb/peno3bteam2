import os
from socketIO_client import SocketIO
import json
import base64
import requests

domain = 'dali.cs.kuleuven.be'
port = 8080
start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO(domain,port)

def on_response(*args):
    global answer
    print 'server message is',args
    answer = args
    
def send_picture(tripID,tripnumber,pic_number):
    socketIO.on('server_message',on_response)
    socketIO.emit('start',json.dumps(start),on_response)
    
    
