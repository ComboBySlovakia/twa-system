import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ZakazkaCard from "./ZakazkaCard";
import ZakazkaAddModal from "./ZakazkaAddModal";
import ZakazkaDeleteModal from "./ZakazkaDeleteModal";
import ZakazkaTable from "./ZakazkaTable";
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';


function ZakazkaMain (){

    const [isTableView, setIsTableView] = useState(false);
    const [zakazky, setZakazky] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const onUpdateZakazky = async (updatedZakazka) => {
        console.log("Aktualizujem zákazku:", updatedZakazka);  // Debugging

        // Voláme backend na uloženie zmeny
        const response = await fetch('/zakazka/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedZakazka)
        });

        if (!response.ok) {
            console.error("Chyba pri ukladaní zákazky.");
            return;
        }

        // Po úspešnej aktualizácii zavoláme API na získanie všetkých zákaziek
        const updatedZakazkyResponse = await fetch('/zakazky/list');
        if (!updatedZakazkyResponse.ok) {
            console.error("Chyba pri získavaní zákaziek.");
            return;
        }

        const updatedZakazky = await updatedZakazkyResponse.json();

        // Použijeme callback na správne nastavenie nových zákaziek
        setZakazky((prevZakazky) => {
            // Nahradíme starú zákazku tou aktualizovanou
            return prevZakazky.map((zakazka) =>
                zakazka.contractId === updatedZakazka.contractId ? updatedZakazka : zakazka
            );
        });

        console.log("Nový stav zákaziek:", updatedZakazky); // Debugging
    };






    useEffect(() => {
        fetch('http://localhost:3000/zakazky/list', {
            method: 'GET',
        })
            .then((response) => {
                console.log("Dostal som odpoveď z backendu:", response);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((zakazky) => {
                console.log("Response JSON:", zakazky);

                setZakazky(zakazky);
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

            <div style={{
                marginTop: '25px',
                marginLeft: '15px'
            }}>
                <Button variant="primary" onClick={handleShow}>
                    Vytvor zakazku
                </Button>

                <Button variant="secondary" onClick={toggleView} style={{marginLeft: 10}}>
                    {isTableView ? 'Zobraziť ako karty' : 'Zobraziť ako tabuľku'}
                </Button>

                <ZakazkaAddModal show={showAddModal} handleClose={handleClose} setZakazky={setZakazky} />

            </div>

            {isTableView ? (
                <ZakazkaTable zakazky={zakazky} setZakazky={setZakazky} onUpdateZakazky={onUpdateZakazky}/>
            ) : (

                <Row xs={1} md={2} className="g-4">
                    {zakazky.map((zakazka, index) => (
                        <ZakazkaCard
                            key={index}
                            zakazka={zakazka}
                        />
                    ))}
                </Row>

            )}

        </div>

    );


}

export  default ZakazkaMain;