from photography import *
from saving import *
from sending import *
from help_functions import *

import RPi.GPIO as GPIO
import serial
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(7,GPIO.IN)
GPIO.setwarnings(False)
GPIO.setup(8,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)
GPIO.output(8,False)
GPIO.output(11,True)

last_value = 0
on = False
time_last = time.time()
timer_current = time.time()
tripnumber = '0'
queue = []

while True:
    timer_current = time.time()

    if GPIO.input(7) == 1:
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
                    GPIO.output(8,False)
                    sent = True
                    queue = []
                    
        else:
            on = True
            GPIO.output(11,False)
            GPIO.output(8, True)
            tripnumber = str(int(tripnumber)+1)
            make_photo_dir(tripnumber)  #makes new directory
            snap()
            save_arduino(tripnumber)
        

    if on and (timer_current - timer_last > 10):
        snap()  #takes picture
        save_arduino(tripnumber)  #saves arduino data
        timer_last = time.time()
