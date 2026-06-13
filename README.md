
# Cardiovascular Disease Risk Prediction Web Application

Production-style demo app for CVD risk screening.

Architecture:

```text
React + Tailwind -> Spring Boot REST API -> FastAPI LightGBM service -> MongoDB Atlas
```

The UI direction borrows the clean, trustworthy health-navigation style of the World Heart Federation site, especially its global cardiovascular-health language and clear content grouping.

## Project Structure

- `frontend/` - React.js + Tailwind CSS dashboard
- `backend/` - Java Spring Boot REST API for orchestration, history, recommendations, and doctor matching
- `ml-service/` - Python FastAPI service loading `updated/lightgbm.pkl`
- `updated/` - trained model and datasets

## 1. MongoDB Setup

Set the MongoDB connection string as an environment variable before running Spring Boot.

Important: because the sample password contains `@`, URL-encode it as `%40` inside the URI.

```bash
export MONGODB_URL='mongodb+srv://admin:admin123@cluster0.j4yuojl.mongodb.net/?appName=Cluster0'
export MONGODB_DATABASE='cvd_risk_app'
```

Spring Boot will seed a fake demo doctor dataset into the `doctors` collection on first run.

## 2. Run the ML Service

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## 3. Run the Spring Boot Backend

Open `backend/` in IntelliJ IDEA as a Maven project, then run:

```bash
cd backend
mvn spring-boot:run
```

Optional environment variables:

```bash
export ML_SERVICE_URL='http://localhost:8000'
export FRONTEND_URL='http://localhost:5173'
```

REST endpoints:

- `GET /api/health`
- `POST /api/predictions`
- `GET /api/predictions`

## 4. Run the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Optional frontend config:

```bash
VITE_API_BASE_URL=http://localhost:8080/api npm run dev
```

## Request Shape

```json
{
  "age": 52,
  "gender": 1,
  "height": 165,
  "weight": 72,
  "apHi": 130,
  "apLo": 85,
  "cholesterol": 1,
  "gluc": 1,
  "smoke": 0,
  "alco": 0,
  "active": 1
}
```
