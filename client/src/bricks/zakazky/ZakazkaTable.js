import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import ZakazkaDeleteModal from "./ZakazkaDeleteModal";
import { Icon } from "@mdi/react";
import {
    mdiFileDocumentOutline,
    mdiAccountOutline,
    mdiEmailOutline,
    mdiCalendar,
    mdiCalendarClock,
    mdiProgressClock,
    mdiCashMultiple,
    mdiPlayOutline,
    mdiCheckBold,
    mdiCancel,
    mdiPauseCircle
} from "@mdi/js";

function ZakazkaTable({ zakazky, setZakazky, onShowDeleteModal, onUpdateZakazky }) {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedZakazka, setSelectedZakazka] = useState(null);
    const [editableZakazka, setEditableZakazka] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [zakazkaToDelete, setZakazkaToDelete] = useState(null);


    const handleShowDetailModal = (zakazka) => {
        setSelectedZakazka(zakazka);
        setEditableZakazka({ ...zakazka });
        setEditMode(false);
        setSaveError(null);
        setShowDetailModal(true);
    };

    const handleShowEditModal = (zakazka) => {
        setSelectedZakazka(zakazka);
        setEditableZakazka({ ...zakazka });
        setEditMode(true);
        setSaveError(null);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedZakazka(null);
        setEditableZakazka(null);
        setSaveError(null);
        setEditMode(false);
    };

    const handleShowDeleteModal = (zakazka) => {
        setZakazkaToDelete(zakazka);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setZakazkaToDelete(null);
        setShowDeleteModal(false);
    };


    const handleChange = (field, value) => {
        // Aktualizuj len konkrétny field vo vybranej zakázke
        setEditableZakazka((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTaskChange = (taskIndex, field, value) => {
        // Správne aktualizuj úlohy v rámci zakázky
        setEditableZakazka((prev) => {
            const updatedTasks = [...prev.tasks];
            updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], [field]: value };
            return { ...prev, tasks: updatedTasks };
        });
    };



    const handleSaveChanges = async () => {
        try {
            const response = await fetch("/zakazka/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editableZakazka)
            });

            if (!response.ok) {
                throw new Error("Chyba pri ukladaní údajov.");
            }

            // Uloženie konkrétnej zakázky
            const updatedZakazka = await response.json();

            // Upravíme len túto zakázku v stave, nie všetky
            setZakazky((prevZakazky) =>
                prevZakazky.map((zakazka) =>
                    zakazka.contractId === updatedZakazka.contractId ? updatedZakazka : zakazka
                )
            );

            handleCloseDetailModal();
        } catch (error) {
            setSaveError(error.message);
        }
    };


    const statusIcon = {
        draft: mdiPauseCircle,
        active: mdiPlayOutline,
        completed: mdiCheckBold,
        cancelled: mdiCancel
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    const formatForInput = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
    };

    return (
        <>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Klient</th>
                    <th>Email</th>
                    <th>Dátum kontraktu</th>
                    <th>Deadline</th>
                    <th>Rozpočet</th>
                    <th>Progres</th>
                    <th>Status</th>
                    <th>Úlohy</th>
                    <th>Akcie</th>
                </tr>
                </thead>
                <tbody>
                {zakazky.map((zakazka) => (
                    <tr key={zakazka.id}>
                        <td>{zakazka.contractId}</td>
                        <td>{zakazka.clientName}</td>
                        <td>{zakazka.clientEmail}</td>
                        <td>{formatDate(zakazka.contractDate)}</td>
                        <td>{formatDate(zakazka.deadline)}</td>
                        <td>{zakazka.budget} €</td>
                        <td>{zakazka.progress}%</td>
                        <td>
                            <Icon path={statusIcon[zakazka.status]} size={1} /> {zakazka.status}
                        </td>
                        <td>{zakazka.tasks.length}</td>
                        <td>
                            <Button variant="info" onClick={() => handleShowDetailModal(zakazka)}>
                                Detail
                            </Button>
                            <Button variant="warning" onClick={() => handleShowEditModal(zakazka)} style={{ marginLeft: "10px" }}>
                                Upraviť
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={() => handleShowDeleteModal(zakazka)}
                                style={{ marginLeft: "10px" }}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Modal show={showDetailModal} onHide={handleCloseDetailModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Úprava zákazky" : "Detail zákazky"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editableZakazka && (
                        <Form>
                            <Form.Group>
                                <Form.Label>Klient</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editableZakazka.clientName}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("clientName", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={editableZakazka.clientEmail}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("clientEmail", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Dátum kontraktu</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={formatForInput(editableZakazka.contractDate)}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("contractDate", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Deadline</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={formatForInput(editableZakazka.deadline)}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("deadline", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Rozpočet (€)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editableZakazka.budget || ""}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("budget", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Progres (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editableZakazka.progress}
                                    readOnly={!editMode}
                                    onChange={(e) => handleChange("progress", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={editableZakazka.status}
                                    disabled={!editMode}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                >
                                    <option value="draft">Návrh</option>
                                    <option value="active">Aktívna</option>
                                    <option value="completed">Dokončená</option>
                                    <option value="cancelled">Zrušená</option>
                                </Form.Select>
                            </Form.Group>

                            <hr />
                            <h5>Úlohy</h5>
                            {editableZakazka.tasks.map((task, index) => (
                                <div key={index}>
                                    <Form.Group>
                                        <Form.Label>Úloha {index + 1} - ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={task.taskId}
                                            readOnly={!editMode}
                                            onChange={(e) => handleTaskChange(index, "taskId", e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Úloha {index + 1} - Názov</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={task.name}
                                            readOnly={!editMode}
                                            onChange={(e) => handleTaskChange(index, "name", e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Úloha {index + 1} - Popis</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={task.description}
                                            readOnly={!editMode}
                                            onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Úloha {index + 1} - Status</Form.Label>
                                        <Form.Select
                                            value={task.status}
                                            disabled={!editMode}
                                            onChange={(e) => handleTaskChange(index, "status", e.target.value)}
                                        >
                                            <option value="pending">Čaká na vykonanie</option>
                                            <option value="in-progress">Prebieha</option>
                                            <option value="completed">Dokončená</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <hr />
                                </div>
                            ))}

                            {saveError && <Alert variant="danger" className="mt-3">{saveError}</Alert>}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>
                        Zatvoriť
                    </Button>
                    {editMode && (
                        <Button variant="primary" onClick={handleSaveChanges}>
                            Uložiť zmeny
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            <ZakazkaDeleteModal
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                zakazkaToDelete={zakazkaToDelete}
                setZakazky={setZakazky}
            />

        </>
    );
}

export default ZakazkaTable;
