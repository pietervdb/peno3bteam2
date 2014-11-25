import serial
from help_functions import *

arduino = serial.Serial('COM7',9600)
stop = False
whitelist = ["Qua","Loc","Spe","Ang","Alt","Sat","Pre","Tem"]
first = ''
second = ''

def save_arduino(tripnumber):
    textfile = 'Data/'+tripnumber+'.txt'
    #textfile = '/home/pi/Desktop/'+tripnumber+'.txt'
    target = open(textfile,'a')
    
    while not stop:
        line = arduino.readline()
        
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

        target.write(first)
        target.write(second)
        
        if line[0] == "T":
            target.write("End\n")
            target.close()
            stop = True
            
        
                                        
        

















    
