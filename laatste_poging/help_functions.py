##def split_data(line):
##    "Splits dataname and datadata based on bracket location"
##    i = 0
##    while True:
##        if line[i] == "[":
##            break
##        i += 1
##    j = i
##    while True and j < len(line):
##        if line[j] == "]":
##            break
##        j += 1
##    return [line[:i-1],line[i+1:j]]

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
    
def split_data(line):
    i=0
    while i<len(line):
        if line[i] == "[":
            break
        i+=1
        if i == len(line):
            return ['0','0']
    j=i
    while j<len(line):
        if line[j] == "]":
            break
        j += 1
    data = line[i+1:j]
    if not line[:3] == 'Dat':
        if not is_number(data):
            data = '0'
    return [line[:i-1],data]

def decimalextender(number):
    "converts one-digit numbers to two-digits: 1 -> 01, 5 -> 05, 10 -> 10"
    try:
        int(number)
        if int(number) < 10:
            return "0"+number
        else:
            return number
    except ValueError:
        return '00'

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
    global last
    try:
        timewriter1(datime)
        time = timewriter1(datime)
        last = time
        return time
    except Exception:
        return last

def timewriter1(datime):
    "Gives time back in the right format"
    global last
    signs_lst = find_signs(datime)
    year = decimalextender(datime[:signs_lst[0]])
    day = decimalextender(datime[signs_lst[0]+1:signs_lst[1]])
    month = decimalextender(datime[signs_lst[1]+1:signs_lst[2]])
    try:
        int(datime[signs_lst[2]+1:signs_lst[3]])
        hours = decimalextender(str(1+int(datime[signs_lst[2]+1:signs_lst[3]])))
    except ValueError:
         hours = decimalextender(str(datime[signs_lst[2]+2:signs_lst[3]]))
    #UTC+1
    minutes = decimalextender(datime[signs_lst[3]+1:signs_lst[4]])
    seconds = decimalextender(datime[signs_lst[4]+1:])
    
    correct_datime = "20" + year + "-" + month + "-" + day + "T"+hours+":"+minutes+":"+seconds+".000Z"
    return correct_datime
