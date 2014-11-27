from photography import *
from saving import *
from sending import *
import RPi.GPIO as GPIO
import time
import os

GPIO.setmode(GPIO.BCM)
GPIO.setup(7,GPIO.IN)
GPIO.setwarnings(False)
GPIO.setup(8,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)
GPIO.output(8,False)
GPIO.output(11,True)

on = False
time_last = time.time()
tripnumber = '0'
queue = []

for directory in ["Data/","Data/Photos/","Data/Specials/"]:
    os.makedirs(directory)
    
while True:
    timer_current = time.time()

    if GPIO.input(7) == 1:
        duration = 0
        starter = time.time()
        while GPIO.input(7) == 1 and duration < 1:
            duration = time.time()-starter
        if duration >= 1:
                
            if on:
                on = False
                GPIO.output(11,True)
                GPIO.output(8,False)
                sent = False
                queue.append(tripnumber)
                time.sleep(1)

                while not sent and GPIO.input(7) != 1:
                    if connected():
                        GPIO.output(8,True) #do not disconnect-color
                        send_queue(queue)  #sends the queue
                        remove_photos(queue)
                        GPIO.output(8,False)
                        sent = True
                        queue = []
                        special_snaps = 0

            else:
                print "New trip!"
                on = True
                GPIO.output(11,False)
                GPIO.output(8, True)
                tripnumber = str(int(tripnumber)+1)
                make_photo_dir(tripnumber)  #makes new directory
                print "Start! First snap."
                snap()
                print "First save."
                save_arduino(tripnumber,True)
        else:
            print "Special snap!"
            special_snap()
            

    if on and (timer_current - timer_last > 10):
        print "Snap!"
        snap()  #takes picture
        print "Save!"
        save_arduino(tripnumber,False)  #saves arduino data
        timer_last = time.time()
