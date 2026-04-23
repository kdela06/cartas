import React, { useState } from 'react';

import EscribirCarta from './components/EscribirCarta'; 
import Main from './components/Main';
import RecibirCarta from './components/RecibirCarta';
import Biblioteca from './components/Biblioteca';

export default function App() {
  const [screen, setScreen] = useState('main'); 

  return (
    <div>
      {screen === 'main' && <Main setScreen={setScreen} />}
      {screen === 'escribir' && <EscribirCarta setScreen={setScreen} />}
      {screen === 'recibir' && <RecibirCarta setScreen={setScreen} />}
      {screen === 'biblioteca' && <Biblioteca setScreen={setScreen} />}
    </div>
  );
}