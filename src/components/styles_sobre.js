export const stylesSobre = {
  envelopeContainer: {
    width: '100%',
    backgroundColor: '#FAF5EB', // Color base del papel
    border: '1px solid #C1A68D',
    borderRadius: '8px',
    boxShadow: '2px 4px 12px rgba(0,0,0,0.15)',
    marginBottom: '20px',
    padding: '25px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    // Opcional: un ligero color más oscuro en los bordes para simular envejecido
    backgroundImage: 'radial-gradient(circle at center, transparent 70%, rgba(193, 166, 141, 0.1) 100%)'
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  addressBlock: {
    display: 'flex',
    flexDirection: 'column',
    width: '55%'
  },
  destinatarioBlock: {
    display: 'flex',
    flexDirection: 'column',
    width: '70%',
    alignSelf: 'flex-end', // Lo empuja a la derecha
    marginTop: '15px'
  },
  label: {
    fontFamily: 'serif',
    fontSize: '12px',
    color: '#8c7b68',
    letterSpacing: '2px',
    marginBottom: '5px'
  },
  // Magia CSS: Un textarea con líneas de fondo que coinciden con el texto
  linedInput: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'serif',
    fontSize: '16px',
    lineHeight: '30px', // Altura de cada línea
    // Dibuja las líneas horizontales
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, #C1A68D 29px, #C1A68D 30px)',
    color: '#4A3B32',
    resize: 'none',
    overflow: 'hidden'
  },
  stampBox: {
    width: '80px',
    height: '100px',
    border: '2px dashed #C1A68D', 
    padding: '0',
    backgroundColor: '#F4ECD8'
  },
  customStampPreview: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF5EB',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  customStampPlaceholder: {
    fontSize: '14px',
    color: '#8c7b68',
    fontFamily: 'serif',
    textAlign: 'center'
  },
  customStampImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  // Herramientas fuera del sobre
  toolsArea: {
    backgroundColor: '#E8DCC4',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #C1A68D'
  },
  defaultStampSelectorButton: {
    width: '50px',
    height: '60px',
    borderRadius: '4px',
    fontSize: '24px',
    color: '#8C271E',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  }
};