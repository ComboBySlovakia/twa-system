import { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
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

function ZakazkaCard({ zakazka, onShowDeleteModal }) {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedZakazka, setSelectedZakazka] = useState(null);

    const handleShowDetailModal = (zakazka) => {
        setSelectedZakazka(zakazka);  // Uložíme vybranú zakázku do state
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedZakazka(null);
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

    return (
        <div>
            {/* Pridáme podmienku, aby sme sa uistili, že zakazka je pole */}
            {Array.isArray(zakazka) && zakazka.map((zakazky) => (
                <Card style={{ width: '20rem', margin: "30px" }} key={zakazky.contractId}>
                    <Card.Body>
                        <Card.Title>
                            <Icon path={mdiFileDocumentOutline} size={1.5} /> {zakazky.contractId}
                        </Card.Title>
                        <Card.Text>
                            <Icon path={mdiAccountOutline} size={1} /> {zakazky.clientName} <br />
                            <Icon path={mdiEmailOutline} size={1} /> {zakazky.clientEmail} <br />
                            <Icon path={mdiCalendar} size={1} /> {formatDate(zakazky.contractDate)} <br />
                            <Icon path={mdiCalendarClock} size={1} /> {formatDate(zakazky.deadline)} <br />
                            <Icon path={mdiCashMultiple} size={1} /> {zakazky.budget} € <br />
                            <Icon path={mdiProgressClock} size={1} /> {zakazky.progress}% <br />
                            <Icon path={statusIcon[zakazky.status]} size={1} /> {zakazky.status}
                        </Card.Text>
                        <Button variant="dark" onClick={() => handleShowDetailModal(zakazky)} style={{ marginBottom: "10px" }}>
                            Detail
                        </Button>
                        <Card.Footer>
                            {zakazky.tasks.length} úloh
                        </Card.Footer>
                    </Card.Body>
                    <Card.Text className="text-center">
                        <Button variant="outline-danger" onClick={() => onShowDeleteModal(zakazky)}>
                            Delete
                        </Button>
                    </Card.Text>

                    {/* Modal pre detaily zákazky */}
                    <Modal show={showDetailModal} onHide={handleCloseDetailModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Detail zákazky</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedZakazka && (
                                <>
                                    <p><strong>ID:</strong> {selectedZakazka.contractId}</p>
                                    <p><strong>Klient:</strong> {selectedZakazka.clientName}</p>
                                    <p><strong>Email:</strong> {selectedZakazka.clientEmail}</p>
                                    <p><strong>Dátum kontraktu:</strong> {formatDate(selectedZakazka.contractDate)}</p>
                                    <p><strong>Deadline:</strong> {formatDate(selectedZakazka.deadline)}</p>
                                    <p><strong>Rozpočet:</strong> {selectedZakazka.budget} €</p>
                                    <p><strong>Progres:</strong> {selectedZakazka.progress}%</p>
                                    <p><strong>Status:</strong> {selectedZakazka.status}</p>
                                    <hr />
                                    <h6>Úlohy:</h6>
                                    {selectedZakazka.tasks.map((task, index) => (
                                        <div key={task.taskId}>
                                            <strong>Úloha {index + 1}:</strong> {task.description}<br />
                                            <em>Priradené:</em> {task.assignedTo}, <em>Status:</em> {task.status}
                                            <hr />
                                        </div>
                                    ))}
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDetailModal}>
                                Zatvoriť
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Card>
            ))}
        </div>
    );
}

export default ZakazkaCard;
