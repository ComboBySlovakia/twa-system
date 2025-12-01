import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function FakturaAddModal({ show, handleClose, setFaktury, zakazky = [] }) {
    // Stav pre faktúru
    const [newFaktura, setNewFaktura] = useState({
        invoiceId: "",
        issueDate: "",
        dueDate: "",
        clientName: "",
        clientEmail: "",
        items: [],
        totalAmount: 0,
        paymentStatus: "pending",
        notes: "",
        contractId: "", // Pre priradenie faktúry k zakázke
    });

    // Stav pre novú položku faktúry
    const [newItemForm, setNewItemForm] = useState({
        itemId: "",
        description: "",
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
    });

    // Pridať položku do faktúry
    const addItem = () => {
        if (!newItemForm.itemId || !newItemForm.description || newItemForm.quantity <= 0 || newItemForm.unitPrice <= 0) return;

        setNewFaktura({
            ...newFaktura,
            items: [...newFaktura.items, newItemForm],
            totalAmount: newFaktura.totalAmount + newItemForm.totalPrice,
        });

        setNewItemForm({
            itemId: "",
            description: "",
            quantity: 0,
            unitPrice: 0,
            totalPrice: 0,
        });
    };

    // Odstrániť položku
    const removeItem = (index) => {
        const updatedItems = newFaktura.items.filter((_, i) => i !== index);
        const updatedTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        setNewFaktura({ ...newFaktura, items: updatedItems, totalAmount: updatedTotal });
    };

    // Nastaviť hodnotu položky na základe kvantity a ceny
    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setNewItemForm((prevState) => {
            const updatedItem = { ...prevState, [name]: value };

            // Prepočítať totalPrice na základe kvantity a ceny za jednotku
            if (name === "quantity" || name === "unitPrice") {
                updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
            }

            return updatedItem;
        });
    };

    // Priradiť faktúru k existujúcej zakázke
    const addFaktura = () => {
        console.log("Sending Faktura:", JSON.stringify(newFaktura, null, 2));

        fetch('http://localhost:3000/faktura/create', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newFaktura),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(`HTTP error! status: ${response.status}, ${errorData.message}`);
                    });
                }
                return response.json();
            })
            .then((createdFaktura) => {
                setFaktury((prevFaktury) => [...prevFaktury, createdFaktura]);
                handleClose(); // Zavrieť modal
                resetForm(); // Vyresetovať formulár
            })
            .catch((error) => {
                console.error("Create error:", error);
            });
    };

    // Resetovať formulár po pridaní faktúry
    const resetForm = () => {
        setNewFaktura({
            invoiceId: "",
            issueDate: "",
            dueDate: "",
            clientName: "",
            clientEmail: "",
            items: [],
            totalAmount: 0,
            paymentStatus: "pending",
            notes: "",
            contractId: "",
        });
    };

    // Nájdi existujúce zakázky pre výber
    const zakazkaOptions = Array.isArray(zakazky)
        ? zakazky.map((zakazka) => (
            <option key={zakazka.id} value={zakazka.id}>{zakazka.contractId}</option>
        ))
        : [];

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Pridať faktúru</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {/* Formulár pre faktúru */}
                    <Form.Group className="mb-3">
                        <Form.Label>ID faktúry</Form.Label>
                        <Form.Control type="text" value={newFaktura.invoiceId}
                                      onChange={(e) => setNewFaktura({ ...newFaktura, invoiceId: e.target.value })} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Dátum vystavenia</Form.Label>
                        <Form.Control type="datetime-local" value={newFaktura.issueDate ? new Date(newFaktura.issueDate).toISOString().slice(0, 16) : ""}
                                      onChange={(e) => setNewFaktura({ ...newFaktura, issueDate: new Date(e.target.value).toISOString() })} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Dátum splatnosti</Form.Label>
                        <Form.Control type="datetime-local" value={newFaktura.dueDate ? new Date(newFaktura.dueDate).toISOString().slice(0, 16) : ""}
                                      onChange={(e) => setNewFaktura({ ...newFaktura, dueDate: new Date(e.target.value).toISOString() })} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Klient</Form.Label>
                        <Form.Control type="text" value={newFaktura.clientName}
                                      onChange={(e) => setNewFaktura({ ...newFaktura, clientName: e.target.value })} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email klienta</Form.Label>
                        <Form.Control type="email" value={newFaktura.clientEmail}
                                      onChange={(e) => setNewFaktura({ ...newFaktura, clientEmail: e.target.value })} />
                    </Form.Group>

                    {/* Výber zakázky */}
                    <Form.Group className="mb-3">
                        <Form.Label>Priradiť k zakázke</Form.Label>
                        <Form.Select value={newFaktura.contractId}
                                     onChange={(e) => setNewFaktura({ ...newFaktura, contractId: e.target.value })}>
                            <option value="">Vyberte zakázku</option>
                            {zakazkaOptions}
                        </Form.Select>
                    </Form.Group>

                    {/* Polozky faktúry */}
                    <h5>Položky</h5>
                    {newFaktura.items.map((item, index) => (
                        <div key={index} className="border p-3 mb-2 rounded">
                            <Form.Group className="mb-2">
                                <Form.Label>Item ID</Form.Label>
                                <Form.Control type="text" value={item.itemId} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Popis</Form.Label>
                                <Form.Control type="text" value={item.description} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control type="number" value={item.quantity} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Unit Price</Form.Label>
                                <Form.Control type="number" value={item.unitPrice} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Total Price</Form.Label>
                                <Form.Control type="number" value={item.totalPrice} disabled />
                            </Form.Group>
                            <Button variant="danger" size="sm" onClick={() => removeItem(index)}>Odstrániť</Button>
                        </div>
                    ))}

                    {/* Formulár pre novú položku */}
                    <div className="border p-3 mb-2 rounded">
                        <Form.Group className="mb-2">
                            <Form.Label>Item ID</Form.Label>
                            <Form.Control type="text" name="itemId" value={newItemForm.itemId}
                                          onChange={handleItemChange} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Popis</Form.Label>
                            <Form.Control type="text" name="description" value={newItemForm.description}
                                          onChange={handleItemChange} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" name="quantity" value={newItemForm.quantity}
                                          onChange={handleItemChange} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Unit Price</Form.Label>
                            <Form.Control type="number" name="unitPrice" value={newItemForm.unitPrice}
                                          onChange={handleItemChange} />
                        </Form.Group>
                        <Button variant="secondary" size="sm" onClick={addItem}>+ Pridať položku</Button>
                    </div>

                    {/* Poznámky a platobný stav */}
                    <Form.Group className="mt-3">
                        <Form.Label>Poznámky</Form.Label>
                        <Form.Control as="textarea" rows={3} value={newFaktura.notes}
                                      onChange={(e) => setNewFaktura({ ...newFaktura, notes: e.target.value })} />
                    </Form.Group>

                    <Form.Group className="mt-3">
                        <Form.Label>Stav platby</Form.Label>
                        <Form.Select value={newFaktura.paymentStatus}
                                     onChange={(e) => setNewFaktura({ ...newFaktura, paymentStatus: e.target.value })}>
                            <option value="pending">Čakajúci</option>
                            <option value="paid">Zaplatené</option>
                            <option value="overdue">Po splatnosti</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Zrušiť</Button>
                <Button variant="primary" onClick={addFaktura}>Pridať faktúru</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FakturaAddModal;
