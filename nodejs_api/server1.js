const express = require('express');
const axios = require('axios'); // For making HTTP requests
const app = express();
const cors = require("cors")
const port = 3001; // Or any port you prefer

// Middleware to parse JSON request bodies
app.use(express.json());
app.use((req,res,next)=>{
    res.header('Access-control-allow-origin','*'),
    res.header('Access-control-allow-methods', 'PUT',"GET","POST","DELETE","OPTIONS"),
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

app.use(cors());

async function sendMedicationRequest(medications) {
    const url = "http://127.0.0.1:8000/predict_smiles"; // Server1's endpoint
    const url2 = "http://127.0.0.1:3000/api/receive_medications";
    const data = { medications: medications };
    const headers = { 'Content-Type': 'application/json' };    

    try {
        const response1 = await axios.post(url, data, { headers: headers }); // Await the promise
        console.log('Request to server2 successful!');
        console.log('Server2 Response:', response1.data);
        // const response2 = await axios.post(url2, response1.data, { headers });
        // console.log('Request to Server2 successful!', response2.data);
        
    } catch (error) {
        console.error('Error sending request to server2:', error);
        if (error.response) {
            console.error("Server2 error response: ", error.response.data)
        }
    }
}
// ******************comment the above code after checking ****************
app.get('/receive-medications',(req,res)=>{
    res.send("I am up and running")
    console.log("I am up and running")
})
app.post('/receive-medications', async (req, res) => {
    console.log("where are you server1.js")
    try {
        console.log('Received data from Server1 (3000):', req.body);
        
        // Forward data to Server3 (8000)
        const response = await axios.post('http://127.0.0.1:8000/predict_smiles', req.body, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Response from python Server (8000):', response.data);
        
        // Send response back to Server1 (3000)
        res.json(response.data);
    } catch (error) {
        console.error('Error in middleware (3001):', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, async () => {
    console.log(`Server1 listening at http://localhost:${port}`);
    // const medicationList = [
    //     'Jolivette 28 Day Pack',
    //     '60 ACTUAT Fluticasone propionate 0.25 MG/ACTUAT / salmeterol 0.05 MG/ACTUAT Dry Powder Inhaler',
    //     'Acetaminophen 300 MG / Hydrocodone Bitartrate 5 MG Oral Tablet',
    //     'lisinopril 10 MG Oral Tablet',
    //     '72 HR Fentanyl 0.025 MG/HR Transdermal System',
    //     'albuterol 5 MG/ML Inhalation Solution',
    //     'Abuse-Deterrent 12 HR Oxycodone Hydrochloride 10 MG Extended Release Oral Tablet [Oxycontin]'
    //   ];  // Define medicationList here
    // await sendMedicationRequest(medicationList);  // Immediately call sendMedicationRequest on startup
});