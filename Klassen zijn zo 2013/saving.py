import serial
from help_functions import *

##arduino = serial.Serial('COM7',9600)
arduino = serial.Serial('/dev/serial/by-id/ttysdkmlfkqjdsmflkjsdqmlf',9600)
whitelist = ["Qua","Loc","Spe","Ang","Alt","Sat","Pre","Tem"]

whitelist2 = ["Locat","Speed","Alt2t","Press","Tempe"]
##EDIT######
##step: 24 => 18
##find_time(st) 4 => 2 (2 times)
last = ""
first = ""
stop = False

def save_arduino(tripnumber,first_time):
    textfile = 'Data/'+tripnumber+'.txt'
    target = open(textfile,'a')
    
    while not stop:
        line = arduino.readline()

        if line[:3] == "Fix":
            
            if not first_time:
                target.write("\n")
                
            if line[4:7] == "[1]":
                first = "Fix:Y"
            else:   #misschien moet dit "elif line[4:7] == "[0]":" worden
                first = "Fix:N"
                
            second = "\n"
            
        elif line[:3] == "Dat":
            [intro, datime] = split_data(line)
            correct_datime = timewriter(datime)                         
            first = intro + "\n"
            second = correct_datime + "\n"
            
        elif line[:3] in whitelist: #line[:5] in whitelist2 (geen alt1, angle, sat#, quality)
            [intro, data] = split_data(line)
            first = intro + "\n"
            second = data + "\n"
            
        if last != first:
            target.write(first)
            target.write(second)
        last = first
        
        if line[0] == "T":
            target.write("End")
            target.close()
            stop = True
