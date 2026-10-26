# NutriCart Pico MicroPython, common-anode RGB LED.
# 3V3 to common anode. Each colour needs a 220 ohm resistor.
# GP13 red, GP12 green, GP11 blue. Leave LCD disconnected.
from machine import Pin, PWM
import sys, time, select

r,g,b=(PWM(Pin(x)) for x in (13,12,11))
for led in (r,g,b): led.freq(1000)

def colour(red,green,blue):
    for led,value in zip((r,g,b),(red,green,blue)):
        led.duty_u16(65535-value)

OFF=(0,0,0)
GREEN=(0,26000,0)
RED=(26000,0,0)
BLUE=(0,0,18000)
AMBER=(22000,9000,0)

mode='off'
flash=None
until=None

colour(*BLUE)
time.sleep_ms(300)
colour(*OFF)

poller=select.poll()
poller.register(sys.stdin,select.POLLIN)
print('NUTRICART_LED_READY')

while True:
    now=time.ticks_ms()

    if poller.poll(0):
        msg=sys.stdin.readline().strip().lower()
        words=msg.split()

        if len(words)==2 and words[0]=='mode' and words[1] in ('off','blue','amber','red'):
            mode=words[1]
            print('ACK '+msg)

        elif len(words)==2 and words[0]=='flash' and words[1] in ('green','red'):
            flash=words[1]
            until=time.ticks_add(now,2800)
            print('ACK '+msg)

        elif msg=='ping':
            print('ACK ping')
        else:
            print('ERROR '+msg)

    if flash and time.ticks_diff(until,now)>0:
        colour(*(GREEN if flash=='green' else RED))
    else:
        flash=None

        if mode=='blue':
            colour(*BLUE)
        elif mode=='amber':
            colour(*(AMBER if now%1200<700 else OFF))
        elif mode=='red':
            colour(*(RED if now%1000<500 else OFF))
        else:
            colour(*OFF)

    time.sleep_ms(40)
