import React, { useState, useEffect } from 'react';

const PropagationBanner: React.FC = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Mostrar banner solo durante las primeras 48h de propagación (desde el redeploy)
        const deployTime = new Date('2026-02-16T11:00:00-05:00');
        const now = new Date();
        const hoursSinceDeploy = (now.getTime() - deployTime.getTime()) / (1000 * 60 * 60);

        // Si han pasado menos de 48 horas, mostrar el banner
        if (hoursSinceDeploy < 48) {
            setShow(true);
        }
    }, []);

    if (!show) return null;

    return (
        <div style={{
            background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)',
            padding: '12px 20px',
            textAlign: 'center',
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            fontSize: '0.9rem',
            color: '#92400e',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderBottom: '1px solid #fcd34d',
            fontWeight: 500
        }}>
            <span className="mr-2">🔄</span>
            <strong>Estamos actualizando el sitio para una mejor experiencia.</strong> Si ves contenido antiguo o errores, por favor recarga la página (F5 o Ctrl+R).
            <button
                onClick={() => setShow(false)}
                style={{
                    marginLeft: '1.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#92400e',
                    lineHeight: 1
                }}
                title="Cerrar"
            >
                ×
            </button>
        </div>
    );
};

export default PropagationBanner;
