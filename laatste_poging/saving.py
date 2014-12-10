import serial
from help_functions import *
arduino = serial.Serial('COM7',9600)
##arduino = serial.Serial('/dev/serial/by-id/usb-Gravitech_ARDUINO_NANO_13BP0853-if00-port0',9600)
whitelist = ['Qua','Loc','Spe','Ang','Alt','Sat','Pre','Tem']
whitelist2 = ['Locat','Speed','Alt2t','Press','Tempe']
##EDIT######
##step: 24 => 18
##find_time(st) 4 => 2 (2 times)

def save_arduino_raw(tripnumber):
    text = 'Data'+tripnumber+'raw.txt'
    target = open(text,'a')
    stop = False
    while not stop:
        line = arduino.readline()
        target.write(line)
        if line[0]=='t':
            target.close()
            stop = True

def process_raw_data(tripnumber):
    textfile = 'Data/'+tripnumber+'.txt'
    target = open(textfile,'a')
    text = 'Data'+tripnumber+'raw.txt'
    target2 = open(text,'r')
    raw_lijnen_lijst = target2.readlines()
    last = ''
    first = ''
    for line in raw_lijnen_lijst:
        if line[:3] == 'Fix':
            if line[4:7] == '[1]':
                target.write('Fix:Y\n')
            else:
                target.write('Fix:N\n')
        
        if line[:3] == 'Dat':
            [intro, datime] = split_data(line)
            correct_datime = timewriter(datime)                         
            first = intro + '\n'
            second = correct_datime + '\n'

                elif line[:3] in whitelist: #line[:5] in whitelist2 (geen alt1, angle, sat#, quality)
            [intro, data] = split_data(line)
            first = intro + '\n'
            second = data + '\n'
            
        if last != first:
            target.write(first)
            target.write(second)
        last = first
        if line[0] == 'T':
            target.write('End\n')
    target.close

            
##    while not stop:
##        line = arduino.readline()
##        print line
##        while start:            
##            if line[:3] == 'Fix':
##            
##                if not first_time:
##                    target.write('\n')
##                    
##                if line[4:7] == '[1]':
##                    first = 'Fix:Y'
##                else:   #misschien moet dit 'elif line[4:7] == '[0]':' worden
##                    first = 'Fix:N'
##                    
##                second = '\n'
##                start = False
##            else:
##                line = arduino.readline()           
##
##        if line[:3] == 'Dat':
##            [intro, datime] = split_data(line)
##            correct_datime = timewriter(datime)                         
##            first = intro + '\n'
##            second = correct_datime + '\n'
##            
##        elif line[:3] in whitelist: #line[:5] in whitelist2 (geen alt1, angle, sat#, quality)
##            [intro, data] = split_data(line)
##            first = intro + '\n'
##            second = data + '\n'
##            
##        if last != first:
##            target.write(first)
##            target.write(second)
##        last = first
##        
##        if line[0] == 'T':
##            target.write('End')
##            target.close()
##            stop = True
##
