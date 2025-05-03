// Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>O nás</h5>
                        <p>Spoločnosť sa špecializuje na evidenciu a správu zákaziek a faktúr.</p>
                    </Col>
                    <Col md={4}>
                        <h5>Rýchle odkazy</h5>
                        <ul className="list-unstyled">
                            <li><a href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</a></li>
                            <li><a href="/zakazky" style={{ color: '#fff', textDecoration: 'none' }}>Zákazky</a></li>
                            <li><a href="/faktury" style={{ color: '#fff', textDecoration: 'none' }}>Faktúry</a></li>
                        </ul>
                    </Col>
                    <Col md={4}>
                        <h5>Kontakt</h5>
                        <p>Email: <a href="mailto:support@evidencia.sk" style={{ color: '#fff' }}>support@evidencia.sk</a></p>
                        <p>Telefon: +421 900 000 000</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>&copy; {new Date().getFullYear()} Evidencia. Všetky práva vyhradené.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
