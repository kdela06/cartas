import React, { useState, useEffect } from 'react';
import { styles } from './styles';
import { stylesSobre } from './styles_sobre';

export default function Biblioteca({ setScreen }) {
  const [letters, setLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('biblioteca_cartas') || '[]');
    setLetters(saved);
  }, []);

  const deleteLetter = (index, event) => {
    // Evitamos que al pulsar la X se abra la carta
    event.stopPropagation();
    
    if (window.confirm('¿Deseas eliminar esta carta permanentemente?')) {
      const updatedLetters = letters.filter((_, i) => i !== index);
      setLetters(updatedLetters);
      localStorage.setItem('biblioteca_cartas', JSON.stringify(updatedLetters));
    }
  };

  const clearLibrary = () => {
    if(window.confirm('¿Estás seguro de borrar todas tus cartas?')) {
      localStorage.removeItem('biblioteca_cartas');
      setLetters([]);
    }
  };

  if (selectedLetter) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.letterPaper, backgroundColor: selectedLetter.paperColor }}>
          <p style={styles.letterContent}>{selectedLetter.text}</p>
          {selectedLetter.reverseText && <p style={{...styles.letterContent, opacity: 0.7}}><br/>{selectedLetter.reverseText}</p>}
        </div>
        <button style={styles.cancelBtn} onClick={() => setSelectedLetter(null)}>Volver a la caja</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {letters.length === 0 ? (
          <p style={styles.vintageText}>Tu caja está vacía.</p>
        ) : (
          letters.map((letter, index) => (
            /* SOBRE MINIATURA COMO BOTÓN */
            <div 
              key={index} 
              onClick={() => setSelectedLetter(letter)}
              style={{ 
                ...stylesSobre.envelopeContainer, 
                cursor: 'pointer', 
                padding: '15px', 
                transform: 'scale(0.95)',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
            >
              <button 
                onClick={(e) => deleteLetter(index, e)}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: '#8C271E',
                  color: '#F4ECD8',
                  border: 'none',
                  borderRadius: '50%',
                  width: '25px',
                  height: '25px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  zIndex: 20
                }}
                title="Eliminar carta"
              >
                ×
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '60%' }}>
                  <span style={stylesSobre.label}>DE: {letter.remitente}</span>
                  <p style={{ fontSize: '12px', color: '#8c7b68' }}>{letter.dateSaved}</p>
                </div>
                <div style={{ width: '50px', height: '60px', border: '1px solid #C1A68D' }}>
                  <img src={letter.stamp} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Sello" />
                </div>
              </div>
              <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                <span style={stylesSobre.label}>PARA: {letter.destinatario}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        style={styles.cancelBtn} onClick={() => setScreen('main')}>Cerrar Caja
      </button>
    </div>
  );
}