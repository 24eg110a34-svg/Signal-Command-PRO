from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle, json, pandas as pd, numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os, warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ── Load or train model ──────────────────────────────────────────
BASE = os.path.dirname(__file__)

def train_and_save():
    print("🔄 Training model from CSVs...")
    df1 = pd.read_csv(os.path.join(BASE, 'Traffic.csv'))
    df2 = pd.read_csv(os.path.join(BASE, 'TrafficTwoMonth.csv'))
    df  = pd.concat([df1, df2], ignore_index=True)

    df['hour']     = pd.to_datetime(df['Time'], format='%I:%M:%S %p').dt.hour
    df['minute']   = pd.to_datetime(df['Time'], format='%I:%M:%S %p').dt.minute
    day_map = {'Monday':0,'Tuesday':1,'Wednesday':2,'Thursday':3,'Friday':4,'Saturday':5,'Sunday':6}
    df['dow']      = df['Day of the week'].map(day_map)
    df['is_weekend']     = (df['dow'] >= 5).astype(int)
    df['is_peak']        = df['hour'].apply(lambda h: 1 if (7<=h<=9 or 16<=h<=19) else 0)
    df['car_ratio']      = df['CarCount'] / (df['Total']+1)
    df['truck_bus_ratio']= (df['TruckCount']+df['BusCount']) / (df['Total']+1)

    le   = LabelEncoder()
    df['label'] = le.fit_transform(df['Traffic Situation'])
    feat = ['hour','minute','dow','is_weekend','is_peak',
            'CarCount','BikeCount','BusCount','TruckCount',
            'Total','car_ratio','truck_bus_ratio']

    X, y = df[feat], df['label']
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(Xtr, ytr)
    acc = accuracy_score(yte, model.predict(Xte))
    print(f"✅ Model trained — Accuracy: {acc:.2%}")

    pickle.dump(model, open(os.path.join(BASE,'rf_model.pkl'),'wb'))
    pickle.dump(le,    open(os.path.join(BASE,'label_encoder.pkl'),'wb'))
    pickle.dump(feat,  open(os.path.join(BASE,'feature_cols.pkl'),'wb'))

    # Pre-compute stats
    hourly = df.groupby('hour').agg(
        total=('Total','mean'), cars=('CarCount','mean'),
        bikes=('BikeCount','mean'), buses=('BusCount','mean'),
        trucks=('TruckCount','mean')).round(1).reset_index().to_dict('records')

    day_order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    day_stats = df.groupby('Day of the week').agg(
        avg=('Total','mean'), peak=('Total','max')).round(1).reset_index()
    day_stats['order'] = day_stats['Day of the week'].map({d:i for i,d in enumerate(day_order)})
    day_stats = day_stats.sort_values('order').rename(columns={'Day of the week':'day'})
    weekly = day_stats[['day','avg','peak']].to_dict('records')

    sit_dist = df['Traffic Situation'].value_counts().to_dict()
    fi = dict(zip(feat, [round(float(x),4) for x in model.feature_importances_]))

    stats = {
        'hourly': hourly, 'weekly': weekly,
        'situation_dist': sit_dist,
        'feature_importance': fi,
        'accuracy': round(float(acc), 4),
        'total_records': len(df),
        'classes': list(le.classes_),
        'avg_total': round(float(df['Total'].mean()),1),
        'max_total': int(df['Total'].max()),
        'vehicle_breakdown': {
            'cars':   round(float(df['CarCount'].mean()),1),
            'bikes':  round(float(df['BikeCount'].mean()),1),
            'buses':  round(float(df['BusCount'].mean()),1),
            'trucks': round(float(df['TruckCount'].mean()),1),
        }
    }
    with open(os.path.join(BASE,'stats.json'),'w') as f:
        json.dump(stats, f)
    return model, le, feat, stats

# Load
if os.path.exists(os.path.join(BASE,'rf_model.pkl')):
    model    = pickle.load(open(os.path.join(BASE,'rf_model.pkl'),'rb'))
    le       = pickle.load(open(os.path.join(BASE,'label_encoder.pkl'),'rb'))
    feat     = pickle.load(open(os.path.join(BASE,'feature_cols.pkl'),'rb'))
    with open(os.path.join(BASE,'stats.json')) as f:
        STATS = json.load(f)
    print("✅ Model loaded from disk")
else:
    model, le, feat, STATS = train_and_save()

COLOR_MAP = {'low':'#22c55e','normal':'#eab308','heavy':'#f97316','high':'#ef4444'}
SCORE_MAP  = {'low':20,       'normal':45,       'heavy':70,       'high':90}

# ── Routes ───────────────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify({'status':'ok','accuracy': STATS['accuracy'],'records': STATS['total_records']})

@app.route('/predict', methods=['POST'])
def predict():
    d = request.json
    hour   = int(d.get('hour', 8))
    minute = int(d.get('minute', 0))
    dow    = int(d.get('dow', 1))
    cars   = float(d.get('cars', 50))
    bikes  = float(d.get('bikes', 5))
    buses  = float(d.get('buses', 10))
    trucks = float(d.get('trucks', 15))
    total  = cars + bikes + buses + trucks

    is_weekend     = 1 if dow >= 5 else 0
    is_peak        = 1 if (7<=hour<=9 or 16<=hour<=19) else 0
    car_ratio      = cars / (total+1)
    truck_bus_ratio= (trucks+buses) / (total+1)

    X = [[hour, minute, dow, is_weekend, is_peak,
          cars, bikes, buses, trucks, total,
          car_ratio, truck_bus_ratio]]

    pred_label = le.inverse_transform(model.predict(X))[0]
    proba      = model.predict_proba(X)[0]
    confidence = round(float(max(proba))*100, 1)

    score  = SCORE_MAP[pred_label]
    color  = COLOR_MAP[pred_label]
    speed  = max(8, round(65 - score*0.58))
    delay  = round(score/3.5)
    all_proba = {cls: round(float(p)*100,1) for cls,p in zip(le.classes_, proba)}

    return jsonify({
        'situation': pred_label,
        'score': score,
        'color': color,
        'speed': speed,
        'delay': delay,
        'confidence': confidence,
        'probabilities': all_proba,
        'total_vehicles': round(total),
    })

@app.route('/stats')
def stats():
    return jsonify(STATS)

@app.route('/hourly')
def hourly():
    return jsonify(STATS['hourly'])

@app.route('/weekly')
def weekly():
    return jsonify(STATS['weekly'])

@app.route('/retrain', methods=['POST'])
def retrain():
    global model, le, feat, STATS
    model, le, feat, STATS = train_and_save()
    return jsonify({'status':'retrained','accuracy': STATS['accuracy']})

if __name__ == '__main__':
    print("🚦 Traffic API running on http://localhost:5000")
    app.run(debug=True, port=5000)
