import os
import socket

import uvicorn

if __name__ == "__main__":
    host = "0.0.0.0"
    port = int(os.getenv("PORT", "8000"))
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = "<your-computer-IP>"

    print("\nNutriCart Hub backend starting...\n")
    print(f"Home Dock (this computer or the kitchen tablet): http://{ip}:{port}/dock")
    print(f"Web Cart Unit (open on each phone):              http://{ip}:{port}/cart")
    print(f"Expo Cart Unit: put http://{ip}:{port} into cart-expo/.env as EXPO_PUBLIC_API_URL\n")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
