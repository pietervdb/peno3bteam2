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
on = False

tripnumber = '0'
queue = []
photonumber = 0
print 'start'
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
            time.sleep(1)

        else:
            if duration >= 5:
                from sending import *   #here because does not work without connection
                if connected():
                    
                    print 'send'
                    GPIO.output(8,True) #do not disconnect-color
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
                save_arduino(tripnumber,True)
    
    timer_current = time.time()
    if on and (timer_current - timer_last > 10):
        print 'datapunt'
        snap(photonumber)  #takes picture
        photonumber += 1
        save_arduino(tripnumber,False)  #saves arduino data
        timer_last = time.time()
