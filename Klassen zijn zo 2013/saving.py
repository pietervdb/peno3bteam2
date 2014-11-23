import time

def this_is_time():
    return str(time.localtime()[0])+"-"+\
           str(time.localtime()[1])+"-"+\
           str(time.localtime()[2])+' '+\
           str(time.localtime()[3])+'u'+\
           str(time.localtime()[4])+'min'+\
           str(time.localtime()[5])
