lines_list = []
fix_on = []
step = 22
from feedback import *

def read(tripnumber):
    "reads the file and finds fixes (preparation for data operations)"
    global lines_list
    target = open('Data/'+tripnumber+'.txt','r')
    with target as textfile:
        lines_list = textfile.readlines()
    target.close()
    end_end()
    
    find_fix()

def end_end():
    global lines_list
    if lines_list[-1][0:2] != 'En':
        i=-2
        while i > -len(lines_list):
            if lines_list[i] == 'En':
                break
            i -= 1
        lines_list = lines_list[:i]

def find_fix(answer=False):
    "finds GPS fixes"
    global fix_on,fix
    fix_on = []
    fix = []
    i = 0
    while i < len(lines_list):
        if lines_list[i][0:3]=="Fix":
            fix.append(lines_list[i][4])
            if lines_list[i][0:5] == "Fix:Y":
                fix_on.append(i)
        i += 1
    if answer:
        return fix_on
    
def find_time(st):
    "finds start/stop time"
    if len(fix_on)==0:
            return None
    else:
        dates = find_data("Date/")
        if st == 'start':
            for a in fix:
                if fix[a] == 'y':
                    return dates[a]
        elif st == 'stop':
            for b in reversed(fix):
                if fix[b] == 'N':
                    return dates[b]


def data_position(first_five):
    "finds first occurence of given data"
    i = 0
    while True:
        if lines_list[i][0:5] == first_five:
            solution = i+1
            break
        i += 1
    return solution

def find_gps_data(first_five):
    "data that is dependent on a fix"
    position = data_position(first_five)
    data_list = []
    if first_five == "Date/":
        for i in fix_on:
            j = 1
            while j < step:
                if lines_list[i+j][:3] == "Fix":
                    break
                elif lines_list[i+j][:5] == first_five:
                    data_list.append(lines_list[i+position][:-1])
                j += 1
                
    else:
        for i in fix_on:
            j = 1
            while j < step:
                if lines_list[i+j][:3] == "Fix":
                    break
                elif lines_list[i+j][:5] == first_five:
                    data_list.append(float(lines_list[i+position][:-1]))
                j += 1
                
    return data_list

def find_data(first_five):
    "data that is independent of a fix"
    data_list = []
    print 'zoek data van',first_five
    i = 0
    if first_five == "Date/":
        while i < len(lines_list):
            if lines_list[i][:5] == first_five:
                data_list.append(lines_list[i+1][:-1])
            i += 1
    else:
        while i < len(lines_list):
            if lines_list[i][:5] == first_five:
                data_list.append(float(lines_list[i+1][:-1]))
            i += 1
        
    return data_list

def compose_gps_coordinates():
    x = find_gps_data('Loc_x')
    y = find_gps_data('Loc_y')
    data_list = []
    
    for i in range(len(x)):
        data_list.append([x[i],y[i]])

    return data_list

def make_data_list():
    datalist = []
    nb_points = len(fix)
    #gps
    gps_coordinates = compose_gps_coordinates()
    timestamp_gps_list = find_gps_data('Date/')
    speed_list = find_gps_data('Speed')
##    update_speed(speed_list)
    shortest1 = len(fix_on)
    if len(gps_coordinates) < shortest1:
        shortest1 = len(gps_coordinates)
    if len(timestamp_gps_list) < shortest1:
        shortest1 = len(timestamp_gps_list)
    if len(speed_list) < shortest1:
        shortest1 = len(speed_list) 
    for i in range(len(gps_coordinates)):
        print i , gps_coordinates[i]
        datalist.append({'sensorID':1,'timestamp':timestamp_gps_list[i],'data': [{'type':'Point',\
                                    'coordinates':gps_coordinates[i],'unit':'google','speed':[speed_list[i]]}]})
    #barometer
    temperature_list = find_data("Tempe")
    pressure_list = find_data("Press")
    alt2tude_list = find_data("Alt2t")
    shortest2 = len(temperature_list)
    if len(pressure_list) < shortest2:
        shortest2 = len(pressure_list)
    if len(alt2tude_list) < shortest2:
        shortest2 = len(alt2tude_list) 

    time_point = 0
    print fix , shortest2
    for i in range(shortest2):
        if fix[i]=='y' and time_point < shortest1:
            datalist.append({'sensorID':10, 'timestamp':timestamp_gps_list[time_point],'data': [{'pressure':[pressure_list[i]],\
                                    'temperature':[temperature_list[i]],'height':[alt2tude_list[i]]}]})
            time_point += 1

        else:
            datalist.append({'sensorID':10,'data': [{'pressure':[pressure_list[i]],\
                                    'temperature':[temperature_list[i]],'height':[alt2tude_list[i]]}]})

    return datalist , speed_list

def make_meta_dict():
    global fix_on
    temp_list = find_data("Tempe")
    min_temp = min(temp_list)
    avg_temp = sum(temp_list)/len(temp_list)
    max_temp = max(temp_list)
    if len(fix_on)>0:
        speed_list = find_gps_data("Speed")
        
        
        average_speed = sum(speed_list)/len(speed_list)
        max_speed = max(speed_list)
        
        meta_dict = {"averageSpeed":average_speed,"maxSpeed":max_speed,"other":[{"temperature":[min_temp,avg_temp,max_temp]}]}
    else:
        meta_dict = {"other":[{"temperature":[min_temp,avg_temp,max_temp]}]}
    return meta_dict
