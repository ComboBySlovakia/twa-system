// načítanie modulu express
const express = require("express");

// nacitanie modulu PostgreSQL
const { Client } = require('pg');

// modul ajv
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv();
addFormats(ajv);

// crypto modul
const crypto = require("crypto");

const app = express();

// definovanie portu
const port = 8000;

// definovanie cesty
const path = require('path');
const { reset } = require("nodemon");

// pripojenie k PostgreSQL databáze
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'spsepo',
    port: 5432,
});

client.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error("Connection error", err.stack));

// pole zakazok
const zakazky = [];
// pole faktur
const faktury = [];

// podpora pre json
app.use(express.json());

// podpora pre application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Zakazkova cast

// Endpoint pre vytvorenie zakazky
app.post("/zakazka/create", (req, res) => {
    const body = req.body;

    const schema = {
        type: "object",
        properties: {
            contractId: { type: "string", description: "Unique identifier for the contract" },
            clientId: { type: "string", description: "ID klienta (firma)" },
            clientName: { type: "string", description: "Name of the client" },
            clientEmail: { type: "string", format: "email", description: "Email address of the client" },
            isCompany: { type: "boolean", description: "Indicates if client is a company" },
            contractDate: { type: "string", format: "date-time", description: "Date when the contract was created" },
            deadline: { type: "string", format: "date-time", description: "Deadline for the completion of the contract" },
            tasks: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        taskId: { type: "string", description: "Unique identifier for the task" },
                        description: { type: "string", description: "Description of the task" },
                        assignedTo: { type: "string", description: "Name of the person responsible for the task" },
                        status: { type: "string", enum: ["not started", "in progress", "completed"], description: "Status ulohy" }
                    },
                    required: ["taskId", "description", "assignedTo", "status"]
                },
                description: "Zoznam uloh zakazky"
            },
            budget: { type: "number", description: "Total budget allocated for the contract" },
            progress: { type: "number", description: "Percentage of completion of the contract" },
            status: { type: "string", enum: ["draft", "active", "completed", "cancelled"], description: "Status zakazky" }
        },
        required: ["contractId", "clientName", "clientEmail", "contractDate", "tasks", "budget", "status"],
        additionalProperties: false
    };

    const validate = ajv.compile(schema);
    const valid = validate(body);

    if (!valid) {
        res.status(400).json({
            code: "dtoIn Invalid",
            message: "Input data are invalid",
            errors: validate.errors,
        });
        return;
    }

    // Ak je klient firma, zabezpečíme clientId, ak nie, nastaviť clientId na null
    const newZakazka = {
        id: crypto.randomBytes(16).toString("hex"),
        clientId: body.clientId && body.clientId !== "" ? body.clientId : null, // Ak clientId je prázdny, nastav ho na null
        isCompany: body.isCompany !== undefined ? body.isCompany : null, // Ak isCompany nie je zadané, nastav ho na null
        ...body
    };

    if (!body.isCompany) {
        body.clientId = null;  // Ak ide o súkromnú osobu, nastavíme clientId na NULL
    }

// Zabezpečíme, že nie je prázdny reťazec pre UUID
    if (body.clientId === "") {
        body.clientId = null;  // Nastavíme na NULL, ak je prázdny reťazec
    }

    // Pridanie zakazky do databázy
    client.query('INSERT INTO zakazky(id, contractId, clientId, clientName, clientEmail, contractDate, deadline, tasks, budget, progress, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [
        newZakazka.id, newZakazka.contractId, body.clientId, newZakazka.clientName, newZakazka.clientEmail, newZakazka.contractDate, newZakazka.deadline, JSON.stringify(newZakazka.tasks), newZakazka.budget, newZakazka.progress, newZakazka.status
    ])
        .then(() => {
            res.json(newZakazka);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});


// Endpoint pre poslanie vsetkych zakazok
app.get("/zakazky/list", (req, res) => {
    client.query('SELECT * FROM zakazky')
        .then(result => {
            res.send(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

// Endpoint pre precitanie jednej zakazky
app.get("/zakazka/read", (req, res) => {
    const id = req.query.id;
    client.query('SELECT * FROM zakazky WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                res.status(400).json({
                    code: "contract_not_found",
                    message: `Zakazka: ${id} neexistuje!`,
                });
                return;
            }
            res.json(result.rows[0]);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

app.post("/zakazka/update", (req, res) => {
    const body = req.body;
    const id = body.id;

    if (!id) {
        return res.status(400).json({
            code: "missing_id",
            message: "ID zakázky je povinné!"
        });
    }

    // Načítame aktuálnu zakázku
    client.query('SELECT * FROM zakazky WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(400).json({
                    code: "contract_not_found",
                    message: `Zakázka s ID ${id} neexistuje!`,
                });
            }

            const tempZakazka = result.rows[0];

            // Pripravíme hodnoty na update
            const updatedContractId = body.contractId && body.contractId !== tempZakazka.contractid ? body.contractId : tempZakazka.contractid;
            const updatedClientName = body.clientName && body.clientName !== tempZakazka.clientname ? body.clientName : tempZakazka.clientname;
            const updatedClientEmail = body.clientEmail && body.clientEmail !== tempZakazka.clientemail ? body.clientEmail : tempZakazka.clientemail;
            const updatedContractDate = body.contractDate && body.contractDate !== tempZakazka.contractdate ? body.contractDate : tempZakazka.contractdate;
            const updatedDeadline = body.deadline && body.deadline !== tempZakazka.deadline ? body.deadline : tempZakazka.deadline;
            const updatedTasks = body.tasks ? JSON.stringify(body.tasks) : tempZakazka.tasks;
            const updatedBudget = body.budget !== undefined ? body.budget : tempZakazka.budget;
            const updatedProgress = body.progress !== undefined ? body.progress : tempZakazka.progress;
            const updatedStatus = body.status && body.status !== tempZakazka.status ? body.status : tempZakazka.status;

            // Aktualizácia v databáze
            const query = `
                UPDATE zakazky
                SET 
                    contractId = $1, 
                    clientName = $2, 
                    clientEmail = $3, 
                    contractDate = $4, 
                    deadline = $5, 
                    tasks = $6, 
                    budget = $7, 
                    progress = $8, 
                    status = $9
                WHERE id = $10
            `;
            const values = [
                updatedContractId,
                updatedClientName,
                updatedClientEmail,
                updatedContractDate,
                updatedDeadline,
                updatedTasks,
                updatedBudget,
                updatedProgress,
                updatedStatus,
                id
            ];

            client.query(query, values)
                .then(() => {
                    res.json({ id, ...body });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: "Database error" });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});



// Endpoint pre odstranenie zakazky
app.post("/zakazka/delete", (req, res) => {
    const id = req.body.id;
    client.query('DELETE FROM zakazky WHERE id = $1', [id])
        .then(() => {
            res.send({});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

// Fakturacna cast

// Endpoint pre vytvorenie faktury
app.post("/faktura/create", (req, res) => {
    const body = req.body;

    const schema = {
        type: "object",
        properties: {
            invoiceId: { type: "string" },
            issueDate: { type: "string", format: "date-time" },
            dueDate: { type: "string", format: "date-time" },
            clientName: { type: "string" },
            clientEmail: { type: "string", format: "email" },
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        itemId: { type: "string" },
                        description: { type: "string" },
                        quantity: { type: "integer" },
                        unitPrice: { type: "number" },
                        totalPrice: { type: "number" }
                    },
                    required: ["itemId", "description", "quantity", "unitPrice", "totalPrice"]
                }
            },
            totalAmount: { type: "number" },
            paymentStatus: { type: "string", enum: ["pending", "paid", "overdue"] },
            notes: { type: "string" }
        },
        required: ["invoiceId", "issueDate", "dueDate", "clientName", "items", "totalAmount", "paymentStatus"],
        additionalProperties: false
    };

    const validate = ajv.compile(schema);
    const valid = validate(body);

    if (!valid) {
        res.status(400).json({
            code: "dtoIn Invalid",
            message: "Input data are invalid",
            errors: validate.errors,
        });
        return;
    }

    const newFaktura = { id: crypto.randomUUID(), ...body };

    client.query(
        'INSERT INTO faktury (id, invoiceId, issueDate, dueDate, clientName, clientEmail, items, totalAmount, paymentStatus, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
            newFaktura.id,
            newFaktura.invoiceId,
            newFaktura.issueDate,
            newFaktura.dueDate,
            newFaktura.clientName,
            newFaktura.clientEmail,
            JSON.stringify(newFaktura.items),
            newFaktura.totalAmount,
            newFaktura.paymentStatus,
            newFaktura.notes || null
        ]
    )
        .then(() => {
            res.json(newFaktura);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});


// Endpoint pre vypisanie faktur
app.get("/faktury/list", (req, res) => {
    client.query('SELECT * FROM faktury')
        .then(result => {
            res.send(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

// Endpoint pre precitanie jednej faktury
app.get("/faktura/read", (req, res) => {
    const id = req.query.id;
    client.query('SELECT * FROM faktury WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                res.status(400).json({
                    code: "invoice_not_found",
                    message: `Faktura: ${id} neexistuje!`,
                });
                return;
            }
            res.json(result.rows[0]);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

// Endpoint pre upravenie faktury
app.post("/faktura/update", (req, res) => {
    const body = req.body;
    const id = req.body.id;
    client.query('SELECT * FROM faktury WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                res.status(400).json({
                    code: "invoice_not_found",
                    message: `Faktura: ${id} neexistuje!`,
                });
                return;
            }

            const tempFaktura = result.rows[0];
            client.query('UPDATE faktury SET invoiceId = $1, issueDate = $2, dueDate = $3, clientName = $4, clientEmail = $5, items = $6, totalAmount = $7, paymentStatus = $8, notes = $9 WHERE id = $10', [
                body.invoiceId || tempFaktura.invoiceid,
                body.issueDate || tempFaktura.issuedate,
                body.dueDate || tempFaktura.duedate,
                body.clientName || tempFaktura.clientname,
                body.clientEmail || tempFaktura.clientemail,
                JSON.stringify(body.items || tempFaktura.items),
                body.totalAmount || tempFaktura.totalamount,
                body.paymentStatus || tempFaktura.paymentstatus,
                body.notes || tempFaktura.notes,
                id
            ])
                .then(() => {
                    res.json({ id, ...body });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: "Database error" });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

// Endpoint pre odstranenie faktury
app.post("/faktura/delete", (req, res) => {
    const id = req.body.id;
    client.query('DELETE FROM faktury WHERE id = $1', [id])
        .then(() => {
            res.send({});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Database error" });
        });
});

// nastavenie portu, na ktorom má bežať HTTP server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
