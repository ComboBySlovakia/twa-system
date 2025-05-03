import React from "react";
import Footer from "../bricks/footer";
function Faktury(){

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ marginTop: '25px' }}>Faktury</h1>
            </div>
            <Footer />
        </div>
    );
}

export default Faktury;