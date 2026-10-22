# Windows USB bridge for NutriCart RGB LED.
# py -3 -m pip install pyserial
# py -3 bridge.py --ports
# py -3 bridge.py --port COM8 --demo
# py -3 bridge.py --port COM8
import argparse, json, time, urllib.request
from serial import Serial
from serial.tools import list_ports

BASE='http://127.0.0.1:8000'

def fetch(path):
    with urllib.request.urlopen(BASE+path,timeout=3) as r:
        return json.load(r)

def send(ser,message):
    ser.reset_input_buffer()
    ser.write((message+'\n').encode('ascii'))
    ser.flush()
    until=time.monotonic()+1.5

    while time.monotonic()<until:
        reply=ser.readline().decode('utf-8','replace').strip()
        if reply:
            print('Pico:',reply)
            if reply.lower()=='ack '+message.lower():
                return True

    print('WARNING: No ACK for',message,'(close Thonny and check Pico main.py)')
    return False

def main():
    global BASE
    arg=argparse.ArgumentParser()
    arg.add_argument('--ports',action='store_true')
    arg.add_argument('--port',default='COM8')
    arg.add_argument('--demo',action='store_true')
    arg.add_argument('--url',default=BASE)
    a=arg.parse_args()

    if a.ports:
        for port in list_ports.comports():
            print(port.device,port.description)
        return

    BASE=a.url.rstrip('/')

    with Serial(a.port,115200,timeout=.15,write_timeout=2) as serial:
        time.sleep(1.5)

        if a.demo:
            for cmd in ('MODE blue','FLASH green','FLASH red','MODE off'):
                send(serial,cmd)
                time.sleep(3)
            return

        previous_mode=None
        last_id=None
        last_ping=0

        print('Listening for NutriCart scans at',BASE)

        while True:
            try:
                state=fetch('/api/state')
                active=bool((state.get('settings') or {}).get('shopping_active'))
                requests=state.get('household_requests') or []
                mode='amber' if requests else ('blue' if active else 'off')
                now=time.monotonic()

                if mode!=previous_mode or now-last_ping>5:
                    send(serial,'MODE '+mode)
                    previous_mode=mode
                    last_ping=now

                event=fetch('/api/led/latest')
                event_id=int(event.get('id') or 0)

                if last_id is None:
                    last_id=event_id
                elif event_id>last_id:
                    last_id=event_id
                    result=event.get('result')

                    if result in ('green','red'):
                        print('Barcode',event.get('barcode'),result.upper())
                        send(serial,'FLASH '+result)

            except Exception as e:
                print('Connection error:',e)

            time.sleep(.8)

if __name__=='__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Stopped')
