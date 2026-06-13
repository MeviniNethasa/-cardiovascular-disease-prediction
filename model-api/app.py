from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

# Load LightGBM model
with open("lightgbm.pkl", "rb") as f:
    model = pickle.load(f)

# Real-world min/max from the original cardiovascular dataset
# Used to replicate the exact same MinMaxScaler preprocessing
RAW_RANGES = {
    "gender":      (1, 2),
    "ap_hi":       (80, 200),
    "ap_lo":       (60, 140),
    "cholesterol": (1, 3),
    "gluc":        (1, 3),
    "smoke":       (0, 1),
    "alco":        (0, 1),
    "active":      (0, 1),
    "age_years":   (18, 80),
    "bmi":         (10, 60),
}

def scale(value, min_val, max_val):
    if max_val == min_val:
        return 0.0
    scaled = (value - min_val) / (max_val - min_val)
    return max(0.0, min(1.0, scaled))  # clip to [0,1]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    gender      = int(data["gender"])
    ap_hi       = int(data["ap_hi"])
    ap_lo       = int(data["ap_lo"])
    cholesterol = int(data["cholesterol"])
    gluc        = int(data["gluc"])
    smoke       = int(data["smoke"])
    alco        = int(data["alco"])
    active      = int(data["active"])
    age_years   = float(data["age_years"])
    bmi         = float(data["bmi"])

    # Derived features — same as preprocessing
    pulse_pressure               = ap_hi - ap_lo
    cholesterol_gluc_interaction = cholesterol * gluc

    # Scale each feature to 0-1
    gender_s      = scale(gender,      *RAW_RANGES["gender"])
    ap_hi_s       = scale(ap_hi,       *RAW_RANGES["ap_hi"])
    ap_lo_s       = scale(ap_lo,       *RAW_RANGES["ap_lo"])
    cholesterol_s = scale(cholesterol, *RAW_RANGES["cholesterol"])
    gluc_s        = scale(gluc,        *RAW_RANGES["gluc"])
    smoke_s       = scale(smoke,       *RAW_RANGES["smoke"])
    alco_s        = scale(alco,        *RAW_RANGES["alco"])
    active_s      = scale(active,      *RAW_RANGES["active"])
    age_s         = scale(age_years,   *RAW_RANGES["age_years"])
    bmi_s         = scale(bmi,         *RAW_RANGES["bmi"])

    # pulse_pressure range = ap_hi_max - ap_lo_min to ap_hi_min - ap_lo_max
    # simplified: 0 to 140 is safe range
    pp_s  = scale(pulse_pressure,               0, 140)
    cgi_s = scale(cholesterol_gluc_interaction, 1, 9)

    features = np.array([[
        gender_s, ap_hi_s, ap_lo_s, cholesterol_s, gluc_s,
        smoke_s, alco_s, active_s,
        age_s, bmi_s,
        pp_s, cgi_s
    ]])

    probability  = model.predict_proba(features)[0][1]
    risk_percent = round(float(probability) * 100, 1)

    if risk_percent > 60:
        risk_level = "High"
    elif risk_percent > 35:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    risk_factors = []
    if smoke == 1:          risk_factors.append("Smoking")
    if alco == 1:           risk_factors.append("Alcohol consumption")
    if active == 0:         risk_factors.append("Physical inactivity")
    if cholesterol == 3:    risk_factors.append("Very high cholesterol")
    elif cholesterol == 2:  risk_factors.append("Above-normal cholesterol")
    if gluc == 3:           risk_factors.append("Very high glucose")
    elif gluc == 2:         risk_factors.append("Above-normal glucose")
    if ap_hi > 140:         risk_factors.append("High systolic BP (>140)")
    if pulse_pressure > 60: risk_factors.append("High pulse pressure")
    if bmi > 30:            risk_factors.append("Obesity (BMI > 30)")
    if age_years > 55:      risk_factors.append("Age over 55")

    return jsonify({
        "risk_percent": risk_percent,
        "risk_level":   risk_level,
        "risk_factors": risk_factors
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)