import React, { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';
import { styles } from './styles';
import sello from '../imagenes/sello.png';
import carta from '../imagenes/carta.png';
import { stylesSobre } from './styles_sobre';

const SECRET_KEY = 'vintage_letter_secret';

export default function RecibirCarta({ setScreen }) {
  const [pendingLetters, setPendingLetters] = useState([]);
  const [readingLetter, setReadingLetter] = useState(null); 
  const [viewMode, setViewMode] = useState('envelope'); 
  const [now, setNow] = useState(Date.now());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedLetters = JSON.parse(localStorage.getItem('cartas_pendientes') || '[]');
    setPendingLetters(storedLetters);

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime); 

      setPendingLetters(prevLetters => {
        let hasChanges = false;
        
        const updatedLetters = prevLetters.map(letter => {
          if (letter.unlockTime <= currentTime && !letter.notified) {
            hasChanges = true;
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('¡Te ha llegado una carta!', {
                body: 'Una de tus cartas secretas ya puede ser abierta.',
                icon: sello 
              });
            }
            return { ...letter, notified: true }; 
          }
          return letter;
        });

        if (hasChanges) {
          localStorage.setItem('cartas_pendientes', JSON.stringify(updatedLetters));
        }
        
        return hasChanges ? updatedLetters : prevLetters;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bytes = CryptoJS.AES.decrypt(e.target.result, SECRET_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        const newLetter = {
          id: Date.now().toString(),
          text: decryptedData.text,
          reverseText: decryptedData.reverseText,
          paperColor: decryptedData.paperColor,
          remitente: decryptedData.remitente,
          destinatario: decryptedData.destinatario,
          stamp: decryptedData.stamp,
          unlockTime: decryptedData.unlockTime,
          notified: false 
        };

        const updatedLetters = [...pendingLetters, newLetter];
        setPendingLetters(updatedLetters);
        localStorage.setItem('cartas_pendientes', JSON.stringify(updatedLetters));
        
        alert('Carta depositada en la mesa. Empezando cuenta atrás.');
      } catch (error) {
        alert('Sello Roto: El archivo no es una carta válida.');
      }
      event.target.value = null; 
    };
    reader.readAsText(file);
  };

  const saveToLibrary = () => {
    const saved = JSON.parse(localStorage.getItem('biblioteca_cartas') || '[]');
    saved.push({ ...readingLetter, dateSaved: new Date().toLocaleDateString() });
    localStorage.setItem('biblioteca_cartas', JSON.stringify(saved));
    
    const remaining = pendingLetters.filter(l => l.id !== readingLetter.id);
    setPendingLetters(remaining);
    localStorage.setItem('cartas_pendientes', JSON.stringify(remaining));
    
    setReadingLetter(null);
    setViewMode('envelope');
  };

  const burnLetter = () => {
    removePendingLetter(readingLetter.id);
    setReadingLetter(null);
  };

  const removePendingLetter = (id) => {
    const remaining = pendingLetters.filter(l => l.id !== id);
    setPendingLetters(remaining);
    localStorage.setItem('cartas_pendientes', JSON.stringify(remaining));
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '0h 0m 0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  };

  // --- RENDERIZADO DE LECTURA ---
  if (readingLetter) {
    return (
      <div style={styles.container}>
        {viewMode === 'envelope' ? (
          /* VISTA DEL SOBRE (REVERSO) */
          <div 
            onClick={() => setViewMode('paper')}
            style={{ ...stylesSobre.envelopeContainer, cursor: 'pointer', transform: 'scale(0.9)' }}
          >
            <div style={stylesSobre.topSection}>
              <div style={stylesSobre.addressBlock}>
                <span style={stylesSobre.label}>REMITENTE</span>
                <p style={{ fontFamily: 'serif', fontSize: '18px' }}>{readingLetter.remitente}</p>
              </div>
              <div style={stylesSobre.stampBox}>
                <img src={readingLetter.stamp} style={stylesSobre.customStampImage} alt="Sello" />
              </div>
            </div>
            <div style={stylesSobre.destinatarioBlock}>
              <span style={stylesSobre.label}>DESTINATARIO</span>
              <p style={{ fontFamily: 'serif', fontSize: '18px' }}>{readingLetter.destinatario}</p>
            </div>
            <p style={{ textAlign: 'center', color: '#8c7b68', fontSize: '12px', marginTop: '10px' }}>
              (Pulsa el sobre para abrir la carta)
            </p>
          </div>
        ) : (
          /* VISTA DEL PAPEL (ANVERSO) */
          <>
            <div style={{ ...styles.letterPaper, backgroundColor: readingLetter.paperColor }}>
              <p style={styles.letterContent}>{readingLetter.text}</p>
              {readingLetter.reverseText && (
                <div style={{ marginTop: '30px', borderTop: '1px dashed #C1A68D', paddingTop: '10px' }}>
                  <p style={{ ...styles.letterContent, fontSize: '18px', opacity: 0.8 }}>{readingLetter.reverseText}</p>
                </div>
              )}
            </div>
            <button style={{ ...styles.button, ...styles.primaryButton }} onClick={saveToLibrary}>Guardar en el Baúl</button>
            <button style={styles.cancelBtn} onClick={() => setViewMode('envelope')}>Volver a cerrar</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <input type="file" accept=".carta,.txt" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      <button 
        style={{ ...styles.button, backgroundColor: '#E8DCC4', color: '#4A3B32', border: '2px dashed #C1A68D', height: '80px', marginBottom: '30px' }} 
        onClick={() => {
          if ('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission();
          fileInputRef.current.click();
        }}
      >
        INTRODUCE TU CARTA (.carta)
      </button>

      {pendingLetters.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h2 style={{ fontSize: '20px', color: '#4A3B32', borderBottom: '1px solid #C1A68D', paddingBottom: '5px' }}>Cartas pendientes:</h2>
          
          {pendingLetters.map(letter => {
            const remainingSeconds = Math.floor((letter.unlockTime - now) / 1000);
            const isReady = remainingSeconds <= 0;

            return (
              <div key={letter.id} style={{
                backgroundColor: isReady ? '#FAF5EB' : '#E8DCC4',
                border: '1px solid #C1A68D',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: isReady ? '0 4px 8px rgba(140, 39, 30, 0.2)' : 'none'
              }}>
                
                {isReady ? (
                  <>
                    <img src={carta} alt="Nueva Carta" style={{ width: '100px', height: '100px', marginBottom: '10px' }} />
                    <button style={{ ...styles.button, ...styles.primaryButton, margin: 0 }} onClick={() => setReadingLetter(letter)}>
                      Leer Carta
                    </button>
                  </>
                ) : (
                  <>
                    <img src={sello} alt="Sello cerrado" style={{ width: '100px', height: '100px', marginBottom: '10px' }} />
                    <p style={styles.timer}>{formatTime(remainingSeconds)}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button style={{...styles.cancelBtn, marginTop: '15px'}} onClick={() => setScreen('main')}>Volver al menú</button>
    </div>
  );
}