# Starting the PolyMathOS Server

## Quick Start

### Option 1: Using the startup script (Recommended)
```bash
python start_server.py
```

### Option 2: Using uvicorn directly
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 3: Using Python module
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Server Endpoints

Once the server is running, you can access:

- **Root**: http://localhost:8000/
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **System Status**: http://localhost:8000/system/status
- **Integration Status**: http://localhost:8000/integrations/status
- **Initialize Integrations**: POST http://localhost:8000/integrations/initialize

## Environment Variables

You can configure the server using environment variables:

```bash
export HOST="0.0.0.0"        # Server host (default: 0.0.0.0)
export PORT="8000"           # Server port (default: 8000)
export RELOAD="true"         # Auto-reload on code changes (default: true)
export DATABASE_URL="..."    # TigerDB connection string
```

## Reviewing Integrations

### Check Integration Status
```bash
curl http://localhost:8000/integrations/status
```

### Initialize All Integrations
```bash
curl -X POST http://localhost:8000/integrations/initialize
```

### Check System Status (includes integrations)
```bash
curl http://localhost:8000/system/status
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change it:
```bash
export PORT=8001
python start_server.py
```

### Import Errors
Make sure you're in the backend directory:
```bash
cd backend
python start_server.py
```

### Database Connection
If you see database errors, make sure DATABASE_URL is set:
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
```

## Integration Features

The server now includes endpoints to:
- View integration status (TigerDB, SwarmDB, Swarms Tools, Alpha Evolve)
- Initialize all integrations
- Check health of all components

All integration status is included in the `/system/status` endpoint.

