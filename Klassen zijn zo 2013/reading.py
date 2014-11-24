lines_list = []
fix_on = []

def read(tripnumber):
    global lines_list
    target = open('Data/'+tripnumber+'.txt','r')
    with target as textfile:
        lines_list = textfile.readlines()
    target.close()
    find_fix()

def find_fix():
    global fix_on
    i = 0
    while i < len(lines_list):
        if lines_list[i][0:5] == "Fix:Y":
            fix_on.append(i)
        i += 24
    
def find_time(st):
    if st == 'start':
        return lines_list[fix_on[0]+4][:-1]
    elif st == 'stop':
        return lines_list[fix_on[-1]+4][:-1]

def data_position(first_five):
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
            data_list.append(lines_list[i+position][:-1])
    else:
        for i in fix_on:
            data_list.append(float(lines_list[i+position][:-1]))

    return data_list

def find_data(first_five):
    "data that is independent of a fix"
    position = data_position(first_five)
    data_list = []
    position = i
    
    if first_five == "Date/":
        while i < len(lines_list):
            data_list.append(lines_list[i][:-1])
            i += 24
    else:
        while i < len(lines_list):
            data_list.append(float(lines_list[i][:-1]))
            i += 24
        
    return data_list

def compose_gps_coordinates():
    x = find_gps_data('Loc_x')
    y = find_gps_data('Loc_y')
    data_list = []
    
    for i in range(len(x))
        data_list.append([x[i],y[i]])

    return data_list

def make_data_list():
    datalist = []
    #gps
    gps_coordinates = compose_gps_coordinates()
    timestamp_gps_list = find_gps_data('Date/')
    speed_list = find_gps_data(tripID,'Speed')
    for i in range(len(gps_coordinaten)):
        datalist.append({'sensorID':1,'timestamp':timestamp_gps_list[i],'data': [{'type':'Point', 'coordinates':gps_coordinates[i],\
                                                 'unit':'google','speed':[speed_list[i]]}]})
    #barometer
    temperature_list = find_data("Tempe")
    pressure_list = find_data("Press")
    alt2tude_list = find_data("Alt2t")
    
    time_point = 0
    for i in range(len(temperature_list)):
        if i*24 in fix_on:
            datalist.append({'sensorID':10, 'timestamp':timestamp_gps_list[time_point],'data': [{'pressure':[pressure_list[i]],\
                                    'temperature':[temperature_list[i]],'height':[alt2tude_list[i]]}]})
            time_point += 1

        else:
            datalist.append({'sensorID':10,'data': [{'pressure':[pressure_list[i]],\
                                    'temperature':[temperature_list[i]],'height':[alt2tude_list[i]]}]})
    return datalist

def make_meta_dict():
    speed_list = find_gps_data("Speed")
    temp_list = find_data(tripID,"Tempe")
    
    averageSpeed = sum(speed_list)/len(speed_list)
    max_speed = max(speed_list)

    min_temp = min(temp_list)
    avg_temp = sum(temp_list)/len(temp_list)
    max_temp = max(temp_list)
    
    meta_dict = {"averageSpeed":average_speed,"maxSpeed":max_speed,"other":[{"temperature":[min_temp,avg_temp,max_temp]}]}
    return meta_dict
