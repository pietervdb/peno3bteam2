

def gem_snelheid(tripID):
    target2 = open('GPSdata/'+'tripID'+'.txt','r')
    target1 = open('GPSdata/gem_snelheid.txt','w')
    gem_snelheid = target1.readline()
    for lijn in lijnen_lijst:
        if lijn[0:3] == "Spe":
            snelheid = target1.readline
        return snelheid
