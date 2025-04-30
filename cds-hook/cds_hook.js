// Import the required modules
const express = require("express")
const bodyparser = require("body-parser")
const cors = require("cors")

// Define the port number for the server
const PORT = 3003;

// Create an instance of an Express application
const app = express();

// Enable CORS for all incoming requests
app.use(cors());

// Set custom headers for CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'); // Allowed HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
    next(); // Proceed to the next middleware
});

// Use body-parser middleware to parse incoming JSON payloads
app.use(bodyparser.json());

// Define a simple test route to check if the server is up
app.get('/', (req, res) => {
    res.send("Salam world");
});

// Define the /cds-services GET endpoint to expose CDS service definitions
app.get('/cds-services', (req, res) => {
    res.json({
        "services": [
            {
                // First CDS service for patient-view hook
                "hook": "patient-view",
                "title": "testing CDS service",
                "description": "second time testing out the cds hook on sandbox",
                "id": "patient-greeter-ibia",
                "prefetch": {
                    // Prefetch patient resource based on patientId from context
                    "patienttogreet": "Patient/{{context.patientId}}"
                }
            },
            {
                // Second CDS service for order-select hook
                "hook": "order-select",
                "title": "selected medication",
                "description": "get the medication details",
                "id": "recent_med",
                "prefetch": {
                    // Prefetch all MedicationRequests for the patient
                    "medications": "MedicationRequest?patient={{context.patientId}}"
                }
            }
        ]
    });
});

// Define a POST route for the patient-greeter CDS service
app.post('/cds-services/patient-greeter-ibia', (req, res) => {
    const body = req.body; // Access the request body
    const patient = body.prefetch.patienttogreet; // Prefetched patient data
    const my_medication = body.prefetch.medications; // Prefetched medication data (unused here)
    const med_name = my_medication; // Alias (currently unused)
    
    // Extract patient's first name from the FHIR structure
    const name = patient?.name?.[0]?.given?.[0];

    // Prepare a static greeting message (can be personalized with `name` if needed)
    const message = `Salam, this is a Medication Reconciliation App!`;

    // Return a CDS Hooks-compliant response with a card
    res.json({
        "cards": [
            {
                "summary": message, // Summary text shown to the user
                "indicator": "info", // Severity indicator: info/warning/hard-stop
                "details": message, // Full message shown on expansion
                "source": {
                    "label": "Medication Reconciliation",
                    "url": "http://localhost:3000/",
                    "icon": "https://graphicsfamily.com/wp-content/uploads/edd/2020/05/Free-PSD-Graphic-Design-Logo-Template-1536x863.jpg"
                },
                "links": [
                    {
                        label: 'my app',
                        url: 'http://localhost:3000/', // Link to SMART app
                        type: 'smart'
                    }
                ]
            }
        ]
    });
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`server running on localhost:${PORT}`);
});
