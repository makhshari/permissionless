# Contributing to SwipeFi

Thank you for your interest in contributing to SwipeFi! We're excited to have you join our community of developers building the future of decentralized credit.

## 🤝 How to Contribute

### Types of Contributions

We welcome contributions in the following areas:

- **🐛 Bug Fixes**: Help us squash bugs and improve stability
- **✨ New Features**: Add new functionality to the platform
- **📚 Documentation**: Improve our docs, README, and code comments
- **🎨 UI/UX Improvements**: Enhance the user interface and experience
- **🔧 Smart Contracts**: Contribute to our Solidity contracts
- **🧪 Testing**: Add tests and improve test coverage
- **🌐 Localization**: Help translate the app to other languages

### Before You Start

1. **Check Existing Issues**: Look through existing issues and pull requests to avoid duplicates
2. **Join Our Community**: Connect with us on [Discord](https://discord.gg/swipefi) or [Twitter](https://twitter.com/SwipeFi)
3. **Read the Docs**: Familiarize yourself with our [documentation](https://docs.swipefi.com)

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Coinbase Wallet browser extension
- Base Sepolia testnet ETH

### Local Development

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/swipefi.git
   cd swipefi
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Compile Smart Contracts**
   ```bash
   npm run compile
   ```

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Follow the naming convention: `PascalCase` for components
- Keep components focused on a single responsibility
- Use proper TypeScript interfaces for props

### Solidity

- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use OpenZeppelin contracts when possible
- Add comprehensive NatSpec documentation
- Include events for important state changes

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Follow our design system colors and spacing
- Keep custom CSS minimal
- Use CSS variables for theme values

## 🔄 Git Workflow

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/amazing-feature`
- `fix/bug-description`
- `docs/update-readme`
- `refactor/component-name`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(wallet): add support for multiple wallet providers
fix(api): resolve transaction loading issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit Pull Request**
   - Use the PR template
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Link related issues

## 🧪 Testing

### Frontend Testing

- Write unit tests for utility functions
- Add integration tests for complex workflows
- Test wallet connection flows
- Verify responsive design

### Smart Contract Testing

- Write comprehensive unit tests
- Test edge cases and error conditions
- Verify gas optimization
- Test with different user scenarios

### Running Tests

```bash
# Frontend tests
npm run test

# Smart contract tests
npx hardhat test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📋 Issue Guidelines

### Bug Reports

When reporting bugs, please include:

- **Clear Description**: What happened vs. what you expected
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Environment**: Browser, OS, wallet version
- **Screenshots**: Visual evidence if applicable
- **Console Logs**: Any error messages or logs

### Feature Requests

When requesting features, please include:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Use Cases**: Who would benefit from this?
- **Mockups**: Visual examples if applicable

## 🏗️ Architecture Guidelines

### Frontend Architecture

- Keep components modular and reusable
- Use React hooks for state management
- Implement proper error boundaries
- Follow accessibility guidelines

### Smart Contract Architecture

- Use the latest Solidity version
- Implement proper access controls
- Include upgrade mechanisms where needed
- Follow security best practices

### API Design

- Use consistent naming conventions
- Implement proper error handling
- Add request/response validation
- Document all endpoints

## 🔒 Security

### Security Guidelines

- Never commit sensitive data (private keys, API keys)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Report security issues privately

### Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public issue
2. Email us at security@swipefi.com
3. Include detailed description and steps to reproduce
4. We'll respond within 48 hours

## 🎯 Project Roadmap

### Current Focus Areas

- **DeFi Integration**: Enhanced yield farming features
- **Mobile App**: React Native implementation
- **Merchant API**: Business integration tools
- **Governance**: DAO structure and voting mechanisms

### Contribution Priorities

1. **High Priority**: Bug fixes and security improvements
2. **Medium Priority**: Core feature enhancements
3. **Low Priority**: Nice-to-have features and optimizations

## 🏆 Recognition

### Contributor Recognition

- Contributors will be listed in our README
- Significant contributions will be highlighted in release notes
- Top contributors may be invited to join the core team
- We'll showcase your work on our social media

### Contribution Levels

- **Bronze**: 1-5 contributions
- **Silver**: 6-20 contributions  
- **Gold**: 21+ contributions
- **Platinum**: Core team member

## 📞 Getting Help

### Community Support

- **Discord**: [Join our community](https://discord.gg/swipefi)
- **GitHub Discussions**: Use the Discussions tab
- **Email**: dev@swipefi.com

### Development Help

- **Documentation**: [docs.swipefi.com](https://docs.swipefi.com)
- **Code Examples**: Check our examples directory
- **Architecture Guide**: See ARCHITECTURE.md

## 📄 License

By contributing to SwipeFi, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the future of decentralized credit! 🚀

**SwipeFi Team** 