import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

/*function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/

// src/App.tsx
// src/App.tsx
import { Layout } from "./core/Layout";

function App() {
  return (
    <Layout>
      <div className="glass-card p-8 text-center border-emerald/10">
        <div className="w-20 h-20 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald/20 text-emerald text-4xl">
          <i className="fas fa-vault"></i>
        </div>
        <h2 className="text-2xl font-bold font-display mb-3">
          Welcome to the Vault
        </h2>
        <p className="text-text-secondary leading-relaxed">
          Your financial data is stored locally. No cloud, no tracking, just
          your phone.
        </p>

        <button className="w-full mt-8 bg-emerald hover:bg-emerald-dark text-obsidian font-bold py-4 rounded-card transition-all transform active:scale-95 shadow-emerald-glow">
          Initialize My Wallet
        </button>
      </div>
    </Layout>
  );
}

export default App;
