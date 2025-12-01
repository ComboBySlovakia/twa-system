import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import FakturaCard from "./FakturaCard";
import FakturaAddModal from "./FakturaAddModal";
import FakturaDeleteModal from "./FakturaDeleteModal";
import FakturaTable from "./FakturaTable";
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';

function FakturaMain () {

    const [isTableView, setIsTableView] = useState(false);
    const [faktury, setFaktury] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const onUpdateFaktury = async (updatedFaktura) => {
        console.log("Aktualizujem faktúru:", updatedFaktura);

        const response = await fetch('/faktura/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFaktura)
        });

        if (!response.ok) {
            console.error("Chyba pri ukladaní faktúry.");
            return;
        }

        const updatedFakturyResponse = await fetch('/faktury/list');
        if (!updatedFakturyResponse.ok) {
            console.error("Chyba pri získavaní faktúr.");
            return;
        }

        const updatedFaktury = await updatedFakturyResponse.json();

        setFaktury((prevFaktury) => {
            return prevFaktury.map((faktura) =>
                faktura.invoiceId === updatedFaktura.invoiceId ? updatedFaktura : faktura
            );
        });

        console.log("Nový stav faktúr:", updatedFaktury);
    };

    useEffect(() => {
        fetch('http://localhost:3000/faktury/list', {
            method: 'GET',
        })
            .then((response) => {
                console.log("Dostal som odpoveď z backendu:", response);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((faktury) => {
                console.log("Response JSON:", faktury);
                setFaktury(faktury);
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }, []);

    const handleShow = () => setShowAddModal(true);
    const handleClose = () => setShowAddModal(false);
    const toggleView = () => {
        setIsTableView(!isTableView);
    };

    return (
        <div>
            <div style={{ marginTop: '25px', marginLeft: '15px' }}>
                <Button variant="primary" onClick={handleShow}>
                    Vytvor faktúru
                </Button>

                <Button variant="secondary" onClick={toggleView} style={{ marginLeft: 10 }}>
                    {isTableView ? 'Zobraziť ako karty' : 'Zobraziť ako tabuľku'}
                </Button>

                <FakturaAddModal show={showAddModal} handleClose={handleClose} setFaktury={setFaktury} />
            </div>

            {isTableView ? (
                <FakturaTable faktury={faktury} setFaktury={setFaktury} onUpdateFaktury={onUpdateFaktury} />
            ) : (
                <Row xs={1} md={2} className="g-4">
                    {faktury.map((faktura, index) => (
                        <FakturaCard key={index} faktura={faktura} />
                    ))}
                </Row>
            )}
        </div>
    );
}

export default FakturaMain;
