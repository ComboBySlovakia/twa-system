import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { Icon } from "@mdi/react";
import {
    mdiFileDocumentOutline,
    mdiCashMultiple,
    mdiCalendarClock,
    mdiCheckBold,
    mdiCancel
} from "@mdi/js";

function FakturaTable({ faktury, setFaktury, onUpdateFaktury }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedFaktura, setSelectedFaktura] = useState(null);
    const [editableFaktura, setEditableFaktura] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const handleShowModal = (faktura, isEdit = false) => {
        setSelectedFaktura(faktura);
        setEditableFaktura({ ...faktura });
        setEditMode(isEdit);
        setSaveError(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFaktura(null);
        setEditableFaktura(null);
        setEditMode(false);
        setSaveError(null);
    };

    const handleChange = (field, value) => {
        setEditableFaktura((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch("/faktura/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editableFaktura)
            });

            if (!response.ok) {
                throw new Error("Chyba pri ukladaní faktúry.");
            }

            onUpdateFaktury(editableFaktura);

            const res = await fetch("/faktury/list");
            if (!res.ok) {
                throw new Error("Nepodarilo sa načítať faktúry.");
            }

            const data = await res.json();
            setFaktury(data);
            handleCloseModal();
        } catch (err) {
            setSaveError(err.message);
        }
    };

    const statusIcon = {
        paid: mdiCheckBold,
        unpaid: mdiCancel
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

    const formatForInput = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
    };

    return (
        <>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Číslo faktúry</th>
                    <th>Klient</th>
                    <th>Dátum vystavenia</th>
                    <th>Splatnosť</th>
                    <th>Suma (€)</th>
                    <th>Status</th>
                    <th>Akcie</th>
                </tr>
                </thead>
                <tbody>
                {faktury.map((faktura) => (
                    <tr key={faktura.fakturaId}>
                        <td>{faktura.fakturaId}</td>
                        <td>{faktura.fakturaCislo}</td>
                        <td>{faktura.klient}</td>
                        <td>{formatDate(faktura.datumVystavenia)}</td>
                        <td>{formatDate(faktura.splatnost)}</td>
                        <td>{faktura.suma} €</td>
                        <td>
                            <Icon path={statusIcon[faktura.status]} size={1} /> {faktura.status}
                        </td>
                        <td>
                            <Button
                                variant="info"
                                onClick={() => handleShowModal(faktura, false)}
                            >
                                Detail
                            </Button>
                            <Button
                                variant="warning"
                                onClick={() => handleShowModal(faktura, true)}
                                style={{ marginLeft: 10 }}
                            >
                                Upraviť
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Úprava faktúry" : "Detail faktúry"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editableFaktura && (
                        <Form>
                            <Form.Group>
                                <Form.Label>Číslo faktúry</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editableFaktura.fakturaCislo}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("fakturaCislo", e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Klient</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editableFaktura.klient}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("klient", e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Dátum vystavenia</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formatForInput(editableFaktura.datumVystavenia)}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("datumVystavenia", e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Splatnosť</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formatForInput(editableFaktura.splatnost)}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("splatnost", e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Suma (€)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editableFaktura.suma}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("suma", e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={editableFaktura.status}
                                    disabled={!editMode}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                >
                                    <option value="unpaid">Nezaplatená</option>
                                    <option value="paid">Zaplatená</option>
                                </Form.Select>
                            </Form.Group>
                            {saveError && <Alert variant="danger" className="mt-3">{saveError}</Alert>}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Zatvoriť</Button>
                    {editMode && (
                        <Button variant="primary" onClick={handleSaveChanges}>
                            Uložiť zmeny
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default FakturaTable;
