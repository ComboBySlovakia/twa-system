// načítanie modulu express

const express=  require("express");

//nacitanie modulu ms databazy
const sql = require('mssql')

// modul ajv
const Ajv = require("ajv")
const addFormats = require("ajv-formats");

const ajv = new Ajv()
addFormats(ajv);

//crpyto modul-*

const crypto = require("crypto");

const app = express();

// definovanie portu

const port = 8000;

// definovanie cesty
const path = require('path');
const {reset} = require("nodemon");

(async () => {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect('Server=localhost,1433;Database=database;User Id=username;Password=password;Encrypt=true')
        const result = await sql.query`select * from mytable where id = ${value}`
        console.dir(result)
    } catch (err) {
        // ... error checks
    }
})()

//pole zakazok
const zakazky = [];
//pole faktur
const faktury = [];

// podpora pre json
app.use(express.json());

//podpora pre application /x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Zakazkova cast

// Endpoint pre vytvorenie zakazky
app.post("/zakazka/create", (req, res) => {

    const body = req.body

    const schema = {
        type: "object",
        properties: {
            contractId: { type: "string", description: "Unique identifier for the contract" },
            clientName: { type: "string", description: "Name of the client" },
            clientEmail: { type: "string", format: "email", description: "Email address of the client" },
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

    if(!valid) {
        res.status(400).json({
            code: "dtoIn Invalid",
            message: "Input data are invalid",
            errros: validate.errors,
        });
        return;
    }

    const newZakazka = { id: crypto.randomBytes(16).toString("hex"), ...body };

    res.json(newZakazka)
    zakazky.push(newZakazka)

});

// Endpoint pre poslanie vsetkych zakazok
app.get("/zakazky/list", (req,res) => {
    res.send(zakazky);
});

// Endpoint pre precitanie jednej zakazky
app.get("/zakazka/read", (req,res) => {

    const id = req.query.id;
    const zakazkaById = zakazky.find((zakazka) => zakazka.id === id);

    if (!zakazkaById) {
        res.status(400).json({
            code: "contract_not_found",
            message: `Zakazka: ${id} neexistuje!`,
        });
        return;
    }

    res.json(zakazkaById);

});

// Endpoint pre upravenie zakazky
app.post("/zakazka/update", (req,res) => {

    const body = req.body
    const id = req.body.id;
    const zakazkaIndex = zakazky.find((zakazka) => zakazka.id === id);

    if (zakazkaIndex -1) {

        res.status(400).json({
            code: "contract_not_found",
            message:`Zakazka: ${id} neexistuje !`,
        });
    }

    const tempZakazka = zakazky[zakazkaIndex];
    zakazky[zakazkaIndex] = {
        ...tempZakazka,
        ...body,
    }

    res.send(zakazky[zakazkaIndex])

});

// Endpoint pre odstranenie zakazky
app.post("/zakazka/delete", (req,res) => {

    const id = req.body.id;
    const zakazkaIndex = zakazky.find((zakazka) => zakazka.id === id);

    if (zakazkaIndex -1) {

        res.status(400).json({
            code: "contract_not_found",
            message:`Zakazka: ${id} neexistuje !`,
        });
    }
    zakazky.splice(zakazkaIndex, 1)
    res.send({});

});

// Fakturacna cast


// Endpoint pre vytvorenie faktury
app.post("/faktura/create", (req, res) => {

    const body = req.body

    const schema = {
        type: "object",
        properties: {
            invoiceId: { type: "string", description: "Unique identifier for the invoice" },
            issueDate: { type: "string", format: "date-time", description: "Date when the invoice was issued" },
            dueDate: { type: "string", format: "date-time", description: "Deadline for payment of the invoice" },
            clientName: { type: "string", description: "Name of the client being billed" },
            clientEmail: { type: "string", format: "email", description: "Email address of the client" },
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        itemId: { type: "string", description: "Unique identifier for the item or service" },
                        description: { type: "string", description: "Description of the item or service" },
                        quantity: { type: "integer", description: "Quantity of the item or service" },
                        unitPrice: { type: "number", description: "Price per unit of the item or service" },
                        totalPrice: { type: "number", description: "Total price for the item or service (quantity * unitPrice)" }
                    },
                    required: ["itemId", "description", "quantity", "unitPrice", "totalPrice"]
                },
                description: "List of items or services included in the invoice"
            },
            totalAmount: { type: "number", description: "Total amount payable for the invoice" },
            paymentStatus: { type: "string", enum: ["pending", "paid", "overdue"], description: "Payment status of the invoice" },
            notes: { type: "string", description: "Additional notes or terms related to the invoice" }
        },
        required: ["invoiceId", "issueDate", "dueDate", "clientName", "items", "totalAmount", "paymentStatus"],
        additionalProperties: false
    };

    const validate = ajv.compile(schema);
    const valid = validate(body);

    if(!valid) {
        res.status(400).json({
            code: "dtoIn Invalid",
            message: "Input data are invalid",
            errors: validate.errors,
        });
        return;
    }


});

// Endpoint pre vypisanie faktur
app.get("faktury/list", (req,res) => {
   res.send(faktury);
});

// Endpoint pre precitanie jednej faktury
app.get("/faktura/read", (req,res) => {

    const id = req.body.id;
    const fakutraById = faktury.find((faktura) => faktura.id === id);

    if(!fakutraById) {

        res.status(400).json({
            code: "invoice_not_found",
            message: `Faktura: ${id} neexistuje!`,
        });
        return;
    }

    res.json(fakutraById)

});

// Endpoint pre upravenie faktury
app.post("/faktura/update", (req,res) => {

    const body = req.body;
    const id = req.body.id;
    const fakturaIndex = faktury.find((faktura) => faktura.id === id);

    if(!fakturaIndex) {

        res.status(400).json({
           code: "invoice_not_found",
           message: `Faktura: ${id} neexistuje!`,
        });

    }

    const tempFaktura = faktury[fakturaIndex];

    faktury[fakturaIndex] = {
    ...tempFaktura,
    ...body,


    }

    res.json(faktury[fakturaIndex]);

});

// Endpoint pre odstranenie faktury
app.post("/faktura/delete", (req,res) => {

    const id = req.body.id;
    const fakutraIndex = faktury.find((faktura) => faktura.id === id);

    if(!fakutraIndex){

        res.status(400).json({
            code: "invoice_not_found",
            message: `Faktura: ${id} neexistuje!`,
        })
    }

    faktury.splice(fakutraIndex, 1);
    res.send({});

});


// nastavenie portu, na ktorom má bežať HTTP server
app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`);

})