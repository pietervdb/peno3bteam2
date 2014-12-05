def split_data(line):
    "Splits dataname and datadata based on bracket location"
    print 'split line',line
    i = 0
    while True:
        if line[i] == "[":
            break
        i += 1
    j = i
    while True and j < len(line):
        if line[j] == "]":
            break
        j += 1
    return [line[:i-1],line[i+1:j]]

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
    hours = decimalextender(str(1+int(datime[signs_lst[2]+1:signs_lst[3]]))) #UTC+1
    minutes = decimalextender(datime[signs_lst[3]+1:signs_lst[4]])
    seconds = decimalextender(datime[signs_lst[4]+1:])
    
    correct_datime = "20" + year + "-" + month + "-" + day + "T"+hours+":"+minutes+":"+seconds+".000Z"
    return correct_datime
