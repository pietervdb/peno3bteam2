

def gem_snelheid(tripID):
    target2 = open('GPSdata/'+'tripID'+'.txt','r')
    target1 = open('GPSdata/gem_snelheid.txt','r+')
    gem_snelheid_lijst = target1.readlines()
    lijnen_lijst = target2.readlines()
    i=0
    aantal_punten=0
    aantal_punten_gevonden=0
    snelheden = []
    for lijn in lijnen_lijst:
        if lijn[0:3] == "Sat":
            aantal_punten +=1
    while i < len(lijnen_lijst):
        if lijnen_lijst[i][0:5] == 'speed' and aantal_punten_gevonden < aantal_punten:
            snelheden=[float(lijnen_lijst[i+1][0:-1]),]
            aantal_punten_gevonden += 1
        i+=1
    gem_snelheid_oud = float(gem_snelheid_lijst[0])
    nr_datas_oud = float(gem_snelheid_lijst[1])
    gem_snelheid_trip=0
    nr_datas_nieuw=nr_datas_oud+aantal_punten
    for i in snelheden:
        gem_snelheid_trip += i/aantal_punten
    gem_snelheid=gem_snelheid_oud*nr_datas_oud/ nr_datas_nieuw + gem_snelheid_trip*aantal_punten/ nr_datas_nieuw
    gem_snelheid_lijst[0]= str(gem_snelheid)+'\n'
    gem_snelheid_lijst[1]= str(nr_datas_nieuw)+'\n'
    target1.writelines(gem_snelheid_lijst)
    return
    
    
    
    
