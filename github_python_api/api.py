from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
from utils import predict_smiles
from utils import extract_med_name
from utils import *
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3001"],  # Allow requests from Server2
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

class MedicationRequest(BaseModel):
    medications: List[str]

# Load the trained model
model = joblib.load("C:/Users/sumairaibiA/Code/fhir/test_app/patient_view/python_api/darena/api/models/random_forest_model_v1.pkl")  # Ensure model.joblib is in the same directory

class MedicationRequest(BaseModel):
    medications: List[str]

@app.get("/")
async def salam():
    return {"message": "salam world"}

@app.post("/predict_smiles")
def predict(request: MedicationRequest):
    predictions = {}

    print("I RAN ibia")
    for med in request.medications:
        print("api med output",med)
        extract_med = extract_med_name(med)        
        if len(extract_med) > 1:
            for med_int in extract_med:
                active_compound = get_active_ingredient(med_int)
                if active_compound:
                    print("insdie api python extract_med if",active_compound)
                    smiles = predict_smiles(active_compound[0])  # Define `smiles` before using it
                    print("I am smiles inside pyton api", smiles)
                    predictions[med] = smiles
                else:
                    print("no active compound found")
        else:
                
                print("insdie api python extract_med else", extract_med[0])
                active_compound = get_active_ingredient(extract_med[0])
                print("active ingredient", active_compound)
                if active_compound:
                    smiles = predict_smiles(active_compound[0])  # Define `smiles` before using it
                    predictions[med] = smiles 
                else:
                    print("no active compount found")   

    return {"predictions": predictions}
            
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)



