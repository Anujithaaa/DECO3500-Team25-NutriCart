import socket
import uvicorn

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8000
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

    print("\nNutriCart backend starting...\n")
    print(f"Home Hub: http://localhost:{port}/hub")
    print(f"Phone API: http://{ip}:{port}")
    print("\nPut the Phone API address into cart-expo/.env as EXPO_PUBLIC_API_URL.\n")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
