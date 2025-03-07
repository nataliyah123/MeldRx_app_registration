import React from "react";
import { MedicationRequest } from "fhir/r4";
import CodeableConceptView from "./CodeableConceptView";

export interface IMedicationRequestViewProps { 
  medicationRequest?: MedicationRequest; 
}

const MedicationRequestView: React.FC<IMedicationRequestViewProps> = (props) => {
    if (!props.medicationRequest) { return <div />; }
    if (!props.medicationRequest.medicationCodeableConcept) { return <div />; }

    return (
        <div className="MedicationRequestView_container">
            <div>
                <div className="MedicationRequestView_medication">
                    <CodeableConceptView codeableConcept={props.medicationRequest.medicationCodeableConcept} />
                </div>
                <p className="MedicationRequestView_status">
                    Status: {props.medicationRequest.status}
                </p>
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

export default MedicationRequestView;
