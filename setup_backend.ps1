mkdir backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi "uvicorn[standard]" sqlalchemy alembic psycopg2-binary pydantic pydantic-settings pyjwt passlib bcrypt python-multipart
alembic init alembic
mkdir core
mkdir database
mkdir models
mkdir schemas
mkdir routers
mkdir services
mkdir repositories
mkdir utils
