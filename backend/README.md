# Acute Algo Backend

## Setup

1. Create and activate the virtual environment (if not already):
   ```sh
   uv venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```sh
   uv pip install -r requirements.txt
   ```

## Running the server

```sh
uvicorn main:app --reload
```

## Health Check

Visit [http://localhost:8000/health](http://localhost:8000/health) to verify the server is running. 