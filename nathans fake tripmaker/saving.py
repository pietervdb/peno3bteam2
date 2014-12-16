import serial
import time
from help_functions import *
arduino = serial.Serial('COM7',9600)
whitelist = ['Locat','Speed','Alt2t','Press','Tempe']
##EDIT######
##step: 24 => 18
##find_time(st) 4 => 2 (2 times)
def save_arduinotje(tripnumber):
    textfile = 'Data/'+tripnumber+'.txt'
    target = open(textfile,'a')
    i = 0
    while i < 30:
        a = arduino.readline()
        print a
        target.write(a)
        
        target.write("\n")
        i += 1
    target.write("END")
    target.write("\n")
        
def save_trip(tripnumber):
    i = 0
    a = time.time()
    save_arduinotje(tripnumber)
    while True:
        if time.time() - a >= 3:
            save_arduinotje(tripnumber)
            print "##################################################"
            print "datapunt:",i
            print "##################################################"
            i += 1
            a = time.time()
        
def save_arduino(tripnumber,first_time):
    textfile = 'Data/'+tripnumber+'.txt'
    target = open(textfile,'a')
    stop = False
    last = ''
    first = ''
    start = True
    while not stop:
        line = arduino.readline()
        print line
        while start:            
            if line[:3] == 'Fix':
            
                if not first_time:
                    target.write('\n')
                    
                if line[4:7] == '[1]':
                    first = 'Fix:Y'
                else:   #misschien moet dit 'elif line[4:7] == '[0]':' worden
                    first = 'Fix:N'
                    
                second = '\n'
                start = False
            else:
                line = arduino.readline()           

        if line[:3] == 'Dat':
            [intro, datime] = split_data(line)
            correct_datime = timewriter(datime)                         
            first = intro + '\n'
            second = correct_datime + '\n'
            
        elif line[:5] in whitelist: #line[:5] in whitelist2 (geen alt1, angle, sat#, quality)
            [intro, data] = split_data(line)
            first = intro + '\n'
            second = data + '\n'
            
        if last != first:
            target.write(first)
            target.write(second)
        last = first
        
        if line[0] == 'T':
            target.write('End')
            target.close()
            stop = True
