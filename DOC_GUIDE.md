# Documentation Guide

Welcome to the Share-It documentation! This guide will help you navigate the available documentation based on your needs.

## Quick Links

- 📖 [README.md](README.md) - Main project documentation
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed technical architecture
- 💻 [server.js](server.js) - Main application source code

## For Different Audiences

### 👤 End Users
**Start here:** [README.md](README.md)

Read these sections:
- Overview
- Features
- Installation
- Usage

### 👨‍💻 Developers New to the Project
**Start here:** [README.md](README.md)

Follow this path:
1. Read "Overview" and "Features"
2. Review "Technology Stack"
3. Follow "Installation" steps
4. Study "How It Works" section
5. Review "API Endpoints"
6. Check "Project Structure"

Then move to [ARCHITECTURE.md](ARCHITECTURE.md):
1. "System Architecture Overview"
2. "Request Flow Architecture"
3. "Data Flow Diagrams"

### 🔧 Contributors & Maintainers
**Start here:** [README.md](README.md) then [ARCHITECTURE.md](ARCHITECTURE.md)

Key sections:
- README.md:
  - Technology Stack
  - API Endpoints
  - Security Features
  - Database Schema
  
- ARCHITECTURE.md:
  - Complete architecture diagrams
  - All data flow diagrams
  - Code organization
  - Security architecture

### 🔒 Security Auditors
**Focus on:** [README.md](README.md) Security sections + [ARCHITECTURE.md](ARCHITECTURE.md)

Critical sections:
- README.md:
  - "Security Features"
  - "Security Considerations"
  - "Production Recommendations"
  
- ARCHITECTURE.md:
  - "Security Architecture"
  - "Encryption Process Detail"

### 🚀 DevOps / Deployment Engineers
**Focus on:** [README.md](README.md) Installation & Configuration

Key sections:
- "Installation"
- "Configuration"
- "Production Recommendations"
- ARCHITECTURE.md: "Deployment Architecture"

## Documentation Structure

### README.md (Main Documentation)
Comprehensive guide covering:
- ✅ What the project does
- ✅ Key features
- ✅ How to install and run
- ✅ How to use the application
- ✅ API reference
- ✅ Security information
- ✅ Development guidelines

**Best for:** Getting started, understanding features, and daily reference

### ARCHITECTURE.md (Technical Deep Dive)
Detailed technical documentation with:
- ✅ System architecture diagrams
- ✅ Request/response flows
- ✅ Data flow visualizations
- ✅ Database schemas
- ✅ Security architecture
- ✅ Code organization
- ✅ Scaling considerations

**Best for:** Understanding internals, making changes, and troubleshooting

## Common Use Cases

### "I want to run this project"
1. Read [README.md - Installation](README.md#installation)
2. Follow the step-by-step guide
3. Check [README.md - Configuration](README.md#configuration) if needed

### "I need to understand how it works"
1. Read [README.md - Overview](README.md#overview)
2. Study [README.md - How It Works](README.md#how-it-works)
3. Review [ARCHITECTURE.md - Data Flow Diagrams](ARCHITECTURE.md#data-flow-diagrams)

### "I want to add a new feature"
1. Understand current architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
2. Review API endpoints: [README.md - API Endpoints](README.md#api-endpoints)
3. Study code organization: [ARCHITECTURE.md - Code Organization](ARCHITECTURE.md#code-organization)
4. Check database schema: [README.md - Database Schema](README.md#database-schema)

### "I need to fix a security issue"
1. Review [README.md - Security Features](README.md#security-features)
2. Study [ARCHITECTURE.md - Security Architecture](ARCHITECTURE.md#security-architecture)
3. Check [README.md - Production Recommendations](README.md#security-considerations)

### "I'm deploying to production"
1. Follow [README.md - Installation](README.md#installation)
2. **CRITICAL:** Review [README.md - Production Recommendations](README.md#security-considerations)
3. Configure environment: [README.md - Configuration](README.md#configuration)
4. Consider scaling: [ARCHITECTURE.md - Scaling Considerations](ARCHITECTURE.md#scaling-considerations)

### "I need to understand the file upload process"
1. High-level: [README.md - How It Works - File Upload Flow](README.md#2-file-upload-flow)
2. Detailed: [ARCHITECTURE.md - File Upload Flow](ARCHITECTURE.md#file-upload-flow)
3. Code: See `server.js` lines 440-513

### "I want to understand encryption"
1. Overview: [README.md - Security Features - File Encryption](README.md#2-file-encryption)
2. Details: [ARCHITECTURE.md - Encryption Process Detail](ARCHITECTURE.md#encryption-process-detail)
3. Code: See `server.js` lines 113-159 (encryption functions)

## Key Features Explained

### User Authentication
- **Where:** Lines 516-625 in server.js
- **Docs:** 
  - README.md: "Features - User Authentication"
  - ARCHITECTURE.md: "Authentication & Authorization"

### File Upload & Encryption
- **Where:** Lines 440-513 in server.js
- **Docs:**
  - README.md: "How It Works - File Upload Flow"
  - ARCHITECTURE.md: "File Upload Flow" diagram

### Link Sharing
- **Where:** Lines 265-308 in server.js
- **Docs:**
  - README.md: "How It Works - Link Sharing Flow"
  - ARCHITECTURE.md: "Share Link Generation Flow"

### File Download & Decryption
- **Where:** Lines 341-416 in server.js
- **Docs:**
  - README.md: "How It Works - File Download Flow"
  - ARCHITECTURE.md: "File Download Flow"

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **bcrypt** - Password hashing

### Frontend
- **EJS** - Templating
- **Vue.js 3** - Interactivity
- **Bootstrap** - Styling
- **jQuery** - DOM manipulation

### Security
- **bcrypt** - Password hashing
- **Custom XOR** - File encryption
- **Express sessions** - Authentication

## Quick Reference

### Important Files
- `server.js` - Main application (627 lines)
- `package.json` - Dependencies
- `views/*.ejs` - Frontend templates
- `public/` - Static assets

### Port & URL
- Development: `http://localhost:3000`
- MongoDB: `mongodb://127.0.0.1:27017`
- Database: `file_transfer`

### Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Direct start
node server.js
```

## Need More Help?

### Documentation Issues
If you find errors or missing information in the documentation:
1. Check both README.md and ARCHITECTURE.md
2. Review the source code in server.js
3. Open an issue on the repository

### Code Questions
For questions about how the code works:
1. Start with the relevant flow diagram in ARCHITECTURE.md
2. Find the corresponding code section using line numbers
3. Review related functions and routes

### Feature Requests
To request new features or improvements:
1. Understand current architecture
2. Check if similar functionality exists
3. Open an issue with your proposal

## Document Versions

- **README.md**: Main documentation (529 lines)
- **ARCHITECTURE.md**: Technical documentation (666 lines)
- **DOC_GUIDE.md**: This navigation guide

Last updated: 2025-12-04

---

**Happy coding! 🚀**
