import { useState } from 'react'

import './App.css'
import Chat from './assets/components/Chat.jsx'
import Nav from './assets/components/nav.jsx';
import Storage from './assets/components/Storage.jsx';

function App() {

  return (
    <div className='app'>
      <div className='Nav'>
      <Nav />
      </div>
      <div className='Storage'>
      <Storage />
      </div>
      <div className='Chat'>
      <Chat />
      </div>
    </div>
  )
}

export default App

