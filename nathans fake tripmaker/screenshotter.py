from PIL import ImageGrab
from PIL import Image
import time
i = 0
time.sleep(1)
a = time.time()
while i < 57:
    b = time.time()
    while (b-a) < 3.49:
        b = time.time()
    a = time.time()
    img = ImageGrab.grab()
    img = img.resize((600,338), Image.ANTIALIAS)
    img.save('screenshots/'+str(i)+'.jpg','JPEG')
    print i
    i += 1
print "klaar"

