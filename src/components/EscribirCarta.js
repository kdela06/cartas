import React, { useState, useRef, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { styles } from '../components/styles'; 
import { stylesSobre } from '../components/styles_sobre';

import selloPredeterminado from '../imagenes/sello_predeterminado.png'; 

const SECRET_KEY = 'vintage_letter_secret';

// Máscara SVG para recortar los sellos con bordes de sierra perfectos (70x90)
const StampMask = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <mask id="stampMask">
        <rect width="100%" height="100%" fill="white" />
        {/* Bordes horizontales (Arriba y Abajo) */}
        {[...Array(8)].map((_, i) => (
          <React.Fragment key={`h-${i}`}>
            <circle cx={i * 10} cy={0} r={3.5} fill="black" />
            <circle cx={i * 10} cy={90} r={3.5} fill="black" />
          </React.Fragment>
        ))}
        {/* Bordes verticales (Izquierda y Derecha) */}
        {[...Array(10)].map((_, i) => (
          <React.Fragment key={`v-${i}`}>
            <circle cx={0} cy={i * 10} r={3.5} fill="black" />
            <circle cx={70} cy={i * 10} r={3.5} fill="black" />
          </React.Fragment>
        ))}
      </mask>
    </defs>
  </svg>
);

export default function EscribirCarta({ setScreen }) {
  const [formStep, setFormStep] = useState('writing');

  const [letterText, setLetterText] = useState('');
  const [reverseText, setReverseText] = useState('');
  const [paperColor, setPaperColor] = useState('#FAF5EB');

  const [remitenteText, setRemitenteText] = useState('');
  const [destinatarioText, setDestinatarioText] = useState('');
  const [unlockDate, setUnlockDate] = useState('');

  // Estados para los sellos
  const [stamp, setStamp] = useState('predeterminado'); // 'predeterminado' o 'personalizado'
  const [stampId, setStampId] = useState('predeterminado_1'); 
  const [userStamps, setUserStamps] = useState([]); // Colección de sellos subidos por el usuario

  const fileInputRef = useRef(null);

  const paperColors = ['#FAF5EB', '#E8DCC4', '#F4ECD8']; 
  const defaultStamps = [
    { id: 'predeterminado_1', img: selloPredeterminado, name: 'Sello Clásico' }
  ];

  // Cargar los sellos del usuario al abrir la pantalla
  useEffect(() => {
    const storedStamps = JSON.parse(localStorage.getItem('mis_sellos') || '[]');
    setUserStamps(storedStamps);
  }, []);

  // --- FUNCIONES ---

  const handleSealLetter = () => {
    if (!letterText) {
      alert('Faltan datos: Escribe el texto principal de tu carta.');
      return;
    }
    setFormStep('closing');
  };

  const handleFinalizeLetter = () => {
    if (!remitenteText || !destinatarioText || !unlockDate) {
      alert('Faltan datos: Rellena remitente, destinatario y elige cuándo podrá abrirse la carta.');
      return;
    }

    const unlockTime = new Date(unlockDate).getTime();
    if (unlockTime <= Date.now()) {
      alert('La fecha de apertura debe ser en el futuro.');
      return;
    }

    let finalizeStamp;
    let finalizeStampId;

    if (stamp === 'predeterminado') {
      const selectedStamp = defaultStamps.find(s => s.id === stampId);
      if (!selectedStamp) {
        alert('Error: Sello predeterminado no encontrado.');
        return;
      }
      finalizeStamp = selectedStamp.img;
      finalizeStampId = selectedStamp.id;
    } else {
      const selectedUserStamp = userStamps.find(s => s.id === stampId);
      if (!selectedUserStamp) {
        alert('Faltan datos: Selecciona un sello personalizado o sube uno nuevo.');
        return;
      }
      finalizeStamp = selectedUserStamp.img;
      finalizeStampId = selectedUserStamp.id;
    }

    const dataToEncrypt = JSON.stringify({ 
      text: letterText, 
      reverseText: reverseText,
      paperColor: paperColor, 
      remitente: remitenteText,
      destinatario: destinatarioText,
      stamp: finalizeStamp, 
      stampId: finalizeStampId,
      unlockTime: unlockTime 
    });
    
    const encryptedCode = CryptoJS.AES.encrypt(dataToEncrypt, SECRET_KEY).toString();

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const fileName = `carta_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.carta`;

    const blob = new Blob([encryptedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Carta sellada y descargada como:\n${fileName}`);
    setScreen('main');
  };

  // Función para subir, comprimir y guardar un nuevo sello
  const handleStampUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // 1. Creamos una imagen en memoria con el archivo subido
      const img = new Image();
      
      // 2. Cuando la imagen cargue, la comprimimos
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150; // Tamaño perfecto para un sello sin ocupar memoria
        let width = img.width;
        let height = img.height;

        // Calculamos las nuevas proporciones
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        // Dibujamos la imagen encogida en el lienzo
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 3. Extraemos la imagen comprimida (en formato JPEG al 80% de calidad)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        const newStampId = `sello_user_${Date.now()}`;
        const newStamp = {
          id: newStampId,
          img: compressedBase64 // Guardamos la miniatura, no el original gigante
        };

        const updatedStamps = [...userStamps, newStamp];

        // 4. Intentamos guardar. Si falla, avisamos de forma amigable.
        try {
          localStorage.setItem('mis_sellos', JSON.stringify(updatedStamps));
          setUserStamps(updatedStamps);
          setStamp('personalizado');
          setStampId(newStampId);
        } catch (error) {
          alert('Tu colección de sellos está llena. Por favor, borra algún sello antiguo pulsando en la "X" antes de añadir uno nuevo.');
        }
      };
      
      // Le pasamos los datos a la imagen para que arranque el proceso
      img.src = e.target.result;
      
      // Reseteamos el input
      event.target.value = null; 
    };
    reader.readAsDataURL(file); 
  };
  

  // Función para borrar un sello
  const handleDeleteStamp = (idToDelete, event) => {
    event.stopPropagation(); // Evita que se seleccione el sello al intentar borrarlo
    
    const updatedStamps = userStamps.filter(s => s.id !== idToDelete);
    setUserStamps(updatedStamps);
    localStorage.setItem('mis_sellos', JSON.stringify(updatedStamps));

    // Si borramos el sello que estaba seleccionado, volvemos al predeterminado
    if (stampId === idToDelete) {
      setStamp('predeterminado');
      setStampId('predeterminado_1');
    }
  };


  // --- RENDERIZADO DE PANTALLAS ---

  if (formStep === 'writing') {
    return (
      <div style={{...styles.container, overflowY: 'auto', padding: '20px 30px'}}>
        <label style={styles.label}>Escribir carta:</label>
        <textarea
          style={{...styles.textArea, height: '150px'}}
          placeholder="Querido ..."
          value={letterText}
          onChange={(e) => setLetterText(e.target.value)}
        />

        <button style={{ ...styles.button, ...styles.primaryButton }} onClick={handleSealLetter}>
          Crear sobre
        </button>
        <button style={styles.cancelBtn} onClick={() => setScreen('main')}>
          Descartar y Volver
        </button>
      </div>
    );
  }

  if (formStep === 'closing') {
    // Buscar la imagen del sello seleccionado para mostrarla en el sobre
    let activeStampImage = null;
    if (stamp === 'predeterminado') {
      activeStampImage = defaultStamps.find(s => s.id === stampId)?.img;
    } else {
      activeStampImage = userStamps.find(s => s.id === stampId)?.img;
    }

    return (
      <div style={{...styles.container, overflowY: 'auto', padding: '20px 30px'}}>
        
        <div style={stylesSobre.envelopeContainer}>
          <div style={stylesSobre.topSection}>
            <div style={stylesSobre.addressBlock}>
              <span style={stylesSobre.label}>REMITENTE</span>
              <textarea
                style={{...stylesSobre.linedInput, height: '90px'}} 
                value={remitenteText}
                onChange={(e) => setRemitenteText(e.target.value)}
              />
            </div>

            {/* CAJA DEL SELLO EN EL SOBRE */}
            <div style={stylesSobre.stampBox}>
              <div style={stylesSobre.customStampPreview}>
                {activeStampImage ? (
                  <img 
                    src={activeStampImage} 
                    alt="Sello" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      // SOLUCIÓN: Efecto de sello infalible con CSS puro
                      border: '3px solid #FAF5EB', // Borde interior de papel
                      boxShadow: '0 0 0 1px #C1A68D, 1px 2px 4px rgba(0,0,0,0.1)', // Línea exterior y sombreado
                      backgroundColor: '#FAF5EB',
                      boxSizing: 'border-box'
                    }} 
                  />
                ) : (
                  <span style={stylesSobre.customStampPlaceholder}>Pegar<br/>Sello</span>
                )}
              </div>
            </div>
          </div>

          <div style={stylesSobre.destinatarioBlock}>
            <span style={stylesSobre.label}>DESTINATARIO</span>
            <textarea
                style={{...stylesSobre.linedInput, height: '120px'}} 
                value={destinatarioText}
                onChange={(e) => setDestinatarioText(e.target.value)}
              />
          </div>
        </div>

        {/* HERRAMIENTAS DE COLECCIÓN DE SELLOS */}
        <div style={stylesSobre.toolsArea}>
          <label style={{...styles.label, marginBottom: '10px', display: 'block'}}>COLECCIÓN DE SELLOS:</label>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleStampUpload} 
            />
            <button
              onClick={() => fileInputRef.current.click()}
              style={{
                ...stylesSobre.defaultStampSelectorButton,
                backgroundColor: '#FAF5EB',
                border: '1px dashed #8C271E',
              }}
              title="Añadir nuevo sello"
            >
              +
            </button>
            
            {userStamps.map(s => (
              <div key={s.id} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    setStamp('personalizado');
                    setStampId(s.id);
                  }}
                  style={{
                    ...stylesSobre.defaultStampSelectorButton,
                    backgroundColor: stampId === s.id && stamp === 'personalizado' ? '#FAF5EB' : '#E8DCC4',
                    border: stampId === s.id && stamp === 'personalizado' ? '3px solid #8C271E' : '1px solid #C1A68D',
                    overflow: 'hidden'
                  }}
                  title="Sello Propio"
                >
                  <img src={s.img} alt="Sello Propio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
                
                <button 
                  onClick={(e) => handleDeleteStamp(s.id, e)}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#8C271E',
                    color: '#F4ECD8',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 10
                  }}
                  title="Borrar Sello"
                >
                  ×
                </button>
              </div>
            ))}

            {userStamps.length > 0 && <div style={{ width: '1px', backgroundColor: '#C1A68D', margin: '0 5px', flexShrink: 0 }}></div>}

            {defaultStamps.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setStamp('predeterminado');
                  setStampId(s.id);
                }}
                style={{
                  ...stylesSobre.defaultStampSelectorButton,
                  backgroundColor: stampId === s.id && stamp === 'predeterminado' ? '#FAF5EB' : '#E8DCC4',
                  border: stampId === s.id && stamp === 'predeterminado' ? '3px solid #8C271E' : '1px solid #C1A68D',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
                title={s.name}
              >
                <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        <label style={styles.label}>No podrá abrirse hasta:</label>
        <input
          style={styles.input}
          type="datetime-local"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
        />
        
        <button style={{ ...styles.button, ...styles.primaryButton }} onClick={handleFinalizeLetter}>
          Sellar y Guardar Carta
        </button>
        <button style={styles.cancelBtn} onClick={() => setFormStep('writing')}>
          Atrás (Editar contenido)
        </button>
      </div>
    );
  }
}