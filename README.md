# 🦠 Contagion Simulator

A real-time network cascade visualization that simulates both **epidemic spread** and **financial contagion** through interconnected systems.

## ✨ Features

### Dual Simulation Modes

| Mode | Model | Demo Scenario |
|------|-------|---------------|
| **Epidemic** | SIR+ (Susceptible → Infected → Recovered → Deceased) | "Watch herd immunity stop an outbreak" |
| **Financial** | Systemic Risk (bank defaults cascade through interlinked institutions) | "Click a hub bank — watch the system collapse" |

### Technical Highlights

- **Real-time D3.js Force Simulation** — 200+ nodes at 60fps
- **WebWorker Architecture** — State transitions offloaded for smooth rendering
- **Interactive Parameters** — Sliders affect simulation instantly
- **Deterministic Demo Presets** — Guaranteed impressive results
- **Color-Blind Safe Palette** — Paul Tol's scheme available
- **Keyboard Shortcuts** — Professional-grade UX

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `R` | Reset simulation |
| `→` | Step forward |
| `1` | Switch to Epidemic mode |
| `2` | Switch to Financial mode |
| `C` | Toggle color-blind mode |

**Mouse:**
- **Click node** — Infect (epidemic) or Shock (financial)
- **Drag node** — Reposition
- **Scroll** — Zoom in/out
- **Drag canvas** — Pan

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 MAIN THREAD                          │
│  React UI ← Zustand Store ← D3.js Visualization     │
│  (controls)   (state)       (force sim + render)    │
└──────────────────────┬──────────────────────────────┘
                       │ postMessage
┌──────────────────────┴──────────────────────────────┐
│                  WEB WORKER                          │
│  SimulationEngine: state transitions, infection     │
│  probability, cascade logic, stats aggregation      │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **D3 owns the DOM** — React renders container, D3 handles nodes/links
2. **Dual tick rates** — 60fps physics, 10-30fps state simulation
3. **CSS transforms** — GPU-accelerated positioning
4. **Zustand subscriptions** — Granular re-renders via `subscribeWithSelector`

## 📊 Simulation Models

### Epidemic (SIR+)

**States:** SUSCEPTIBLE → INFECTED → RECOVERED/DECEASED

**Parameters:**
- **β (Beta)** — Infection probability per contact
- **γ (Gamma)** — Recovery probability per tick
- **μ (Mu)** — Mortality probability while infected
- **Vaccination Rate** — % of population immune at start

**Infection Probability:**
```
P(infection) = 1 - (1 - β)^(infected_neighbors)
```

### Financial (Systemic Risk)

**States:** HEALTHY → STRESSED → DISTRESSED → DEFAULTED/BAILED_OUT

**Parameters:**
- **Leverage Ratio** — Debt/Equity (higher = riskier)
- **Capital Buffer** — Minimum capital requirement
- **Correlation Factor** — How linked asset prices are
- **Fire Sale Discount** — Price drop when distressed sell
- **Bailout Threshold** — Minimum size for government rescue

**Cascade Mechanism:**
1. Initial shock reduces capital ratio
2. Direct exposure losses from defaults
3. Fire sale contagion (mark-to-market losses)
4. Feedback loop until system stabilizes

## 🔧 Tech Stack

- **Next.js 14** — App Router, React Server Components
- **TypeScript** — Strict mode for type safety
- **D3.js v7** — Force simulation, transitions, zoom
- **Zustand v4** — State management with subscriptions
- **Tailwind CSS** — Utility-first styling
- **Lucide React** — Icon library
- **graphology** — Network generation algorithms

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── controls/        # Parameter sliders, playback
│   ├── layout/          # Header, Sidebar
│   ├── overlays/        # Modals, loading states
│   ├── settings/        # Accessibility options
│   ├── stats/           # Statistics display
│   ├── ui/              # Reusable UI components
│   └── visualization/   # D3 network, legend, tooltip
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useSimulationWorker.ts
├── lib/
│   ├── colors.ts        # Color utilities
│   ├── networkGenerators.ts  # Topology algorithms
│   ├── presets.ts       # Demo presets
│   └── utils.ts         # General utilities
├── stores/
│   └── simulationStore.ts    # Zustand store
├── types/
│   └── index.ts         # TypeScript definitions
└── workers/
    ├── SimulationEngine.ts   # Core simulation logic
    └── simulationWorker.ts   # WebWorker entry
```

## 🎯 Demo Presets

### Epidemic Presets
- **Dramatic Outbreak** — High β, slow γ, infect the super-spreader
- **Herd Immunity** — 65% vaccination stops the outbreak
- **Slow Burn** — Low infection rate through dense network
- **Rapid Recovery** — Fast recovery limits spread

### Financial Presets
- **Too Big to Fail** — Shock largest bank, watch cascade
- **Bailout Intervention** — Same shock, bailouts prevent collapse
- **Isolated Failure** — Low correlation contains damage
- **Contagion Cascade** — High correlation causes system collapse

## 📈 Performance

Targets:
- **200+ nodes** at 60fps
- **<2s** initial load
- **<200KB** gzipped bundle

Optimizations:
- WebWorker offloads state logic
- CSS transforms for GPU acceleration
- Throttled store updates
- Memoized D3 bindings

## 🎨 Design System

**Colors:**
- Canvas: `#0a0a0f`
- Panel: `#111118`
- Accent: `#6366f1` (Indigo)

**Node States:**
| State | Standard | Color-Blind Safe |
|-------|----------|------------------|
| Susceptible/Healthy | `#3b82f6` | `#4477AA` |
| Infected/Distressed | `#ef4444` | `#EE6677` |
| Recovered | `#22c55e` | `#228833` |
| Stressed | `#f59e0b` | `#CCBB44` |
| Deceased/Defaulted | `#6b7280` | `#BBBBBB` |
| Vaccinated/Bailed Out | `#a855f7` | `#AA3377` |

## 🧪 Testing Scenarios

1. **Scale-free + High β** — Hub infection causes rapid spread
2. **Small-world + Vaccination** — Test herd immunity threshold
3. **Random + High Correlation** — Financial cascade speed
4. **Scale-free + Bailouts** — "Too big to fail" intervention

## 📄 License

MIT

## 👤 Author

**Roshan Shetty**
- Portfolio: [roshanshetty.dev](https://roshanshetty.dev)
- LinkedIn: [/in/roshanshetty271](https://linkedin.com/in/roshanshetty271)
- GitHub: [/roshanshetty271](https://github.com/roshanshetty271)

---

*"Watch diseases spread through populations or financial crises cascade through banking networks — in real-time, in your browser."*
