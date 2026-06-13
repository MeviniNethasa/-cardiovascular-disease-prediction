import { useState } from "react";

const INITIAL_FORM = {
  age_years: "", gender: "1", bmi: "",
  ap_hi: "", ap_lo: "",
  cholesterol: "1", gluc: "1",
  smoke: "0", alco: "0", active: "1"
};

export default function App() {
  const [form, setForm]     = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.age_years || !form.bmi || !form.ap_hi || !form.ap_lo) {
      setError("Please fill in all required fields."); return;
    }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("http://localhost:8080/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_years:   parseFloat(form.age_years),
          gender:      parseInt(form.gender),
          bmi:         parseFloat(form.bmi),
          ap_hi:       parseInt(form.ap_hi),
          ap_lo:       parseInt(form.ap_lo),
          cholesterol: parseInt(form.cholesterol),
          gluc:        parseInt(form.gluc),
          smoke:       parseInt(form.smoke),
          alco:        parseInt(form.alco),
          active:      parseInt(form.active),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Cannot connect to server. Make sure Java (port 8080) and Python (port 5000) are running.");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = { Low: "#1D9E75", Moderate: "#BA7517", High: "#E24B4A" };
  const riskBg    = { Low: "#E1F5EE", Moderate: "#FAEEDA", High: "#FCEBEB" };

  return (
      <div style={{ maxWidth: 560, margin: "2rem auto", fontFamily: "system-ui", padding: "0 1rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}> CVD Risk Assessment</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
          Enter your health data to estimate cardiovascular disease risk
        </p>

        {/* Personal */}
        <Section title="Personal Information">
          <Row>
            <Field label="Age (years)" name="age_years" type="number" placeholder="e.g. 45" form={form} handle={handle} />
            <Field label="Gender" name="gender" type="select" form={form} handle={handle}
                   options={[["1","Female"],["2","Male"]]} />
            <Field label="BMI" name="bmi" type="number" placeholder="e.g. 24.5" step="0.1" form={form} handle={handle} />
          </Row>
        </Section>

        {/* Blood Pressure */}
        <Section title="Blood Pressure">
          <Row>
            <Field label="Systolic (ap_hi)" name="ap_hi" type="number" placeholder="e.g. 120" form={form} handle={handle} />
            <Field label="Diastolic (ap_lo)" name="ap_lo" type="number" placeholder="e.g. 80" form={form} handle={handle} />
          </Row>
        </Section>

        {/* Lab Results */}
        <Section title="Lab Results">
          <Row>
            <Field label="Cholesterol" name="cholesterol" type="select" form={form} handle={handle}
                   options={[["1","Normal"],["2","Above normal"],["3","Well above normal"]]} />
            <Field label="Glucose" name="gluc" type="select" form={form} handle={handle}
                   options={[["1","Normal"],["2","Above normal"],["3","Well above normal"]]} />
          </Row>
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle">
          <Row>
            <Field label="Smoking" name="smoke" type="select" form={form} handle={handle}
                   options={[["0","No"],["1","Yes"]]} />
            <Field label="Alcohol" name="alco" type="select" form={form} handle={handle}
                   options={[["0","No"],["1","Yes"]]} />
            <Field label="Physically active" name="active" type="select" form={form} handle={handle}
                   options={[["1","Yes"],["0","No"]]} />
          </Row>
        </Section>

        {error && <p style={{ color: "#E24B4A", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button onClick={submit} disabled={loading}
                style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 600,
                  background: "#185FA5", color: "#fff", border: "none", borderRadius: 10,
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Analysing…" : "Check my CVD risk →"}
        </button>

        {result && (
            <div style={{ marginTop: 24, padding: "1.25rem",
              borderRadius: 12, background: riskBg[result.risk_level],
              border: `1.5px solid ${riskColor[result.risk_level]}` }}>
              <p style={{ fontSize: 13, color: riskColor[result.risk_level], fontWeight: 600 }}>
                {result.risk_level} Risk
              </p>
              <p style={{ fontSize: 40, fontWeight: 700, color: riskColor[result.risk_level] }}>
                {result.risk_percent}%
              </p>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
                estimated CVD probability
              </p>

              {/* Progress bar */}
              <div style={{ height: 8, background: "#ddd", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ width: `${result.risk_percent}%`, height: "100%",
                  background: riskColor[result.risk_level], borderRadius: 4 }} />
              </div>

              {result.risk_factors.length > 0 && (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#555",
                      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      Contributing risk factors
                    </p>
                    <div>
                      {result.risk_factors.map(f => (
                          <span key={f} style={{ display: "inline-block", fontSize: 12, padding: "4px 10px",
                            background: "#fff", border: "0.5px solid #ccc", borderRadius: 20,
                            margin: "3px 4px 3px 0", color: "#444" }}>
                    ⚠ {f}
                  </span>
                      ))}
                    </div>
                  </>
              )}

              <button onClick={() => setResult(null)}
                      style={{ marginTop: 16, fontSize: 13, background: "none",
                        border: "0.5px solid #aaa", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
                ← Check again
              </button>
            </div>
        )}
      </div>
  );
}

// Helper components
function Section({ title, children }) {
  return (
      <div style={{ border: "0.5px solid #e0e0e0", borderRadius: 10,
        padding: "1rem", marginBottom: 12, background: "#fafafa" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#888",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{title}</p>
        {children}
      </div>
  );
}
function Row({ children }) {
  return <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{children}</div>;
}
function Field({ label, name, type, placeholder, step, options, form, handle }) {
  const base = { fontSize: 14, padding: "7px 10px", border: "0.5px solid #ccc",
    borderRadius: 8, background: "#fff", width: "100%", boxSizing: "border-box" };
  return (
      <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 12, color: "#666" }}>{label}</label>
        {type === "select"
            ? <select name={name} value={form[name]} onChange={handle} style={base}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            : <input type="number" name={name} value={form[name]} onChange={handle}
                     placeholder={placeholder} step={step || "1"} style={base} />
        }
      </div>
  );
}