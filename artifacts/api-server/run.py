"""Entry point: reads PORT from environment and starts uvicorn."""
import os
import sys
import uvicorn

port_str = os.environ.get("PORT")
if not port_str:
    print("ERROR: PORT environment variable is required.", file=sys.stderr)
    sys.exit(1)

port = int(port_str)

if __name__ == "__main__":
    uvicorn.run(
        "server.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
    )
