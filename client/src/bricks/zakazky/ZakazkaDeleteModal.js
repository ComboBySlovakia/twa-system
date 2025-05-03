import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

function ZakazkaDeleteModal({ show, handleClose, contractToDelete, setContracts }) {
    const handleDelete = () => {
        fetch(`http://localhost:3000/contract/${contractToDelete.contractId}`, {
            method: 'DELETE'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to delete contract");
                }
                setContracts((prevContracts) =>
                    prevContracts.filter((c) => c.contractId !== contractToDelete.contractId)
                );
                handleClose();
            })
            .catch((error) => {
                console.error("Delete error:", error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Potvrdiť zmazanie</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Naozaj chceš zmazať zákazku s ID: <strong>{contractToDelete?.contractId}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zrušiť
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Zmazať
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ZakazkaDeleteModal;
