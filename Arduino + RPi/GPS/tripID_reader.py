import sys
target = open('tripID.txt','r')
text = target.read()
lengte = len(text)
i = 0
print "tijden:"
while i < lengte-15:
    
    if (text[i] == "T") and ( text[i+1] == "i"):
        print text[i+6:i+13]
    i+=1
print "data:"
i=0
while i < lengte-1:
    
    if (text[i] == "D") and ( text[i+1] == "a"):
        print text[i+6:i+13]
    i+=1

print "fix:"
i=0
while i < lengte-1:

    if (text[i] == "F") and ( text[i+1] == "i"):
        print text[i+4:i+6]
    i+=1
