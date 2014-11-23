from photography import *
from saving import *
from sending import *


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
while True:
    timer_current = time.time()

    if GPIO.input(7) == 1:
        if on:
            on = False
            GPIO.output(11,True)
            GPIO.output(8,False)
            send_all()
        else:
            on = True
            GPIO.output(11,False)
            GPIO.output(8, True)
            make_photo_dir(this_is_time())
        time.sleep(1)

    if on and (timer_current - timer_last > 5):
        
    

        
        
        



























            
        
    
