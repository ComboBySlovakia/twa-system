import React, { useState } from "react";
import Footer from "../bricks/footer";
import FakturaMain from "../bricks/faktury/FakturaMain";
import FakturaCard from "../bricks/faktury/FakturaCard";
import FakturaAddModal from "../bricks/faktury/FakturaAddModal";

function Faktury() {
    const [isTableView, setIsTableView] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ marginTop: '25px' }}>Faktúry</h1>
                <FakturaMain>
                    {(faktury, refreshFaktura) => (
                        <>
                            <h4>Počet faktúr: <strong>{faktury.length}</strong></h4>

                            {isTableView ? (
                                // Ak budeš chcieť aj tabuľkový pohľad neskôr:
                                // <FakturaTable faktury={faktury} />
                                <p>Zatiaľ neimplementovaný tabuľkový pohľad</p>
                            ) : (
                                <div className="card-container">
                                    {faktury.map((faktura) => (
                                        <FakturaCard key={faktura.invoiceId} faktura={faktura} refreshFaktura={refreshFaktura} />
                                    ))}
                                </div>
                            )}

                            <FakturaAddModal
                                show={showAddModal}
                                refreshFaktura={refreshFaktura}
                            />
                        </>
                    )}
                </FakturaMain>
            </div>

            <Footer />
        </div>
    );
}

export default Faktury;
