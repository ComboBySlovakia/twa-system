import { useState } from "react";
import { Card, Button, Modal, Form, Alert } from "react-bootstrap";
import FakturaDeleteModal from "./FakturaDeleteModal";
import { Icon } from "@mdi/react";
import { mdiCashMultiple, mdiCalendar, mdiCheckBold, mdiCancel } from "@mdi/js";

function FakturaCard({ faktury, setFaktury, onUpdateFaktury }) {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFaktura, setSelectedFaktura] = useState(null);
    const [editableFaktura, setEditableFaktura] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fakturaToDelete, setFakturaToDelete] = useState(null);

    const statusIcon = {
        completed: mdiCheckBold,
        cancelled: mdiCancel
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

    const formatForInput = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
    };

    const handleShowDetailModal = (faktura, edit = false) => {
        setSelectedFaktura(faktura);
        setEditableFaktura({ ...faktura });
        setEditMode(edit);
        setSaveError(null);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editableFaktura)
            });

            if (!response.ok) throw new Error("Chyba pri ukladaní údajov.");

            onUpdateFaktury(editableFaktura);

            const updatedResponse = await fetch("/faktury/list");
            if (!updatedResponse.ok) throw new Error("Chyba pri získavaní faktúr.");

            const updatedFaktury = await updatedResponse.json();
            setFaktury(updatedFaktury);
            handleCloseDetailModal();
        } catch (error) {
            setSaveError(error.message);
        }
    };

    const handleShowDeleteModal = (faktura) => {
        setFakturaToDelete(faktura);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setFakturaToDelete(null);
        setShowDeleteModal(false);
    };

    return (
        <>
            <div className="d-flex flex-wrap gap-3">
                {faktury.map((faktura) => (
                    <Card key={faktura.invoiceId} style={{ width: "18rem" }}>
                        <Card.Body>
                            <Card.Title>Faktúra #{faktura.invoiceId}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                {faktura.clientName}
                            </Card.Subtitle>
                            <Card.Text>
                                <strong>Celková suma:</strong> {faktura.amount} € <br />
                                <strong>Dátum vystavenia:</strong> {formatDate(faktura.issueDate)} <br />
                                <strong>Splatnosť:</strong> {formatDate(faktura.dueDate)} <br />
                                <strong>Status:</strong>{" "}
                                <Icon path={statusIcon[faktura.status]} size={1} /> {faktura.status}
                            </Card.Text>
                            <Button variant="info" onClick={() => handleShowDetailModal(faktura, false)}>
                                Detail
                            </Button>{" "}
                            <Button variant="warning" onClick={() => handleShowDetailModal(faktura, true)}>
                                Upraviť
                            </Button>{" "}
                            <Button variant="outline-danger" onClick={() => handleShowDeleteModal(faktura)}>
                                Zmazať
                            </Button>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {/* Modal Detail/Edit */}
            <Modal show={showDetailModal} onHide={handleCloseDetailModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Úprava faktúry" : "Detail faktúry"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editableFaktura && (
                        <Form>
                            <Form.Group>
                                <Form.Label>Klient</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editableFaktura.clientName}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("clientName", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={editableFaktura.clientEmail}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("clientEmail", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Dátum vystavenia</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formatForInput(editableFaktura.issueDate)}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("issueDate", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Splatnosť</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formatForInput(editableFaktura.dueDate)}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("dueDate", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Celková suma (€)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editableFaktura.amount}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("amount", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={editableFaktura.status}
                                    disabled={!editMode}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                >
                                    <option value="completed">Zaplatená</option>
                                    <option value="cancelled">Zrušená</option>
                                </Form.Select>
                            </Form.Group>

                            {saveError && <Alert variant="danger" className="mt-3">{saveError}</Alert>}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>Zatvoriť</Button>
                    {editMode && <Button variant="primary" onClick={handleSaveChanges}>Uložiť zmeny</Button>}
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <FakturaDeleteModal
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                fakturaToDelete={fakturaToDelete}
                setFaktury={setFaktury}
            />
        </>
    );
}

export default FakturaCard;
