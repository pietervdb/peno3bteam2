from reading import *

def update_speed(speed_list):
    print 'updating'
    target1 = open('Data/gem_snelheid.txt','r')
    a = target1.readline()
    prev_speed = float(a[0:len(a)-1])
    b = target1.readline()
    nb_speeds = float(b[0:len(b)-1])
    target1.close
    target = open('Data/gem_snelheid.txt','w')
    avr_speed_trip = 0
    nb_new_speeds=len(speed_list)
    j=len(speed_list)-1
    new_nb_speeds = nb_new_speeds + nb_speeds
    while j > -1:
        if speed_list[j] == 0:
            speed_list.pop(j)
        j-=1
    
    for i in speed_list:
        avr_speed_trip += i/nb_new_speeds
    
    avr_speed = prev_speed*nb_speeds/new_nb_speeds + avr_speed_trip*nb_new_speeds/new_nb_speeds
    print 'gem',avr_speed,'nb',new_nb_speeds
    target.write(str(avr_speed)+'\n')
    target.write(str(new_nb_speeds)+'\n')
