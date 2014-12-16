datalist = []
end_points = []
lines_list = []

def read2(tripnumber):
    global lines_list
    global end_points
    target = open('Data/'+tripnumber+'.txt','r')
    with target as textfile:
        lines_list = textfile.readlines()
    target.close()

    i = 0
    while i < len(lines_list):
        if lines_list[i] == "END\n":
            end_points.append(i)
        i += 1
        
def find_data(first_five):
    datalist = []
    i = 0
    j = 0
    while i < len(end_points):
        if i >1:
            j = end_points[i-1]
        while j < end_points[i]:
            if lines_list[j][:5] == first_five:
                datalist.append(float(between_brackets(lines_list[j])))
                break
            j += 1
##        if lines_list[j][:5] != first_five:
##            print "probleem",i
##            print lines_list[j]
##            print first_five
        i += 1
    return datalist

def give_time():
    datalist = []
    i = 0
    j = 0
    while i < len(end_points):
        if i >1:
            j = end_points[i-1]
        while j < end_points[i]:
            if lines_list[j][:5] == "Date/":
                datalist.append(between_brackets(lines_list[j]))
                break
            j += 1
##        if lines_list[j][:5] != first_five:
##            print "probleem",i
##            print lines_list[j]
##            print first_five
        i += 1
    timelist2 = []
    for timepoint in datalist:
        timelist2.append(timewriter(timepoint))
    return timelist2

def make_gps_datalist():
    datalist = []
    coordinates = return_coordinates()
    speed_list = find_data("Speed")
    temp_list = find_data("Tempe")
    press_list = find_data("Press")
    alt_list = find_data("Alt2t")
    timestamp_list = give_time()
    for i in range(len(coordinates)):
        datalist.append({'sensorID':1,'timestamp':timestamp_list[i],'data': [{'type':'Point',\
                    'coordinates':coordinates[i],'unit':'google','speed':[speed_list[i]]}]})
        datalist.append({'sensorID':10,'timestamp':timestamp_list[i],'data': [{"pressure":[press_list[i]],"temperature":[temp_list[i]],"height":[alt_list[i]]}]})
    return datalist
        
def find_time(st):
    "finds start/stop time"
    timelist = give_time()
    
    
    if st == 'start':
        return timelist[0]
    elif st == 'stop':
        return timelist[-1]
    
def decimalextender(number):
    "converts one-digit numbers to two-digits: 1 -> 01, 5 -> 05, 10 -> 10"
    if int(number) < 10:
        return "0"+number
    else:
        return number

def find_signs(line):
    "Finds the signs and spaces in a line"
    signs = []
    i = 0
    special_signs = [":","-"," "]
    while i < len(line):
        if line[i] in special_signs:
            signs.append(i)
        i+=1
    return signs

def timewriter(datime):
    "Gives time back in the right format"
    signs_lst = find_signs(datime)
    
    year = decimalextender(datime[:signs_lst[0]])
    day = decimalextender(datime[signs_lst[0]+1:signs_lst[1]])
    month = decimalextender(datime[signs_lst[1]+1:signs_lst[2]])
    hours = decimalextender(datime[signs_lst[2]+1:signs_lst[3]])
    minutes = decimalextender(datime[signs_lst[3]+1:signs_lst[4]])
    seconds = decimalextender(datime[signs_lst[4]+1:])
    
    correct_datime = "20" + year + "-" + month + "-" + day + "T"+hours+":"+minutes+":"+seconds+".000Z"
    return correct_datime
    

        
def between_brackets(line):
    i = 0
    first = 0
    last = 0
    while i < len(line):
        if line[i] == "[":
            first = i
        elif line[i] == "]":
            last = i
            break
        i += 1
    return line[first+1:last]
        
    
def return_coordinates():
    a = find_data("Loc_x")
    b = find_data("Loc_y")
    coordinates = []
    if len(a) != len(b):
        print "oeps"
    i = 0
    while i < len(a):
        coordinates.append([a[i],b[i]])
        i += 1
    return coordinates

def make_meta_dict2():
    temp_list = find_data("Tempe")
    min_temp = min(temp_list)
    avg_temp = sum(temp_list)/len(temp_list)
    max_temp = max(temp_list)
    speed_list = find_data("Speed")
    average_speed = sum(speed_list)/len(speed_list)
    max_speed = max(speed_list)
    meta_dict = {"averageSpeed":average_speed,"maxSpeed":max_speed,"other":[{"temperature":[min_temp,avg_temp,max_temp]}]}
    return meta_dict
    

























        
    
    
