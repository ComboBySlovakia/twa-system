import logo from './logo.svg';
import './App.css';
import React from 'react';
import {useNavigate} from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import Footer from "./bricks/footer";


function App() {
  const navigate = useNavigate();

  return (
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="/" style={{ marginLeft: 15, fontSize: 35 }}>
            Evidencia
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
                className="mr-auto my-2 my-lg-0"
                style={{ maxHeight: '150px' }}
                navbarScroll
            >
              <Nav.Item>
                <Nav.Link onClick={() => navigate("/dashboard")} style={{ fontSize: 20 }}>Dashboard</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => navigate("/zakazky")} style={{ fontSize: 20 }}>Zákazky</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => navigate("/faktury")} style={{ fontSize: 20 }}>Faktúry</Nav.Link>
              </Nav.Item>
            </Nav>
            <Form className="d-flex">
              <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
              />
              <Button variant="dark" className="p-0">
                <Icon path={mdiMagnify} size={1} />
              </Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
        <Outlet />

      </div>
  );
}

export default App;



