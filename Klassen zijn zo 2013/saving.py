import serial
from help_functions import *

arduino = serial.Serial('COM7',9600)
stop = False
whitelist = ["Qua","Loc","Spe","Ang","Alt","Sat","Pre","Tem"]
first = ''
second = ''

def save_arduino(tripnumber,first_time):
    textfile = 'Data/'+tripnumber+'.txt'
    #textfile = '/home/pi/Desktop/'+tripnumber+'.txt'
    target = open(textfile,'a')
    stop = False
    last = ""
    while not stop:
        line = arduino.readline()
        if not first_time and line[:3] == "Fix":
            target.write("\n")
            
        if line[:3] == "Fix":
            if line[4:7] == "[1]":
                first = "Fix:Y"
            else:
                first = "Fix:N"
            second = "\n"
            
        elif line[3] == "Dat":
            [intro, datime] = split_data(line)
            correct_datime = timewriter(datime())                         
            first = intro+"\n"
            second = correct_datime+"\n"
            
        elif line[:3] in whitelist:
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
            
        
                                        
        

















    
