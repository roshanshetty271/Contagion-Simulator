# Contributing to Contagion Simulator

Thank you for your interest in contributing to the Contagion Simulator! This document provides guidelines and instructions for contributing to the project.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Contagion-Simulator.git
   cd Contagion-Simulator
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Creating a Branch

Create a feature branch from `main`:
```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Making Changes

1. **Write clean, readable code** following the existing style
2. **Add TypeScript types** for all new code
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add time-series chart component"
   ```

### Commit Message Guidelines

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a Pull Request** on GitHub
3. **Describe your changes** clearly
4. **Link related issues** if applicable
5. **Wait for review** and address feedback

## 🧪 Testing

Before submitting a PR:

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## 📁 Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── controls/    # Simulation controls
│   ├── stats/       # Statistics display
│   ├── visualization/ # D3 visualizations
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── stores/          # Zustand state management
├── types/           # TypeScript definitions
└── workers/         # WebWorker logic
```

## 🎨 Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Follow existing patterns
- **Naming**: 
  - Components: PascalCase (`SimulationContainer`)
  - Files: PascalCase for components, camelCase for utilities
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Types/Interfaces: PascalCase

## 🐛 Reporting Bugs

Create an issue with:
- **Clear title** describing the bug
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment** (OS, browser, Node version)

## 💡 Feature Requests

Create an issue with:
- **Clear description** of the feature
- **Use case** - why is it needed?
- **Proposed solution** if you have one
- **Alternatives considered**

## 🔍 Areas for Contribution

Check out the [Improvement Plan](./docs/IMPROVEMENT_PLAN.md) for ideas:

### High Priority
- [ ] Add test coverage (unit, integration, e2e)
- [ ] Error boundaries and error handling
- [ ] Time-series charts for epidemic curves
- [ ] Export simulation results (CSV/JSON)

### Medium Priority
- [ ] Custom network upload (CSV/JSON)
- [ ] Tutorial/onboarding flow
- [ ] Comparison mode (side-by-side simulations)
- [ ] Network clustering visualization

### Nice to Have
- [ ] Internationalization (i18n)
- [ ] Mobile responsiveness improvements
- [ ] Share simulation via URL
- [ ] Animation recording (GIF/video export)

## 📖 Resources

- **D3.js Documentation**: https://d3js.org/
- **Next.js Documentation**: https://nextjs.org/docs
- **Zustand Documentation**: https://zustand-demo.pmnd.rs/
- **Network Science**: Newman, M. (2018). Networks (2nd ed.)
- **SIR Models**: Kermack & McKendrick (1927)

## 🙏 Recognition

Contributors will be recognized in the README and release notes.

## ❓ Questions

- **Discord**: [Coming soon]
- **Email**: roshanshetty271@gmail.com
- **GitHub Issues**: For bug reports and feature requests

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Contagion Simulator! 🦠📊
