import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import App from './App';
import Home from "./routes/Home"
import Faktury from "./routes/Faktury"
import Zakazky from "./routes/Zakazky"
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(  <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    {/* <Route index element={<Navigate to="/home" />} /> */}
                    <Route path="home" element={<Home />}/>
                    <Route path="students" element={<Faktury />}/>
                    <Route path="classrooms" element={<Zakazky />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
