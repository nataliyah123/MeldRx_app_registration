const express = require("express")
const bodyparser = require("body-parser")
const cors = require("cors")
const PORT = 3003;
const app =  express();
app.use(cors());
app.use((req,res,next)=>{
    res.header('Access-control-allow-origin','*'),
    res.header('Access-control-allow-methods', 'PUT',"GET","POST","DELETE","OPTIONS"),
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

app.use(bodyparser.json())
// app.get('/', (req,res)=>{
//     res.send("Salam world")
// })
app.get('/cds-services',(req,res)=>{
    res.json({
        "services":[
        {
            "hook": "patient-view",
            "title": "testing CDS service",
            "description": "second time testing out the cds hook on sandbox",
            "id": "patient-greeter-ibia",
            "prefetch": {
                "patienttogreet": "Patient/{{context.patientId}}"
            }
        },
        {
            "hook": "order-select",
            "title": "selected medication",
            "description": "get the medication details",
            "id": "recent_med",
            "prefetch": {
                "medications": "MedicationRequest?patient={{context.patientId}}"
            }
        }
        ]    
    })
})

app.post('/cds-services/patient-greeter-ibia',(req,res)=>{
    const body = req.body;
    const patient = body.prefetch.patienttogreet
    const my_medication = body.prefetch.medications
    const med_name = my_medication
    const name = patient?.name?.[0]?.given?.[0]
    const message = `Salam, this is a Medication Reconciliation App!`
    res.json({
        "cards":[
            {
                "summary":message,
                "indicator": "info",
                "details": message,
                "source":{
                    "label": "Medication Reconciliation",
                    "url":"http://localhost:3000 ",
                    "icon":"https://graphicsfamily.com/wp-content/uploads/edd/2020/05/Free-PSD-Graphic-Design-Logo-Template-1536x863.jpg"
                }

            },
            
        ]
    })
})
app.listen(PORT , ()=> {console.log(`server running on localhost:${PORT}`)})
