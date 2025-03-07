"use client";

import React, { useState, useEffect, useContext } from "react";
import * as r4 from "fhir/r4";
import { Card, Container, Grid, LoadingOverlay, Title, Text,Badge } from "@mantine/core";
import Head from "next/head";
import { AppContext } from "@/lib/hooks/AppContext/AppContext";
import MedicationRequestView from "@/lib/components/fhir/MedicationRequestView";

export interface IPageProps {}

export default function Page(props: IPageProps) {
    const appContext = useContext(AppContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [medications, setMedications] = useState<r4.MedicationRequest[]>([]);
    const [predictions, setPredictions] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActiveMedications = async () => {
            if (!appContext.accessToken || !appContext.fhirClient) return;

            setIsLoading(true);
            const patientId = appContext.patientFhirId;

            try {
                const response = await appContext.fhirClient.request(
                    `MedicationRequest?patient=${patientId}&status=active,on-hold`,
                    { flat: true }
                );
                console.log("I ran ibia 2 attempt", response)
                // const activeMeds = response?.map(
                //  (entry) => entry.resource?.medicationCodeableConcept?.coding?.[0]?.display
                // ).filter(Boolean) || [];
                const activeMeds = response?.map(
                    (entry) => entry.medicationCodeableConcept?.text
                ).filter(Boolean) || [];
                console.log("I ran too 2", activeMeds)
                setMedications(activeMeds);

                if (activeMeds.length > 0) {
                    // Send medications to Node.js API for prediction
                    // const predictResponse = await fetch("http://localhost:3001/predict-medications", {
                    const predictResponse = await fetch("http://localhost:3001/receive-medications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ medications: activeMeds }),
                    });

                    const predictData = await predictResponse.json();
                    setPredictions(prev => ({ ...prev, ...predictData.predictions }));
                }

            } catch (err) {
                setError("Failed to fetch medications ibia.");
                console.error("Error fetching medications ibia:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveMedications();
    }, [appContext.accessToken, appContext.fhirClient, appContext.patientFhirId]);

    return (
        <Container fluid={true}>
            <Head><title>Medication Reconciliation Report</title></Head>
            <LoadingOverlay visible={isLoading} />
            <Title>Medication Reconciliation Report</Title>            
            {error && <Text color="red">{error}</Text>}
            <Badge
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        borderRadius: '25px', // Elongated oval shape
                                        backgroundColor: '#ADD8E6', // Light blue background
                                        color: 'black', // Or a color that contrasts well with light blue
                                        padding: '5px 15px', // Adjust padding as needed
                                        margin: '10px auto', // Center horizontally
                                        width: '80%', // Adjust width as needed
                                        fontSize: '1em', // Set font-size for em based relative scaling
                                        lineHeight: '1.2', // improve line spacing
                                        height: 'auto'

                                    }}
            >
                                    Predicted Single Drug Side Effects class on Human Body
            </Badge>

            {!isLoading && medications.length > 0 ? (
                
            <Grid>
                {medications.map((med, idx) => (
                    <Grid.Col md={4} key={`Medication_${idx}`}>
                            <Card className="border">
                                <div>
                                    <MedicationRequestView medicationRequest={med} />                                
                                    <Text>
                                        <strong>{ med }</strong>
                                        {predictions && predictions[med] ? (
                                            Object.entries(predictions[med]).filter(([key, value]) => value === 1).length > 0 ? (  // Check if there are ANY predicted side effects
                                                <ul>
                                                    {Object.entries(predictions[med])
                                                        .filter(([key, value]) => value === 1)
                                                        .map(([key, value]) => (
                                                            <li key={key}>
                                                                {key}
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                "No side effects predicted"  // Show this if all values are 0
                                            )
                                        ) : (
                                            "Pending"  // Still show "Pending" if no prediction exists for the medication
                                        )}
                                    </Text>
                                </div>
                            </Card>
                        </Grid.Col>
                        ))}
            </Grid>
            ) : (
                <Text>No active medications found</Text>
            )}
            <Badge
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        borderRadius: '25px', // Elongated oval shape
                                        backgroundColor: '#ADD8E6', // Light blue background
                                        color: 'black', // Or a color that contrasts well with light blue
                                        padding: '5px 15px', // Adjust padding as needed
                                        margin: '10px auto', // Center horizontally
                                        width: '80%', // Adjust width as needed
                                        fontSize: '1em', // Set font-size for em based relative scaling
                                        lineHeight: '1.2', // improve line spacing
                                        height: 'auto'

                                    }}
            >
                                    Drug Similarity Result
            </Badge>
        </Container>
    );
}
