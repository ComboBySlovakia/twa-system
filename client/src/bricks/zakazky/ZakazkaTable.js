import { useState } from "react";
import Table from "react-bootstrap/Table";
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

function ZakazkaTable({ zakazky, onShowDeleteModal }) {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedZakazka, setSelectedZakazka] = useState(null);

    const handleShowDetailModal = (zakazka) => {
        setSelectedZakazka(zakazka);
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
                    <tr key={zakazka.contractId}>
                        <td>{zakazka.contractId}</td>
                        <td>{zakazka.clientName}</td>
                        <td>{zakazka.clientEmail}</td>
                        <td>{formatDate(zakazka.contractDate)}</td>
                        <td>{formatDate(zakazka.deadline)}</td>
                        <td>{zakazka.budget} €</td>
                        <td>{zakazka.progress}%</td>
                        <td>
                            <Icon
                                path={statusIcon[zakazka.status]}
                                size={1}
                            /> {zakazka.status}
                        </td>
                        <td>{zakazka.tasks.length}</td>
                        <td>
                            <Button
                                variant="dark"
                                onClick={() => handleShowDetailModal(zakazka)}
                            >
                                Detail
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={() => onShowDeleteModal(zakazka)}
                                style={{ marginLeft: "10px" }}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

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
        </>
    );
}

export default ZakazkaTable;
