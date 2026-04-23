import React from 'react';
import { styles } from './styles';
import buzon from '../imagenes/buzon.png';
import carta from '../imagenes/carta.png';
import caja from '../imagenes/caja.png';

export default function Main({ setScreen }) {
  return (
    <div style={styles.container}>

      <button 
        onClick={() => setScreen('escribir')}
        style={{
          position: 'absolute', 
          top: '30px',          
          right: '30px',             
          backgroundColor: 'transparent', 
          border: 'none',
          padding: '0',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'transform 0.2s'
        }}
        title="Escribir Nueva Carta"
      >
        <img 
          src={carta} 
          alt="Nueva Carta" 
          style={{ 
            width: '100px',  
            height: '100px', 
            objectFit: 'contain' 
          }} 
        />
      </button>

      <button 
        onClick={() => setScreen('biblioteca')}
        style={{
          position: 'absolute', 
          top: '30px',          
          left: '30px',             
          backgroundColor: 'transparent', 
          border: 'none',
          padding: '0',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'transform 0.2s'
        }}
        title="Ver Biblioteca"
      >
        <img 
          src={caja} 
          alt="Biblioteca" 
          style={{ 
            width: '100px',  
            height: '100px', 
            objectFit: 'contain' 
          }} 
        />
      </button>

      <button 
        onClick={() => setScreen('recibir')}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center', 
          width: '100%',            
          marginTop: '100px',
          marginBottom: '30px',     
          transition: 'transform 0.2s',
        }}
      >
        <img
          src={buzon}
          alt="Abrir Buzón"
          style={{ 
            width: '300px', 
            height: '300px', 
            objectFit: 'contain' 
          }}
        />
      </button>
    </div>
  );
}