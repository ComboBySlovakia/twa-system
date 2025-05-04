
import React, { useState, useEffect } from "react";
import Footer from "../bricks/footer";
import ZakazkaMain from "../bricks/zakazky/ZakazkaMain"
import ZakazkaCard from "../bricks/zakazky/ZakazkaCard";
import ZakazkaAddModal from "../bricks/zakazky/ZakazkaAddModal";
function Zakazky(){

    const [isTableView, setIsTableView] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ marginTop: '25px' }}>Zakazky</h1>
                <ZakazkaMain>
                    {(zakazky, refreshZakazka) => (
                        <>
                            <h4>Počet zakazok: <strong>{zakazky.length}</strong></h4>

                            {isTableView ? (
                                <Zakazky zakazky={zakazky} />
                            ) : (
                                <div className="card-container">
                                    {zakazky.map((zakazky) => (
                                        <ZakazkaCard key={zakazky.id} zakazka={zakazky} />
                                    ))}
                                </div>
                            )}

                            {/* Modal na pridanie nového študenta */}
                            <ZakazkaAddModal
                                show={showAddModal}
                                refreshZakazka={refreshZakazka}
                            />
                        </>
                    )}
                </ZakazkaMain>
            </div>

            <Footer />
        </div>
    );

}

export default Zakazky;