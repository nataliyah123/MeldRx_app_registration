import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem, DataStructs
import joblib
import requests
import re
import time
from bs4 import BeautifulSoup

def get_smiles_from_pubchem(medication_name):
    """
    Fetches the SMILES representation of a given medication from PubChem.

    Args:
        medication_name (str): Name of the medication.

    Returns:
        str: SMILES string if found, else None.
    """
    base_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
    url = f"{base_url}/compound/name/{medication_name}/property/IsomericSMILES/JSON"
    print("inside get smiles from pubchem", medication_name)

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad responses (4xx, 5xx)
        data = response.json()
        
        # Extract SMILES
        smiles = data["PropertyTable"]["Properties"][0]["IsomericSMILES"]
        return smiles

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from PubChem: {e}")
        return None
    except KeyError:
        print(f"SMILES not found for {medication_name}")
        return None
    finally:
        time.sleep(0.1) 

# Example Usage uncomment this
# med_name = "Aspirin"
# smiles_str = get_smiles_from_pubchem(med_name)

# if smiles_str:
#     print(f"SMILES for {med_name}: {smiles_str}")
# else:
#     print(f"SMILES not found for {med_name}")

# ***********************************************

# use rdkit to convert to smiles
def smiles_to_ecfp(smiles, radius=2, n_bits=2048):
    mol = Chem.MolFromSmiles(smiles)
    if mol:
        return np.array(AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=n_bits), dtype=np.uint8)
    else:
        return np.zeros(n_bits, dtype=np.uint8)  # Handle invalid SMILES

# ***********************************************

# use smiles to make prediction about the class of the side effect
def predict_smiles(medication_name):

    model = joblib.load("C:/Users/sumairaibiA/Code/fhir/test_app/patient_view/python_api/darena/api/models/random_forest_model_v1.pkl")  # Ensure model.joblib is in the same directory
    y_columns =    ['Blood and lymphatic system disorders',
                    'Cardiac disorders',
                    'Congenital, familial and genetic disorders',
                    'Ear and labyrinth disorders',
                    'Endocrine disorders',
                    'Eye disorders',
                    'Gastrointestinal disorders',
                    'General disorders and administration site conditions',
                    'Hepatobiliary disorders',
                    'Immune system disorders',
                    'Infections and infestations',
                    'Injury, poisoning and procedural complications',
                    'Investigations',
                    'Metabolism and nutrition disorders',
                    'Musculoskeletal and connective tissue disorders',
                    'Neoplasms benign, malignant and unspecified (incl cysts and polyps)',
                    'Nervous system disorders',
                    'Pregnancy, puerperium and perinatal conditions',
                    'Product issues',
                    'Psychiatric disorders',
                    'Renal and urinary disorders',
                    'Reproductive system and breast disorders',
                    'Respiratory, thoracic and mediastinal disorders',
                    'Skin and subcutaneous tissue disorders',
                    'Social circumstances',
                    'Surgical and medical procedures',
                    'Vascular disorders']
    print("before getsmiles", medication_name)
    smiles = get_smiles_from_pubchem(medication_name)
    # smiles = None
    print("I am inside util.py and showing smiles ibia", smiles)
    if smiles == None:
        return 'No smiles generated'
    # Convert SMILES to Morgan fingerprint
    smiles_fp = smiles_to_ecfp(smiles).reshape(1, -1)  # Reshape for model input

    # Predict the class probabilities (or binary predictions)
    y_pred = model.predict(smiles_fp)

    # Convert prediction array to dictionary with class names
    class_prediction = {y_columns[i]: int(y_pred[0][i]) for i in range(len(y_columns))}

    return class_prediction

# ***********************************************

# use pubchem to get the side effects

def get_side_effects(drug_name):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/name/{drug_name}/JSON/"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        side_effects = []

        # Traverse the JSON to find sections related to Side Effects
        for section in data.get("Record", {}).get("Section", []):
            if section.get("TOCHeading") == "Clinical Information":
                for sub_section in section.get("Section", []):
                    if sub_section.get("TOCHeading") == "Adverse Effects":
                        for info in sub_section.get("Information", []):
                            side_effects.append(info.get("Value", {}).get("StringWithMarkup", [{}])[0].get("String", ""))

        return side_effects if side_effects else ["No side effect data found."]

    return ["No data found for this drug."]

# Example Drug  uncomment this
# drug = "Ibuprofen"  # Change to any drug name
# side_effects = get_side_effects(drug)

# print(f"Side effects of {drug}:")
# for effect in side_effects:
#     print(f"- {effect}")

# ***************
# Function to get CID (PubChem Compound ID) to check if drugs are identical
def get_cid_from_pubchem(drug_name):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{drug_name}/cids/JSON"
    response = requests.get(url)

    if response.status_code == 200:
        try:
            data = response.json()
            return data["IdentifierList"]["CID"][0]  # Get the first CID
        except (KeyError, IndexError):
            return None
    return None

# Convert SMILES to Morgan Fingerprint
def smiles_to_fingerprint(smiles, radius=2, n_bits=2048):
    mol = Chem.MolFromSmiles(smiles)
    if mol:
        return AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=n_bits)
    return None

# Compute Tanimoto Similarity
def calculate_similarity(smiles1, smiles2):
    fp1 = smiles_to_fingerprint(smiles1)
    fp2 = smiles_to_fingerprint(smiles2)

    if fp1 is not None and fp2 is not None:
        return DataStructs.FingerprintSimilarity(fp1, fp2)
    return None

# Example drugs (Paracetamol and Acetaminophen - same compound)
# drug_1 = "Paracetamol"
# drug_2 = "Acetaminophen"
def compare_drugs(drug_1, drug_2):
    smiles_1 = get_smiles_from_pubchem(drug_1)
    smiles_2 = get_smiles_from_pubchem(drug_2)
    
    if smiles_1 and smiles_2:
        print(f"SMILES for {drug_1}: {smiles_1}")
        print(f"SMILES for {drug_2}: {smiles_2}")

        similarity = calculate_similarity(smiles_1, smiles_2)
        print(f"Tanimoto Similarity: {similarity:.4f}")
        
        cid_1 = get_cid_from_pubchem(drug_1)
        cid_2 = get_cid_from_pubchem(drug_2)
        
        if cid_1 and cid_2:
            if cid_1 == cid_2:
                print(f"{drug_1} and {drug_2} are the SAME compound (CID: {cid_1}).")
            else:
                print(f"{drug_1} and {drug_2} are DIFFERENT compounds (CIDs: {cid_1}, {cid_2}).")
    else:
        print("Could not retrieve SMILES for one or both drugs.")



# ******************************** extract drug name from units and dosage*****************************

def extract_med_name(unformatted_med: str) -> list:
    """
    Extracts the core drug name(s) from various prescription styles.
    - Removes dosage, administration forms, and unnecessary details.
    - Splits combination drugs (separated by " / ") into a list.
    - Ignores dosage units written as "MG/HR", "MG/ML" (no spaces around "/").
    """
    # Remove brand names in square brackets
    med_name = re.sub(r"\[.*?\]", "", unformatted_med)
    
    # Remove text with no space before and after "/"
    med_name = re.sub(r"\b\S+/\S+\b", "", med_name)

    # Remove numbers followed by units like MG, HR, ACTUAT, ML, etc.
    med_name = re.sub(r"\b\d+(\.\d+)?\s?(MG|ML|HR|ACTUAT)\b", "", med_name, flags=re.IGNORECASE)

    # Remove common dosage forms and administration routes
    med_name = re.sub(r"\b(Oral Tablet|Dry Powder Inhaler|Transdermal System|Inhalation Solution|Extended Release|Solution|Tablet|Pack|Day Pack)\b", "", med_name, flags=re.IGNORECASE)

    # Remove trailing numbers (like "28" in "Jolivette 28 Day Pack")
    med_name = re.sub(r"\b\d+\b", "", med_name).strip()

    # Remove extra spaces
    med_name = re.sub(r"\s+", " ", med_name).strip()

    # Split by ' / ' if it's a combination drug
    med_list = [name.strip().rstrip(".") for name in med_name.split(' / ')]

    return med_list

# *********************************get the active compounds from the brand************************

# def get_active_ingredient(brand_name):
#     """
#     Queries RxNorm API to get the active ingredient for a given brand name.
#     """
#     base_url = f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={brand_name}&search=1"
#     response = requests.get(base_url)

#     if response.status_code == 200:
#         data = response.json()
#         if "idGroup" in data and "rxnormId" in data["idGroup"]:
#             rxcui = data["idGroup"]["rxnormId"][0]  # Get RxCUI (RxNorm Concept Unique Identifier)
            
#             # Now get the active ingredient using RxCUI
#             ingredient_url = f"https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/related.json?tty=IN"
#             ingredient_response = requests.get(ingredient_url)

#             if ingredient_response.status_code == 200:
#                 ingredient_data = ingredient_response.json()
#                 if "relatedGroup" in ingredient_data and "conceptGroup" in ingredient_data["relatedGroup"]:
#                     for group in ingredient_data["relatedGroup"]["conceptGroup"]:
#                         if "conceptProperties" in group:
#                             ingredients = [item["name"] for item in group["conceptProperties"]]
#                             return ingredients
#     return None

# def get_active_ingredient(brand_name):
#     # Convert brand name to lowercase and replace spaces with hyphens for URL
#     base_url = f"https://www.drugs.com/pro/{brand_name.lower().replace(' ', '-')}.html"

#     # Fetch the page content
#     response = requests.get(base_url)
    
#     if response.status_code != 200:
#         return f"Error: Unable to fetch page (Status {response.status_code})"

#     soup = BeautifulSoup(response.text, "html.parser")

#     # Find the <p> tag with class "drug-subtitle"
#     drug_subtitle = soup.find("p", class_="drug-subtitle")
#     print(drug_subtitle)

#     if drug_subtitle:
#         active_ingredient_tag = drug_subtitle.find("a")
#         if active_ingredient_tag:
#             return active_ingredient_tag.text.strip()
#         else:
#             return "Active ingredient not found"
#     else:
#         return "Drug subtitle section not found"
# def get_active_ingredient(brand_name):
#     brand_name_formatted = brand_name.lower().replace(" ", "-")
    
#     base_urls = {
#         "drugs_com": f"https://www.drugs.com/pro/{brand_name_formatted}.html",
#         "pubchem": f"https://pubchem.ncbi.nlm.nih.gov/compound/{brand_name}",
#         "rxnorm": f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={brand_name}"
#     }
    
#     results = {}
    
#     try:
#         # Try PubChem
#         response = requests.get(base_urls["pubchem"], timeout=5)
#         if response.status_code == 200:
#             soup = BeautifulSoup(response.text, "html.parser")
#             active_ingredient = soup.find("meta", {"name": "description"})
#             if active_ingredient:
#                 results["pubchem"] = active_ingredient["content"].split(".")[0]
    
#         # Try Drugs.com
#         response = requests.get(base_urls["drugs_com"], timeout=5)
#         if response.status_code == 200:
#             soup = BeautifulSoup(response.text, "html.parser")
#             drug_subtitle = soup.find("p", class_="drug-subtitle")
#             if drug_subtitle:
#                 active_ingredient_tag = drug_subtitle.find("a")
#                 if active_ingredient_tag:
#                     results["drugs_com"] = active_ingredient_tag.text.strip()
            
#         # Try RxNorm
#         response = requests.get(base_urls["rxnorm"], timeout=5)
#         if response.status_code == 200:
#             data = response.json()
#             if "idGroup" in data and "rxnormId" in data["idGroup"]:
#                 results["rxnorm"] = data["idGroup"]["rxnormId"][0]
    
#         if results:
#             return results
#         else:
#             return {"error": "Active ingredient not found in any source."}
    
#     except Exception as e:
#         return {"error": "An error occurred while fetching data."}

# def get_active_ingredient(brand_name):
#     brand_name_formatted = brand_name.lower().replace(" ", "-")
    
#     base_urls = {
#         "drugs_com": f"https://www.drugs.com/pro/{brand_name_formatted}.html",
#         "pubchem": f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{brand_name}/JSON",
#         "rxnorm": f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={brand_name}"
#     }
    
#     results = {}
    
#     try:
#         # Try Drugs.com
#         response = requests.get(base_urls["drugs_com"], timeout=5)
#         if response.status_code == 200:
#             soup = BeautifulSoup(response.text, "html.parser")
#             drug_subtitle = soup.find("p", class_="drug-subtitle")
#             if drug_subtitle:
#                 active_ingredient_tag = drug_subtitle.find("a")
#                 if active_ingredient_tag:
#                     results = active_ingredient_tag.text.strip()
    
#         # Try PubChem API
#         response = requests.get(base_urls["pubchem"], timeout=5)
#         if response.status_code == 200:
#             data = response.json()
#             if "PC_Compounds" in data and data["PC_Compounds"]:
#                 if "props" in data["PC_Compounds"][0]:
#                     for prop in data["PC_Compounds"][0]["props"]:
#                         if "name" in prop and prop["name"].lower() == "iupac name":
#                             results = prop["value"]["sval"]
#                             break
    
#         # Try RxNorm API
#         response = requests.get(base_urls["rxnorm"], timeout=5)
#         if response.status_code == 200:
#             data = response.json()
#             if "idGroup" in data and "rxnormId" in data["idGroup"]:
#                 results = data["idGroup"]["rxnormId"][0]
    
#         if results:
#             return results
#         else:
#             return {"error": "Active ingredient not found in any source."}
    
#     except Exception as e:
#         return {"error": "An error occurred while fetching data."}

def get_active_ingredient(brand_name):
    brand_name_formatted = brand_name.lower().replace(" ", "-")
    
    base_urls = {
        "drugs_com": f"https://www.drugs.com/pro/{brand_name_formatted}.html",
        "pubchem": f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{brand_name}/JSON",
        "rxnorm": f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={brand_name}"
    }
    
    active_ingredients = []
    
    try:
        # Try Drugs.com
        response = requests.get(base_urls["drugs_com"], timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            drug_subtitle = soup.find("p", class_="drug-subtitle")
            if drug_subtitle:
                active_ingredient_tag = drug_subtitle.find("a")
                if active_ingredient_tag:
                    active_ingredients.append(active_ingredient_tag.text.strip())
    
        # Try PubChem API
        response = requests.get(base_urls["pubchem"], timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "PC_Compounds" in data and data["PC_Compounds"]:
                if "props" in data["PC_Compounds"][0]:
                    for prop in data["PC_Compounds"][0]["props"]:
                        if "name" in prop and prop["name"].lower() == "iupac name":
                            active_ingredients.append(prop["value"]["sval"])
    
        # Try RxNorm API
        response = requests.get(base_urls["rxnorm"], timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "idGroup" in data and "rxnormId" in data["idGroup"]:
                for rxcui in data["idGroup"]["rxnormId"]:
                    # Fetch ingredient name using RxCUI
                    rxnorm_response = requests.get(f"https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/properties.json", timeout=5)
                    if rxnorm_response.status_code == 200:
                        rxnorm_data = rxnorm_response.json()
                        if "properties" in rxnorm_data and "name" in rxnorm_data["properties"]:
                            active_ingredients.append(rxnorm_data["properties"]["name"])
    
        if active_ingredients:
            return active_ingredients
        else:
            return "Active ingredient not found in any source."
    
    except Exception as e:
        return "An error occurred while fetching data."

# *********************************************
def get_cid_from_pubchem(drug_name):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{drug_name}/cids/JSON"
    response = requests.get(url)

    if response.status_code == 200:
        try:
            data = response.json()
            return data["IdentifierList"]["CID"][0]  # Get the first CID
        except (KeyError, IndexError):
            return None
    return None