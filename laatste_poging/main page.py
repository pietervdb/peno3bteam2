from photography import *
from saving import *

import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BCM)
GPIO.setup(7,GPIO.IN)
GPIO.setwarnings(False)
GPIO.setup(8,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)
GPIO.output(8,False)
GPIO.output(11,True)
GPIO.setup(9,GPIO.OUT)
GPIO.setup(25,GPIO.OUT)
GPIO.output(9,False)
GPIO.output(25, False)

on = False

tripnumber = '0'
queue = []
photonumber = 0
print 'start'
target = open('Data/gem_snelheid.txt','r')
gem_speed = float(target.readline()[0:-1])
while True:

    if GPIO.input(7) == 1:
        duration = 0
        starter = time.time()
        time.sleep(1)
        while GPIO.input(7) == 1 and duration < 5:
            duration = time.time()- starter
        if on:
            print 'uit'
            on = False
            GPIO.output(11,True)
            GPIO.output(8,False)
            sent = False
            queue.append(tripnumber)
            print queue
            time.sleep(1)

        else:
            if duration >= 5:
                GPIO.output(8,True) #do not disconnect-color
                if connected():
                    from sending import *   #here because does not work without connection
                    print 'send'
                    send_queue(queue)  #sends the queue
                    GPIO.output(8,False)
                    sent = True
                    queue = []
            else:
                timer_last = time.time()
                print 'aan'
                on = True
                GPIO.output(11,False)
                GPIO.output(8, True)
                tripnumber = str(int(tripnumber)+1)
                make_photo_dir(tripnumber)  #makes new directory
                snap(0)
                photonumber = 1
                save_arduino_raw(tripnumber)
    
    timer_current = time.time()
    if on and (timer_current - timer_last > 10):
        print 'datapunt'
        snap(photonumber)  #takes picture
        photonumber += 1
        speed = float(save_arduino_raw(tripnumber))  #saves arduino data
        print speed, gem_speed
        if speed > gem_speed:
            GPIO.output(9,False)
            GPIO.output(25, True)
        else:
            GPIO.output(25,False)
            GPIO.output(9, True)
        save_arduino_raw(tripnumber)
        save_arduino_raw(tripnumber)
        save_arduino_raw(tripnumber)
        timer_last = time.time()
