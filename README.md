# CVD Risk Prediction Web App

A full-stack web application that predicts cardiovascular disease (CVD) risk based on user health data. Built to showcase a trained LightGBM machine learning model through a simple, clean interface.

---

##  Architecture

```
User (Browser)
      ↓
React Frontend        (port 3000)  — user enters health data
      ↓  HTTP POST /api/predict
Java Spring Boot      (port 8080)  — receives and forwards request
      ↓  HTTP POST /predict
Python Flask API      (port 5000)  — loads model, scales input, returns prediction
      ↓
lightgbm.pkl                       — trained LightGBM classifier
```

---

##  Machine Learning Model

- **Algorithm:** LightGBM Classifier (`learning_rate=0.05, random_state=42`)
- **Training data:** Cardiovascular Disease Dataset (70,000 records)
- **Preprocessing:** MinMaxScaler applied to continuous features
- **Model file:** `lightgbm.pkl`

### Features used

| Feature | Description | Type |
|---|---|---|
| `gender` | 1 = Female, 2 = Male | Categorical |
| `ap_hi` | Systolic blood pressure | Continuous |
| `ap_lo` | Diastolic blood pressure | Continuous |
| `cholesterol` | 1 = Normal, 2 = Above normal, 3 = Well above | Categorical |
| `gluc` | 1 = Normal, 2 = Above normal, 3 = Well above | Categorical |
| `smoke` | Smoking (0/1) | Binary |
| `alco` | Alcohol intake (0/1) | Binary |
| `active` | Physical activity (0/1) | Binary |
| `age_years` | Age in years | Continuous |
| `bmi` | Body Mass Index | Continuous |
| `pulse_pressure` | ap_hi − ap_lo (derived) | Continuous |
| `cholesterol_gluc_interaction` | cholesterol × gluc (derived) | Continuous |

---

##  Project Structure

```
AI_prj/
├── model-api/                  # Python Flask — model serving
│   ├── app.py                  # Flask API endpoint
│   ├── lightgbm.pkl            # Trained LightGBM model
│   ├── scaler.pkl              # Fitted MinMaxScaler
│   └── requirements.txt        # Python dependencies
│
├── cvd/                        # Java Spring Boot — backend
│   ├── pom.xml
│   └── src/main/java/com/cvd/
│       ├── CvdApplication.java
│       └── controller/
│           └── PredictionController.java
│
└── cvd-frontend/               # React — frontend UI
    └── src/
        └── App.js
```

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Create React App) |
| Backend | Java 23, Spring Boot 3.2, Maven |
| Model API | Python 3.12, Flask, LightGBM |
| IDE | IntelliJ IDEA |
| ML Training | Jupyter Notebook, scikit-learn, LightGBM |

---

##  How to Run

### Prerequisites
- Python 3.x with Anaconda
- Java 23
- Node.js & npm
- IntelliJ IDEA

### Step 1 — Start Python Model API
```bash
cd model-api
pip install -r requirements.txt
python app.py
# Running on http://127.0.0.1:5000
```

### Step 2 — Start Java Backend
Open the `cvd` folder in IntelliJ IDEA and click the green **Run** button on `CvdApplication.java`.
```
# Running on http://localhost:8080
```

### Step 3 — Start React Frontend
```bash
cd cvd-frontend
npm install
npm start
# Opens http://localhost:3000
```

>  All three must be running at the same time for the app to work.

---

## 🔍 How It Works

1. User enters health data in the React form
2. React sends a `POST` request to Java backend at `/api/predict`
3. Java forwards the request to Python Flask at `/predict`
4. Flask manually scales raw inputs to match training data ranges (0–1)
5. Scaled features are passed to `lightgbm.pkl` via `model.predict_proba()`
6. Flask returns risk percentage, risk level, and contributing risk factors
7. React displays the result to the user

### Risk Levels
| Risk % | Level |
|---|---|
| 0 – 35% | 🟢 Low |
| 35 – 60% | 🟡 Moderate |
| > 60% | 🔴 High |

---

##  Python Dependencies

```
flask
flask-cors
scikit-learn
lightgbm
numpy
pandas
```

---

##  Notes

- No database is used — this is a stateless showcase app
- Data is not stored; refreshing the page clears all inputs
- The two derived features (`pulse_pressure`, `cholesterol_gluc_interaction`) are computed automatically from user inputs — users do not enter these
- The `scaler.pkl` was fitted on preprocessed data; raw input scaling is handled manually in `app.py` using known medical value ranges

---

##  Author

Mevini Munaweera  
AI/ML Project — Cardiovascular Disease Risk Prediction
