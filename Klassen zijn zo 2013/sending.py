import base64
import json
from socketIO_client import SocketIO


domain = 'dali.cs.kuleuven.be'
port = 8080
start = {'purpose':'batch-sender','groupID':'CWB2','userID':'r0369676'}
socketIO = SocketIO(domain,port)
userID = "r0369676"
groupID = "CWB2"
startTime = ''
endTime = ''
lines_list = []
fix_on = []

def connected():
    try:
        _ = requests.get(url='http://'+domain+':'+str(port)+'/', timeout=5)
        return True
    except requests.ConnectionError:
        return False

def send_queue(queue):
    for trip in queue:
        send_data(trip)

def find_time(st):
    if st == 'start':
        return lines_list[fix_on[0]+4][:-1]
    elif st == 'stop':
        return lines_list[fix_on[-1]+4][:-1]

def find_fix():
    global fix_on
    i = 0
    while i < len(lines_list):
        if lines_list[i][0:5] == "Fix:Y":
            fix_on.append(i)
        i += 24

def data_position(first_five):
    i = 0
    while True:
        if lines_list[i][0:5] == first_five:
            solution = i+1
            break
        i += 1
    return solution

def find_GPS_data(first_five):
    "data that is dependent on a fix"
    position = data_position(first_five)
    data_list = []

    if first_five == "Date/":
        for i in fix_on:
            data_list.append(lines_list[i+position][:-1])
    else:
        for i in fix_on:
            data_list.append(float(lines_list[i+position][:-1]))

    return data_list

def find_data(first_five):
    "data that is independent of a fix"
    position = data_position(first_five)
    data_list = []
    position = i
    
    if first_five == "Date/":
        while i < len(lines_list):
            data_list.append(lines_list[i][:-1])
            i += 24
    else:
        while i < len(lines_list):
            data_list.append(float(lines_list[i][:-1]))
            i += 24
        
    return data_list

def compose_GPS_coordinates():
    x = find_GPS_data('Loc_x')
    y = find_GPS_data('Loc_y')
    data_list = []
    
    for i in range(len(x))
        data_list.append([x[i],y[i]])

    return data_list









def send_data(tripnumber):
    pass
    
    
