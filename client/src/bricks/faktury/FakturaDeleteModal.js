import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

function FakturaDeleteModal({ show, handleClose, fakturaToDelete, setFaktury }) {
    const handleDelete = () => {
        fetch("/faktura/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ invoiceId: fakturaToDelete.invoiceId })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Nepodarilo sa vymazať faktúru.");
                }
                setFaktury((prevFaktury) =>
                    prevFaktury.filter((f) => f.invoiceId !== fakturaToDelete.invoiceId)
                );
                handleClose();
            })
            .catch((error) => {
                console.error("Chyba pri mazaní:", error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Potvrdiť zmazanie</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Naozaj chceš zmazať faktúru s ID:{" "}
                <strong>{fakturaToDelete?.invoiceId}</strong>?
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

export default FakturaDeleteModal;
