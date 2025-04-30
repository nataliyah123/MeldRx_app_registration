// Import React library for building the component
import React from "react";

// Import the FHIR R4 MedicationRequest type
import { MedicationRequest } from "fhir/r4";

// Import a child component for rendering CodeableConcept data
import CodeableConceptView from "./CodeableConceptView";

// Define the expected props type for the MedicationRequestView component
export interface IMedicationRequestViewProps { 
  medicationRequest?: MedicationRequest; 
}

// Define the MedicationRequestView functional component
const MedicationRequestView: React.FC<IMedicationRequestViewProps> = (props) => {

    // If medicationRequest is not provided, render an empty <div>
    if (!props.medicationRequest) { return <div />; }

    // If medicationCodeableConcept is missing in the medicationRequest, render an empty <div>
    if (!props.medicationRequest.medicationCodeableConcept) { return <div />; }

    // Render the component UI
    return (
        <div className="MedicationRequestView_container">
            <div>
                {/* Display the medication name/code using CodeableConceptView component */}
                <div className="MedicationRequestView_medication">
                    <CodeableConceptView codeableConcept={props.medicationRequest.medicationCodeableConcept} />
                </div>

                {/* Display the status of the medication request */}
                <p className="MedicationRequestView_status">
                    Status: {props.medicationRequest.status}
                </p>

                {/* If authoredOn is available, display the formatted date */}
                {
                    props.medicationRequest.authoredOn && (
                        <p className="MedicationRequestView_authoredOn">
                            Requested On: {new Date(props.medicationRequest.authoredOn).toLocaleDateString()}
                        </p>
                    )
                }
            </div>
        </div>
    );
}

// Export the component for use in other parts of the app
export default MedicationRequestView;
