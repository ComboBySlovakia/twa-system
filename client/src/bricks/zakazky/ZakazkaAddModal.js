import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ZakazkaAddModal({ show, handleClose, setZakazky }) {
    // Stav pre zákazku
    const [newZakazka, setNewZakazka] = useState({
        contractId: "",
        clientId: "", // Pridávame clientId pre firmu
        clientName: "",
        clientEmail: "",
        contractDate: "",
        deadline: "",
        tasks: [],
        budget: 0,
        progress: 0,
        status: "draft",
        isCompany: false, // Nový stav, ktorý určuje, či je klient firma
    });

    // Stav pre novú úlohu
    const [newTaskForm, setNewTaskForm] = useState({
        taskId: "",
        description: "",
        assignedTo: "",
        status: "not started"
    });

    // Pridať úlohu do zákazky
    const addTask = () => {
        if (!newTaskForm.taskId || !newTaskForm.description || !newTaskForm.assignedTo) return;

        setNewZakazka({
            ...newZakazka,
            tasks: [...newZakazka.tasks, newTaskForm]
        });

        setNewTaskForm({
            taskId: "",
            description: "",
            assignedTo: "",
            status: "not started"
        });
    };

    // Odstrániť úlohu
    const removeTask = (index) => {
        const updatedTasks = newZakazka.tasks.filter((_, i) => i !== index);
        setNewZakazka({ ...newZakazka, tasks: updatedTasks });
    };

    // Odoslať zákazku na server
    const addZakazka = () => {
        console.log("Sending Zakazka:", JSON.stringify(newZakazka, null, 2));
        fetch('http://localhost:3000/zakazka/create', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newZakazka)
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(`HTTP error! status: ${response.status}, ${errorData.message}`);
                    });
                }
                return response.json();
            })
            .then((createdZakazka) => {
                setZakazky((prevZakazky) => [...prevZakazky, createdZakazka]);
                handleClose(); // Zavrieť modal
                resetForm(); // Vyresetovať formulár
            })
            .catch((error) => {
                console.error("Create error:", error);
            });
    };

    // Resetovať formulár po pridaní zákazky
    const resetForm = () => {
        setNewZakazka({
            contractId: "",
            clientId: "", // Resetujeme clientId
            clientName: "",
            clientEmail: "",
            contractDate: "",
            deadline: "",
            tasks: [],
            budget: 0,
            progress: 0,
            status: "draft",
            isCompany: false, // Resetujeme aj isCompany
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Pridať zákazku</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {/* Formulár pre zákazku */}
                    <Form.Group className="mb-3">
                        <Form.Label>ID zákazky</Form.Label>
                        <Form.Control type="text" value={newZakazka.contractId}
                                      onChange={(e) => setNewZakazka({ ...newZakazka, contractId: e.target.value })} />
                    </Form.Group>

                    {/* Výber, či ide o firmu alebo súkromnú osobu */}
                    <Form.Group className="mb-3">
                        <Form.Label>Typ klienta</Form.Label>
                        <Form.Check
                            type="radio"
                            label="Firma"
                            name="clientType"
                            checked={newZakazka.isCompany}
                            onChange={() => setNewZakazka({ ...newZakazka, isCompany: true })}
                        />
                        <Form.Check
                            type="radio"
                            label="Súkromná osoba"
                            name="clientType"
                            checked={!newZakazka.isCompany}
                            onChange={() => setNewZakazka({ ...newZakazka, isCompany: false })}
                        />
                    </Form.Group>

                    {/* Polia pre klienta */}
                    {newZakazka.isCompany ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>ID klienta (Firma)</Form.Label>
                                <Form.Control type="text" value={newZakazka.clientId}
                                              onChange={(e) => setNewZakazka({ ...newZakazka, clientId: e.target.value })} />
                            </Form.Group>
                        </>
                    ) : (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Klient (Súkromná osoba)</Form.Label>
                                <Form.Control type="text" placeholder="Zadajte meno"
                                              value={newZakazka.clientName}
                                              onChange={(e) => setNewZakazka({ ...newZakazka, clientName: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email klienta</Form.Label>
                                <Form.Control type="email" value={newZakazka.clientEmail}
                                              onChange={(e) => setNewZakazka({ ...newZakazka, clientEmail: e.target.value })} />
                            </Form.Group>
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Dátum zákazky</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={newZakazka.contractDate ? new Date(newZakazka.contractDate).toISOString().slice(0, 16) : ""}
                            onChange={(e) => {
                                const isoDate = new Date(e.target.value).toISOString();
                                setNewZakazka({ ...newZakazka, contractDate: isoDate });
                            }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Deadline</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={newZakazka.deadline ? new Date(newZakazka.deadline).toISOString().slice(0, 16) : ""}
                            onChange={(e) => {
                                const isoDate = new Date(e.target.value).toISOString();
                                setNewZakazka({ ...newZakazka, deadline: isoDate });
                            }}
                        />
                    </Form.Group>

                    {/* Úlohy */}
                    <h5>Úlohy</h5>

                    {/* Existujúce úlohy */}
                    {newZakazka.tasks.map((task, index) => (
                        <div key={index} className="border p-3 mb-2 rounded">
                            <Form.Group className="mb-2">
                                <Form.Label>Task ID</Form.Label>
                                <Form.Control type="text" value={task.taskId} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Popis</Form.Label>
                                <Form.Control type="text" value={task.description} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Zodpovedná osoba</Form.Label>
                                <Form.Control type="text" value={task.assignedTo} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Status</Form.Label>
                                <Form.Select value={task.status} disabled>
                                    <option value="not started">Not started</option>
                                    <option value="in progress">In progress</option>
                                    <option value="completed">Completed</option>
                                </Form.Select>
                            </Form.Group>
                            <Button variant="danger" size="sm" onClick={() => removeTask(index)}>Odstrániť</Button>
                        </div>
                    ))}

                    {/* Formulár pre novú úlohu */}
                    <div className="border p-3 mb-2 rounded">
                        <Form.Group className="mb-2">
                            <Form.Label>Task ID</Form.Label>
                            <Form.Control type="text" value={newTaskForm.taskId}
                                          onChange={(e) => setNewTaskForm({ ...newTaskForm, taskId: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Popis</Form.Label>
                            <Form.Control type="text" value={newTaskForm.description}
                                          onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Zodpovedná osoba</Form.Label>
                            <Form.Control type="text" value={newTaskForm.assignedTo}
                                          onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={newTaskForm.status}
                                         onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value })}>
                                <option value="not started">Not started</option>
                                <option value="in progress">In progress</option>
                                <option value="completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="secondary" size="sm" onClick={addTask}>+ Pridať úlohu</Button>
                    </div>

                    {/* Rozpočet a progres */}
                    <Form.Group className="mt-3">
                        <Form.Label>Rozpočet</Form.Label>
                        <Form.Control type="number" value={newZakazka.budget}
                                      onChange={(e) => setNewZakazka({ ...newZakazka, budget: parseFloat(e.target.value) || 0 })} />
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Label>Progres (%)</Form.Label>
                        <Form.Control type="number" min="0" max="100" value={newZakazka.progress}
                                      onChange={(e) => setNewZakazka({ ...newZakazka, progress: parseFloat(e.target.value) || 0 })} />
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={newZakazka.status}
                                     onChange={(e) => setNewZakazka({ ...newZakazka, status: e.target.value })}>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Zavrieť</Button>
                <Button variant="primary" onClick={addZakazka}>Pridať zákazku</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ZakazkaAddModal;
