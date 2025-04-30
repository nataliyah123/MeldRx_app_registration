from fastapi import FastAPI  # Import FastAPI framework to create the API
from pydantic import BaseModel  # Import BaseModel for request data validation
from typing import List  # Import List type hint for typing medication lists
import joblib  # Import joblib to load the trained machine learning model
import os  # Import os module to handle file paths
from utils import predict_smiles  # Import function to predict SMILES from active compound
from utils import extract_med_name  # Import function to extract medication names
from utils import *  # Import all other utility functions (including get_active_ingredient)
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware for cross-origin requests


app = FastAPI()  # Initialize FastAPI app instance

# Configure CORS to allow requests from the frontend server running on localhost:3001
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3001"],  # Allow requests from Server2 (frontend)
    allow_credentials=True,
    allow_methods=["POST"],  # Only allow POST requests
    allow_headers=["*"],  # Allow all headers
)

# Define the request body model with a list of medication names
class MedicationRequest(BaseModel):
    medications: List[str]

# Load the pre-trained random forest model from the models directory
model_path = os.path.join(os.path.dirname(__file__), "models", "random_forest_model_v1.pkl")
model = joblib.load(model_path)

# Define the root GET endpoint for a simple health check
@app.get("/")
async def salam():
    return {"message": "salam world"}

# Define the POST endpoint to predict SMILES strings for given medications
@app.post("/predict_smiles")
def predict(request: MedicationRequest):
    predictions = {}  # Dictionary to store medication to SMILES predictions

    # Iterate over each medication in the request
    for med in request.medications:
        extract_med = extract_med_name(med)  # Extract medication names from input string

        if len(extract_med) > 1:  # If multiple medication names extracted
            for med_int in extract_med:
                active_compound = get_active_ingredient(med_int)  # Get active ingredient
                if active_compound:
                    smiles = predict_smiles(active_compound[0],model)  # Predict SMILES string
                    predictions[med] = smiles  # Store prediction
                else:
                    print("no active compound found")  # Log if no active ingredient found
        else:
            # If only one medication name extracted
            active_compound = get_active_ingredient(extract_med[0])  # Get active ingredient
            if active_compound:
                smiles = predict_smiles(active_compound[0],model)  # Predict SMILES string
                predictions[med] = smiles  # Store prediction
            else:
                print("no active compount found")  # Log if no active ingredient found

    return {"predictions": predictions}  # Return all predictions as JSON response

# Run the app with uvicorn if this script is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
