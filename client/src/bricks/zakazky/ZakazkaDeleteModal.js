import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

function ZakazkaDeleteModal({ show, handleClose, zakazkaToDelete, setZakazky }) {
    const handleDelete = () => {
        fetch("/zakazka/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contractId: zakazkaToDelete.contractId })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Nepodarilo sa vymazať zákazku.");
                }
                setZakazky((prevZakazky) =>
                    prevZakazky.filter((z) => z.contractId !== zakazkaToDelete.contractId)
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
                Naozaj chceš zmazať zákazku s ID:{" "}
                <strong>{zakazkaToDelete?.contractId}</strong>?
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
