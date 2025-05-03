import React, { useEffect, useRef } from 'react';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaFileInvoice, FaChartPie } from 'react-icons/fa';  // Ikony
import { Doughnut, Line } from 'react-chartjs-2';  // Pridané Line pre nový graf
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';  // Registrované ďalšie elementy
import Footer from "../bricks/footer";
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import image from "../images/fakturacia.jpg"

ChartJS.register(Title, Tooltip, Legend, ArcElement, LineElement, CategoryScale, LinearScale, PointElement);  // Pridané pre PointElement a ďalšie

const Dashboard = () => {
    const navigate = useNavigate();
    const chartRef = useRef(null);  // Ref pre Canvas element

    // Dummy data pre grafy
    const dataZákazky = {
        labels: ['Otvorené', 'Uzatvorené'],
        datasets: [
            {
                label: 'Zákazky',
                data: [10, 5],
                backgroundColor: ['#36A2EB', '#FF6384'],
                borderColor: '#fff',
                borderWidth: 1
            }
        ]
    };

    const dataFaktúry = {
        labels: ['Zaplatené', 'Nezaplatené'],
        datasets: [
            {
                label: 'Faktúry',
                data: [3, 2],
                backgroundColor: ['#4CAF50', '#FF9800'],
                borderColor: '#fff',
                borderWidth: 1
            }
        ]
    };

    const lineChartData = {
        labels: ['Január', 'Február', 'Marec', 'Apríl', 'Máj'],
        datasets: [
            {
                label: 'Počet zákaziek',
                data: [12, 15, 10, 25, 20],
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
            },
            {
                label: 'Počet faktúr',
                data: [5, 8, 7, 12, 10],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                fill: true,
            }
        ]
    };

    const stats = [
        { title: "📦 Počet zákaziek", value: 15 },
        { title: "🧾 Počet faktúr", value: 5 },
        { title: "📊 Prehľad", value: "Zobraziť" }
    ];

    const notify = (title, value) => {
        // You can customize this function for notification purposes
        console.log(`${title}: ${value}`);
    };

    // Cleanup the chart when the component unmounts
    useEffect(() => {
        const chartInstance = chartRef.current?.chartInstance;

        return () => {
            if (chartInstance) {
                chartInstance.destroy();  // Destroy the chart instance before re-render
            }
        };
    }, []);

    return (
        <div className="dashboard-container">

            <Container className="mt-5">
                {/* Názov EVIDENCIA */}
                <Row className="mb-5">
                    <Col>
                        <h1 className="text-center display-4 fw-bold">EVIDENCIA</h1>
                    </Col>
                </Row>

                {/* Zákazky, Faktúry, Prehľad Cards */}
                <Row>
                    {/* Zákazky */}
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <FaBox style={{ fontSize: '30px', color: '#36A2EB' }} /> Zákazky
                                </Card.Title>
                                <Doughnut data={dataZákazky} options={{ responsive: true }} />
                                <Card.Text className="mt-3">
                                    Aktuálne máte <strong>15</strong> zákaziek.
                                </Card.Text>
                                <Button variant="primary" onClick={() => navigate("/zakazky")}>Zobraziť Zákazky</Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Faktúry */}
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <FaFileInvoice style={{ fontSize: '30px', color: '#4CAF50' }} /> Faktúry
                                </Card.Title>
                                <Doughnut data={dataFaktúry} options={{ responsive: true }} />
                                <Card.Text className="mt-3">
                                    Aktuálne máte <strong>5</strong> faktúr na spracovanie.
                                </Card.Text>
                                <Button variant="primary" onClick={() => navigate("/faktury")}>Zobraziť Faktúry</Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Prehľad */}
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <FaChartPie style={{ fontSize: '30px', color: '#FF9800' }} /> Prehľad
                                </Card.Title>
                                <Line ref={chartRef} data={lineChartData} options={{ responsive: true }} />
                                <Card.Text>
                                    Tu vidíte vývoj počtu zákaziek a faktúr v priebehu posledných mesiacov.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Pôvodné štatistiky - premiestnené dolu */}
                <Row className="mt-4">
                    <Toaster />
                    {stats.map((stat, index) => (
                        <Col md={4} key={index}>
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 * index }}>
                                <Card
                                    className="text-center shadow-lg p-3 mb-4 bg-light stat-card"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                        cursor: 'pointer',
                                        pointerEvents: 'auto'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                                        e.currentTarget.style.transform = 'scale(1.01)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                    onClick={() =>
                                        toast.success(`${stat.title}: ${stat.value}`, {
                                            duration: 2000,
                                            position: 'top-center',
                                            style: {
                                                background: '#fff',
                                                color: '#333',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                fontWeight: '500',
                                                fontSize: '16px',
                                            }
                                        })
                                    }
                                >
                                    <Card.Body>
                                        <Card.Title>{stat.title}</Card.Title>
                                        <h3>{stat.value}</h3>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                <Row>
                    <Col>
                        <Card>
                            <Card.Body>
                                <Card.Title>Prehľad</Card.Title>
                                <Card.Text>
                                    Tu môžeme pridať grafy alebo ďalšie štatistiky pre vizuálny prehľad.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );

}

export default Dashboard;
