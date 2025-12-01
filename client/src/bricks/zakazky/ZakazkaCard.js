import { useState } from "react";
import Card from "react-bootstrap/Card";
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

function ZakazkaCard({ zakazka, zakazky, setZakazky, onUpdateZakazky }) {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editableZakazka, setEditableZakazka] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [zakazkaToDelete, setZakazkaToDelete] = useState(null);

    const handleShowDetailModal = () => {
        setEditableZakazka({ ...zakazka });
        setEditMode(false);
        setSaveError(null);
        setShowDetailModal(true);
    };

    const handleShowEditModal = () => {
        setEditableZakazka({ ...zakazka });
        setEditMode(true);
        setSaveError(null);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setEditableZakazka(null);
        setEditMode(false);
        setSaveError(null);
    };

    const handleShowDeleteModal = () => {
        setZakazkaToDelete(zakazka);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setZakazkaToDelete(null);
        setShowDeleteModal(false);
    };

    const handleChange = (field, value) => {
        setEditableZakazka((prev) => ({ ...prev, [field]: value }));
    };

    const handleTaskChange = (index, field, value) => {
        const updatedTasks = [...editableZakazka.tasks];
        updatedTasks[index] = { ...updatedTasks[index], [field]: value };
        setEditableZakazka((prev) => ({ ...prev, tasks: updatedTasks }));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch("/zakazka/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editableZakazka)
            });

            if (!response.ok) throw new Error("Chyba pri ukladaní údajov.");

            onUpdateZakazky(editableZakazka);
            const updatedListRes = await fetch("/zakazky/list");
            const updatedList = await updatedListRes.json();
            setZakazky(updatedList);

            handleCloseDetailModal();
        } catch (err) {
            setSaveError(err.message);
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
        <div className="card-container">
            <Card style={{ width: '20rem', margin: "30px" }}>
                <Card.Body>
                    <Card.Title>
                        <Icon path={mdiFileDocumentOutline} size={1.5} /> {zakazka.contractId}
                    </Card.Title>
                    <Card.Text>
                        <Icon path={mdiAccountOutline} size={1} /> {zakazka.clientName} <br />
                        <Icon path={mdiEmailOutline} size={1} /> {zakazka.clientEmail} <br />
                        <Icon path={mdiCalendar} size={1} /> {formatDate(zakazka.contractDate)} <br />
                        <Icon path={mdiCalendarClock} size={1} /> {formatDate(zakazka.deadline)} <br />
                        <Icon path={mdiCashMultiple} size={1} /> {zakazka.budget} € <br />
                        <Icon path={mdiProgressClock} size={1} /> {zakazka.progress}% <br />
                        <Icon path={statusIcon[zakazka.status]} size={1} /> {zakazka.status}
                    </Card.Text>

                    <Button variant="dark" onClick={handleShowDetailModal} className="me-2">Detail</Button>
                    <Button variant="warning" onClick={handleShowEditModal} className="me-2">Upraviť</Button>
                    <Button variant="outline-danger" onClick={handleShowDeleteModal}>Delete</Button>
                    <Card.Footer className="mt-3 text-center">{zakazka.tasks.length} úloh</Card.Footer>
                </Card.Body>
            </Card>

            {/* Modal - detail / edit */}
            <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
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
                                    value={editableZakazka.budget}
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
                                <div key={task.taskId || index}>
                                    <Form.Group>
                                        <Form.Label>ID úlohy</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={task.taskId}
                                            readOnly={!editMode}
                                            onChange={(e) => handleTaskChange(index, "taskId", e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Názov</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={task.name}
                                            readOnly={!editMode}
                                            onChange={(e) => handleTaskChange(index, "name", e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Popis</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={task.description}
                                            readOnly={!editMode}
                                            onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            value={task.status}
                                            disabled={!editMode}
                                            onChange={(e) => handleTaskChange(index, "status", e.target.value)}
                                        >
                                            <option value="pending">Čaká</option>
                                            <option value="in-progress">Prebieha</option>
                                            <option value="completed">Hotová</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <hr />
                                </div>
                            ))}

                            {saveError && <Alert variant="danger" className="mt-2">{saveError}</Alert>}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>Zatvoriť</Button>
                    {editMode && <Button variant="primary" onClick={handleSaveChanges}>Uložiť</Button>}
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <ZakazkaDeleteModal
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                zakazkaToDelete={zakazkaToDelete}
                setZakazky={setZakazky}
            />
        </div>
    );
}

export default ZakazkaCard;
