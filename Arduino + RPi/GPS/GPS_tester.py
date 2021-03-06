import gps, os, time
import RPi.GPIO as GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
session = gps.gps()
GPIO.setup(7,GPIO.OUT)
GPIO.setup(11,GPIO.OUT)

while 1:
    GPIO.output(11,True)
    GPIO.output(7,False)

    print "searching..."
    if len(session.satellites)>0:
        print "sattelites found!!"
        os.system('clear')
        #session.query('admosy') 
        # a = altitude, d = date/time, m=mode,  
        # o=postion/fix, s=status, y=satellites

        print
        print ' GPS reading'
        print '----------------------------------------'
        print 'latitude    ' , session.fix.latitude
        print 'longitude   ' , session.fix.longitude
        print 'time utc    ' , session.utc, session.fix.time
        print 'altitude    ' , session.fix.altitude
        #print 'eph         ' , session.fix.eph
        #print 'epv         ' , session.fix.epv
        #print 'ept         ' , session.fix.ept
        print 'speed       ' , session.fix.speed
        print 'climb       ' , session.fix.climb
        
        print
        print ' Satellites (total of', len(session.satellites) , ' in view)'
        for i in session.satellites:
            print '\t', i
        print session.fix.latitude,type(session.fix.latitude)

        print session.fix.speed,type(session.fix.speed)
        GPIO.output(11, False)
        GPIO.output(7,True)
    
    time.sleep(3)

















import threading
 
gpsd = None #seting the global variable
 
os.system('clear') #clear the terminal (optional)
 
class GpsPoller(threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    global gpsd #bring it in scope
    gpsd = gps(mode=WATCH_ENABLE) #starting the stream of info
    self.current_value = None
    self.running = True #setting the thread running to true
 
  def run(self):
    global gpsd
    while gpsp.running:
      gpsd.next() #this will continue to loop and grab EACH set of gpsd info to clear the buffer
 
if __name__ == '__main__':
  gpsp = GpsPoller() # create the thread
  try:
    gpsp.start() # start it up
    while True:
      #It may take a second or two to get good data
      #print gpsd.fix.latitude,', ',gpsd.fix.longitude,'  Time: ',gpsd.utc
 
      os.system('clear')
 
      print
      print ' GPS reading'
      print '----------------------------------------'
      print 'latitude    ' , gpsd.fix.latitude
      print 'longitude   ' , gpsd.fix.longitude
      print 'time utc    ' , gpsd.utc,' + ', gpsd.fix.time
      print 'altitude (m)' , gpsd.fix.altitude
      print 'eps         ' , gpsd.fix.eps
      print 'epx         ' , gpsd.fix.epx
      print 'epv         ' , gpsd.fix.epv
      print 'ept         ' , gpsd.fix.ept
      print 'speed (m/s) ' , gpsd.fix.speed
      print 'climb       ' , gpsd.fix.climb
      print 'track       ' , gpsd.fix.track
      print 'mode        ' , gpsd.fix.mode
      print
      print 'sats        ' , gpsd.satellites
 
      time.sleep(5) #set to whatever
 
  except (KeyboardInterrupt, SystemExit): #when you press ctrl+c
    print "\nKilling Thread..."
    gpsp.running = False
    gpsp.join() # wait for the thread to finish what it's doing
  print "Done.\nExiting."
