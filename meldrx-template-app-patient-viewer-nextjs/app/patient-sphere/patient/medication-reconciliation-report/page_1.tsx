"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import * as r4 from "fhir/r4";
import { Card, Container, Grid, LoadingOverlay, Title, Text } from "@mantine/core";
import Head from "next/head";
import { AppContext } from "@/lib/hooks/AppContext/AppContext";
import MedicationRequestView from "@/lib/components/fhir/MedicationRequestView";
// import AllergyIntoleranceReactionView from "@/lib/components/fhir/AllergyIntoleranceReactionView";

export interface IPageProps { }
export default function Page(props: IPageProps) {
    const appContext = useContext(AppContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [medications, setMedications] = useState<r4.MedicationRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        
        const fetchActiveMedications = async () => {
            if (!appContext.accessToken) { return; }
            if (!appContext.fhirClient) { return; }
            const patientId = appContext.patientFhirId;
            try {
              const response = await appContext.fhirClient.request(
                `MedicationRequest?patient=${patientId}&status=active,on-hold`,
                { flat: true });
      
              const activeMeds = response?.entry?.map(
                (entry: any) => entry.resource?.medicationCodeableConcept?.coding?.[0]?.display
              ).filter(Boolean) || [];
      
              setMedications(activeMeds);
            } catch (err) {
              setError("Failed to fetch medications.");
              console.error("Error fetching active medications:", err);
            } finally {
              setIsLoading(false);
            }
          };
      
          fetchActiveMedications();
               
        }, [setIsLoading, setMedications, appContext]);

    return (
        <Container fluid={true}>
            <Head><title>Medication Reconciliation Report</title></Head>
            <LoadingOverlay visible={isLoading} />
            <Title>Medication Reconciliation</Title>

            {!isLoading && medications.length > 0 ?
            <Grid>
            {

                // {medications.length > 0 ? (
                //     medications.map((med, index) => <li key={index}>{med}</li>)
                // ) : (<p>No active medications found.</p>)


                medications.map((med, idx) => {
                    return (
                        <Grid.Col md={4} key={"Medication_" + idx.toString()}>
                            <Card className="border">
                                <div>
                                    <MedicationRequestView medicationRequest={med} />
                                    {/* {allergy.reaction ? allergy.reaction.map((reaction: any, idx: number) => {
                                        return <AllergyIntoleranceReactionView reaction={reaction} key={`AllergyIntoleranceReaction_${idx}`} />
                                    }) : (<p>No active medications found.</p>)} */}
                                </div>
                            </Card>
                        </Grid.Col>
                    );
                })
            }
            </Grid> : <Text>No active medications found</Text>}
        </Container>
    );
}