"use client";

import React, { useState, useEffect, useContext } from "react";
import * as r4 from "fhir/r4";
import { Card, Container, Grid, LoadingOverlay, Title, Text } from "@mantine/core";
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

                const activeMeds = response?.entry?.map(
                    (entry) => entry.resource?.medicationCodeableConcept?.coding?.[0]?.display
                ).filter(Boolean) || [];

                setMedications(activeMeds);

                if (activeMeds.length > 0) {
                    // Send medications to Node.js API for prediction
                    const predictResponse = await fetch("http://localhost:3001/predict-medications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ medications: activeMeds }),
                    });

                    const predictData = await predictResponse.json();
                    setPredictions(predictData.predictions);
                }

            } catch (err) {
                setError("Failed to fetch medications.");
                console.error("Error fetching medications:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveMedications();
    }, [appContext]);

    return (
        <Container fluid={true}>
            <Head><title>Medication Reconciliation Report</title></Head>
            <LoadingOverlay visible={isLoading} />
            <Title>Medication Reconciliation</Title>

            {error && <Text color="red">{error}</Text>}

            {!isLoading && medications.length > 0 ? (
                <Grid>
                    {medications.map((med, idx) => (
                        <Grid.Col md={4} key={`Medication_${idx}`}>
                            <Card className="border">
                                <div>
                                    <MedicationRequestView medicationRequest={med} />
                                    <Text><strong>Risk Prediction:</strong> {predictions[med] || "Pending"}</Text>
                                </div>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            ) : (
                <Text>No active medications found</Text>
            )}
        </Container>
    );
}
