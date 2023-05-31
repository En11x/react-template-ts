import { useState } from 'react';
import '@/App.css';
import { LazyWrapper } from '@/components/LazyWrapper';
import { Counter } from './components/Count';

function App() {
  const [show, setShow] = useState(false);

  return (
    <div>
      A useful React-ts Template
      <button onClick={() => setShow(true)}>show</button>
      {show && <LazyWrapper path='LazyDemo' />}
      <Counter />
    </div>
  );
}

export default App;
