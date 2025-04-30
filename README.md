# MedSideEffectPredictor

A medication side effect prediction application that uses CDS Hooks to integrate with EHR systems through the MeldRx App Platform. The application analyzes medication data using SMILES (Simplified Molecular Input Line Entry System) notation of active ingredients to predict potential side effects as part of medication reconciliation.

[![Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/0s_B9QbEtOo)

## Overview

MedSideEffectPredictor connects to Electronic Health Record (EHR) systems like Cerner and Epic using SMART on FHIR, retrieves patient medication data, and provides predictive analysis of potential side effects based on the chemical structure of medications. The prediction model is trained on the SIDER2 database for adverse drug reactions.

### Features

- Integration with EHR systems via SMART on FHIR
- CDS Hooks integration for real-time decision support
- Medication data retrieval and analysis
- Side effect prediction using molecular structure (SMILES)
- Interactive visualization of medication data
- Integration with MeldRx App Platform

### Technology Stack

- **Frontend**: Next.js, React
- **Backend**: 
  - Node.js/Express
  - FastAPI (Python)
  - CDS Hooks server
- **Data Processing**:
  - RDKit (chemical informatics)
  - Scikit-learn, NumPy (ML model)
  - Joblib (model serialization)
- **Healthcare Standards**:
  - FHIR (Fast Healthcare Interoperability Resources)
  - SMART on FHIR (FHIRclient library)
- **Data Sources**:
  - Drugs.com
  - RxNorm
  - PubChem (for SMILES notation)
  - SIDER2 database (for adverse drug effects training)
  - Synthea (for synthetic patient data generation)

## Architecture

The application consists of multiple components:
1. **Next.js Frontend**: Patient-facing application integrated with MeldRx
2. **Node.js API**: Backend server for data processing
3. **Python API**: Machine learning model for side effect prediction
4. **CDS Hooks Service**: Integration point with EHR systems

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- Docker (for containerization - coming soon)
- ngrok (for development webhook testing)

### MeldRx App Setup

Before launching the app ensure the following configuration steps have been followed:

1. **App redirect URL configuration**:
   - Go to https://app.meldrx.com
   - Navigate to `Apps` → your application
   - In the `Redirect URLs` section
   - Add the redirect URL `http://localhost:3000/login-callback` (adjust port if needed)

2. **Workspace configuration**:
   - If the workspace is `standalone`
     - Seed it with a sample patient
     - Go to https://app.meldrx.com/ccda?sample=sample1
     - Copy the CCDA XML into a new file (e.g., `ccda.xml`)
     - Go to `Workspaces` → your workspace → `Patients` → click on `Import Data`
     - Select the `ccda.xml` file

### Frontend App Setup

1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Open `.env` file
   - Replace `NEXT_PUBLIC_MELDRX_CLIENT_ID` with your MeldRx App ID (from "My Apps" page)
   - Replace `NEXT_PUBLIC_MELDRX_WORKSPACE_URL` with your Workspace URL

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Node.js API Setup

1. Navigate to the `nodejs-api` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server1.js
   ```

### Python API Setup

1. Navigate to the `github-python-api` folder
2. Set up a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the API server:
   ```bash
   python api.py
   ```

### CDS Hooks Service Setup

1. Navigate to the `cds-hook` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the CDS Hooks service:
   ```bash
   node cds_hook.js
   ```

### Ngrok Setup (for testing)

To make your local CDS Hooks service accessible:

1. Navigate to the `ngrok` folder or install ngrok globally
2. Start ngrok on port 3003:
   ```bash
   ngrok http 3003
   ```
3. Use the generated URL for CDS Hook registration

## Usage

1. Start all services as described in the setup steps
2. Go to https://app.meldrx.com/ and select your workspace
3. Click on "Manage" for your workspace
4. Scroll down to "CDS Hook Service URL" section
5. Add the ngrok generated address + `/cds-services/patient-greeter-ibia` in the field (e.g., `https://abc123.ngrok.io/cds-services/patient-greeter-ibia`)
6. Save the configuration
7. In the left sidebar, select "Patients"
8. Choose the patient whose CCDA file you added earlier
9. Once on the patient chart page, click "My App" in the information section
10. Authorize/allow the requested scopes when prompted
11. Click on the "Launch" button
12. In the left panel, click on "Medication Reconciliation Report" to see the predictions

## Project Structure

### Files I build from scratch or modified

#### Frontend (meldrx-template-app-patient-viewer-nextjs)
- `app/medication-reconciliation-report/page.tsx` - Main medication reconciliation view
- `lib/component/fhir/medication-request-view.tsx` - FHIR medication request component
- `.env` - Environment configuration
- `Dockerfile` - Container configuration
- `lib/component/shell/navbar/appnavbar.tsx` - Navigation bar component

#### Python API (python-api)
- `api.py` - FastAPI server for prediction model
- `utils.py` - Utility functions for data processing
- `models/` - Trained machine learning models
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration

#### CDS Hooks Service (cds-hooks)
- `cds-hook.js` - CDS Hooks implementation
- `Dockerfile` - Container configuration

#### Node.js API (nodejs-api)
- `server1.js` - Express API server
- `Dockerfile` - Container configuration

## Development Roadmap

- [x] Basic SMART on FHIR integration
- [x] Medication data retrieval
- [x] Side effect prediction model
- [x] CDS Hooks integration
- [ ] Add more medication reconciliation features
- [ ] Convert from FHIRclient to direct OAuth2
- [ ] Docker containerization (problem: FHIRclient spun up its own internal server)
- [ ] Comprehensive testing
- [ ] Production deployment guide

## Data Sources

- **Patient Data**: Generated using Synthea for testing purposes
- **Medication Information**: Retrieved from Drugs.com and RxNorm
- **Chemical Structures**: Obtained from PubChem (SMILES notation)
- **Side Effect Data**: SIDER2 database for model training


## Acknowledgments

- MeldRx for the app platform and integration capabilities
- SMART on FHIR community for healthcare interoperability standards