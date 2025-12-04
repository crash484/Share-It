# Share-It Architecture Documentation

## System Architecture Overview

This document provides detailed architectural information about the Share-It file sharing application.

## Technology Stack

### Backend Layer
```
┌─────────────────────────────────────┐
│         Backend Stack               │
├─────────────────────────────────────┤
│  • Node.js (Runtime)                │
│  • Express.js (Web Framework)       │
│  • express-formidable (File Upload) │
│  • express-session (Sessions)       │
│  • bcrypt (Password Hashing)        │
│  • fs (File System)                 │
└─────────────────────────────────────┘
```

### Database Layer
```
┌─────────────────────────────────────┐
│         Database Layer              │
├─────────────────────────────────────┤
│  • MongoDB 3.6+                     │
│  • Collections:                     │
│    - users                          │
│    - public_links                   │
└─────────────────────────────────────┘
```

### Frontend Layer
```
┌─────────────────────────────────────┐
│         Frontend Stack              │
├─────────────────────────────────────┤
│  • EJS (Templating)                 │
│  • Vue.js 3 (Interactivity)         │
│  • Bootstrap (UI Framework)         │
│  • jQuery (DOM Manipulation)        │
│  • SweetAlert (Alerts)              │
│  • Font Awesome (Icons)             │
└─────────────────────────────────────┘
```

## Request Flow Architecture

### Complete Request Cycle

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│      Express Middleware             │
├─────────────────────────────────────┤
│  1. express-formidable (parse)      │
│  2. express-session (auth)          │
│  3. custom middleware (user state)  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Route Handler                  │
├─────────────────────────────────────┤
│  • Authentication check             │
│  • Business logic                   │
│  • Database operations              │
│  • File system operations           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Response Generation            │
├─────────────────────────────────────┤
│  • EJS template rendering           │
│  • JSON response (AJAX)             │
│  • File download                    │
│  • Redirects                        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Browser   │
└─────────────┘
```

## Data Flow Diagrams

### User Registration Flow

```
┌─────────┐     POST /Register      ┌─────────┐
│ Browser │────────────────────────►│ Server  │
└─────────┘                         └────┬────┘
                                         │
                                    1. Validate input
                                         │
                                    2. Check email exists
                                         │
                                         ▼
                                    ┌─────────┐
                                    │ MongoDB │
                                    └────┬────┘
                                         │
                                    3. Generate key
                                         │
                                    4. Hash password
                                         │
                                    5. Insert user
                                         │
┌─────────┐     Success/Error       ┌────┴────┐
│ Browser │◄───────────────────────│ Server  │
└─────────┘                         └─────────┘
```

### File Upload Flow

```
┌─────────┐                         ┌─────────┐
│ Browser │     Select File         │  User   │
└────┬────┘                         └─────────┘
     │
     │ POST /UploadFile (multipart)
     ▼
┌─────────────────────────────────────────┐
│              Server                      │
├─────────────────────────────────────────┤
│  1. Receive file (temp location)        │
│  2. Read file into buffer               │
│  3. Encrypt with user's key (XOR)       │
│  4. Save to uploads/{email}/            │
│  5. Generate metadata                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│              MongoDB                     │
├─────────────────────────────────────────┤
│  Update user.uploaded array             │
│  {                                      │
│    _id, name, type, size,               │
│    filePath, createdAt                  │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          File System                     │
├─────────────────────────────────────────┤
│  public/uploads/{email}/                │
│    {timestamp}-{filename}               │
│  (encrypted with XOR)                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────┐        Redirect          ┌────────┐
│ Browser │◄───────────────────────  │ Server │
└─────────┘      to /MyUploads       └────────┘
```

### Share Link Generation Flow

```
┌─────────┐   POST /ShareViaLink   ┌─────────┐
│ Browser │──────────────────────►│ Server  │
└─────────┘      {_id}             └────┬────┘
                                        │
                                   1. Verify user auth
                                        │
                                   2. Find file by _id
                                        ▼
                                   ┌─────────┐
                                   │ MongoDB │
                                   │  users  │
                                   └────┬────┘
                                        │
                                   3. Get file data
                                        │
                                   4. Generate hash
                                      bcrypt(filename)
                                        │
                                   5. Extract substring
                                        │
                                   6. Create link object
                                        ▼
                                   ┌─────────────┐
                                   │  MongoDB    │
                                   │public_links │
                                   └──────┬──────┘
                                          │
                                   7. Insert record
                                          │
┌─────────┐    Redirect + Link     ┌─────┴──────┐
│ Browser │◄──────────────────────│   Server   │
└─────────┘  /SharedViaLink/hash   └────────────┘
```

### File Download Flow

```
┌─────────┐                         ┌─────────┐
│ Browser │   POST /DownloadFile    │ Server  │
└────┬────┘        {_id}            └────┬────┘
     │                                   │
     │                              1. Check auth OR
     │                                 public link
     │                                   │
     │                                   ▼
     │                              ┌─────────┐
     │                              │ MongoDB │
     │                              └────┬────┘
     │                                   │
     │                              2. Find file
     │                                metadata
     │                                   │
     │                                   ▼
     │                              ┌─────────────┐
     │                              │ File System │
     │                              └──────┬──────┘
     │                                     │
     │                              3. Read encrypted
     │                                 file from disk
     │                                     │
     │                              4. Decrypt with key
     │                                  (XOR operation)
     │                                     │
     ▼                                     ▼
┌─────────────────────────────────────────────┐
│            Browser receives                  │
├─────────────────────────────────────────────┤
│  • arrayBuffer (decrypted data)             │
│  • fileType                                 │
│  • fileName                                 │
│  → Triggers download via Blob               │
└─────────────────────────────────────────────┘
```

## Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────┐
│         Security Layers                  │
├──────────────────────────────────────────┤
│                                          │
│  Layer 1: Session Management             │
│  ├─ Express Session                      │
│  ├─ Cookie-based                         │
│  └─ Server-side storage                  │
│                                          │
│  Layer 2: Password Security              │
│  ├─ Bcrypt hashing (10 rounds)          │
│  ├─ No plaintext storage                │
│  └─ Salted hashes                        │
│                                          │
│  Layer 3: File Encryption                │
│  ├─ User-specific keys                   │
│  ├─ XOR encryption                       │
│  └─ Encrypted at rest                    │
│                                          │
│  Layer 4: Access Control                 │
│  ├─ Owner verification                   │
│  ├─ Public link validation               │
│  └─ Route protection                     │
│                                          │
└──────────────────────────────────────────┘
```

### Encryption Process Detail

```
File Upload Encryption:
─────────────────────────
Input: Original File (bytes)
Key:   User's encryption key (string)

Process:
┌─────────────────────────────────────┐
│ for i = 0 to file.length:           │
│    encrypted[i] = original[i] XOR   │
│                   key[i % key.len]  │
└─────────────────────────────────────┘

Output: Encrypted File (bytes)


File Download Decryption:
─────────────────────────
Input: Encrypted File (bytes)
Key:   User's encryption key (string)

Process:
┌─────────────────────────────────────┐
│ for i = 0 to file.length:           │
│    decrypted[i] = encrypted[i] XOR  │
│                   key[i % key.len]  │
└─────────────────────────────────────┘

Output: Original File (bytes)

Note: XOR is symmetric - same operation
      for encryption and decryption
```

## Database Schema Architecture

### Users Collection

```javascript
users: {
  _id: ObjectId,                    // MongoDB auto-generated
  name: String,                     // User's full name
  email: String,                    // Unique, used for login
  password: String,                 // Bcrypt hashed
  encryptionKey: String,            // 6-12 char random key
  isVerified: Boolean,              // Email verification status
  verification_token: Number,       // Email verification token
  reset_token: String,              // Password reset token
  uploaded: [                       // Array of uploaded files
    {
      _id: ObjectId,                // File unique ID
      name: String,                 // Original filename
      type: String,                 // MIME type
      size: Number,                 // File size in bytes
      filePath: String,             // Disk path to encrypted file
      createdAt: Number             // Timestamp
    }
  ]
}

Indexes:
  - email: unique
  - _id: default
```

### Public Links Collection

```javascript
public_links: {
  _id: ObjectId,                    // Link unique ID
  hash: String,                     // 10-char unique hash
  file: {                           // Copy of file object
    _id: ObjectId,
    name: String,
    type: String,
    size: Number,
    filePath: String
  },
  uploadedBy: {                     // Owner information
    _id: ObjectId,
    name: String,
    email: String
  },
  createdAt: Number                 // Timestamp
}

Indexes:
  - hash: unique
  - uploadedBy._id: for user queries
  - file._id: for file lookup
```

## File System Architecture

### Directory Structure

```
public/uploads/
│
├── user1@example.com/
│   ├── 1234567890-document.pdf (encrypted)
│   ├── 1234567891-image.jpg (encrypted)
│   └── 1234567892-video.mp4 (encrypted)
│
├── user2@example.com/
│   ├── 1234567893-file1.txt (encrypted)
│   └── 1234567894-file2.doc (encrypted)
│
└── user3@example.com/
    └── 1234567895-photo.png (encrypted)

Naming Convention:
  {timestamp}-{original_filename}

Storage:
  - Files stored with original names
  - Prefixed with timestamp to avoid conflicts
  - All files encrypted with user's key
  - Organized by user email
```

## API Architecture

### Route Organization

```
Authentication Routes:
├── GET  /               → Home page
├── GET  /Register       → Registration form
├── POST /Register       → Create account
├── GET  /Login          → Login form
├── POST /Login          → Authenticate
└── GET  /Logout         → End session

File Management Routes:
├── GET  /MyUploads      → List uploaded files
├── POST /UploadFile     → Upload new file
├── POST /DownloadFile   → Download file
└── POST /DeleteFile     → Delete file

Sharing Routes:
├── POST /ShareViaLink         → Generate share link
├── GET  /MySharedLinks        → List all shared links
├── GET  /SharedViaLink/:hash  → Public file access
└── POST /DeleteLink           → Remove share link
```

### Middleware Chain

```
Request
   │
   ▼
┌──────────────────────┐
│ express-formidable   │  Parse form data & files
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ express-session      │  Load session data
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Custom Middleware    │  Attach mainURL, isLogin, user
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Route Handler        │  Process request
└──────┬───────────────┘
       │
       ▼
    Response
```

## Performance Considerations

### Current Architecture Characteristics

**Strengths:**
- Simple and straightforward architecture
- Direct file system access (fast I/O)
- Minimal dependencies
- Session-based auth (no token overhead)

**Limitations:**
- Synchronous encryption (blocks on large files)
- No file chunking
- No caching layer
- Single server deployment

### Scaling Considerations

For production/high-traffic scenarios:

```
Potential Architecture Evolution:

Current:
┌────────┐     ┌────────┐     ┌─────────┐
│Browser │────►│Server  │────►│ MongoDB │
└────────┘     └────┬───┘     └─────────┘
                    │
                    ▼
               ┌─────────┐
               │   Disk  │
               └─────────┘

Scalable:
┌────────┐     ┌─────────┐     ┌─────────┐
│Browser │────►│Load Bal.│────►│Server 1 │─┐
└────────┘     └─────────┘     └─────────┘ │
                                            │
               ┌─────────┐                  │
               │Server 2 │─┐                │
               └─────────┘ │                │
                          ▼                ▼
                     ┌─────────┐     ┌─────────┐
                     │ MongoDB │     │  S3 /   │
                     │ Replica │     │  CDN    │
                     └─────────┘     └─────────┘
```

## Code Organization

### Main Application (server.js)

```
server.js Structure:
├── Dependencies & Setup (lines 1-62)
│   ├── Require modules
│   ├── Configure middleware
│   ├── Set up sessions
│   └── Define static routes
│
├── Utility Functions (lines 63-159)
│   ├── recursiveGetFile()
│   ├── removeFileReturnUpdated()
│   ├── generateEncryptionKey()
│   ├── encryptFile()
│   └── decryptFile()
│
├── Server Start & DB Connection (lines 166-180)
│   ├── HTTP server listen
│   └── MongoDB connection
│
└── Route Handlers (lines 184-626)
    ├── Link Management (lines 184-308)
    ├── File Operations (lines 311-513)
    └── Authentication (lines 516-625)
```

## Session Management

### Session Flow

```
Login:
┌────────────────────────────────────┐
│ POST /Login                        │
│  → Validate credentials            │
│  → Create session                  │
│  → Store user object in session    │
│     request.session.user = user    │
└────────────────────────────────────┘

Authenticated Request:
┌────────────────────────────────────┐
│ Any protected route                │
│  → Load session from cookie        │
│  → Check request.session.user      │
│  → Allow/deny access               │
└────────────────────────────────────┘

Logout:
┌────────────────────────────────────┐
│ GET /Logout                        │
│  → Destroy session                 │
│  → Clear cookie                    │
│  → Redirect to home                │
└────────────────────────────────────┘
```

## Error Handling

### Current Error Handling Strategy

```
┌─────────────────────────────────────┐
│ Error Handling Patterns             │
├─────────────────────────────────────┤
│                                     │
│ 1. Validation Errors                │
│    → Set request.status = "error"   │
│    → Set request.message            │
│    → Re-render form                 │
│                                     │
│ 2. Not Found Errors                 │
│    → Check for null results         │
│    → Redirect with session msg      │
│                                     │
│ 3. File System Errors               │
│    → Try-catch blocks               │
│    → Return JSON error response     │
│                                     │
│ 4. Authentication Errors            │
│    → Redirect to /Login             │
│                                     │
└─────────────────────────────────────┘
```

## Frontend Architecture

### View Layer Structure

```
Views (EJS Templates):
├── Layout Components
│   ├── includes/header.ejs    → Navigation, CSS
│   ├── includes/footer.ejs    → Scripts, closing tags
│   └── includes/ResponseAlert.ejs → Flash messages
│
├── Public Pages
│   ├── index.ejs              → Landing page
│   ├── Login.ejs              → Authentication
│   ├── Register.ejs           → User signup
│   └── SharedViaLink.ejs      → Public file view
│
└── Protected Pages
    ├── MyUploads.ejs          → File management
    └── MySharedLinks.ejs      → Link management
```

### Client-Side Interaction

```
Vue.js 3 Integration:
┌─────────────────────────────────────┐
│ Each page has Vue app instance      │
├─────────────────────────────────────┤
│ Vue.createApp({                     │
│   data() { return {...} },          │
│   methods: {...}                    │
│ }).mount("#appId");                 │
└─────────────────────────────────────┘

jQuery for:
- AJAX file downloads
- Modal management
- Form handling
- SweetAlert dialogs
```

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────┐
│ Development Setup                   │
├─────────────────────────────────────┤
│ • Node.js (local)                   │
│ • MongoDB (local)                   │
│ • Nodemon (auto-restart)            │
│ • Port: 3000                        │
│ • Base URL: http://localhost:3000   │
└─────────────────────────────────────┘
```

### Production Recommendations

```
┌─────────────────────────────────────┐
│ Production Architecture             │
├─────────────────────────────────────┤
│ • Node.js with PM2/Forever          │
│ • MongoDB Atlas or Replica Set      │
│ • Nginx (reverse proxy)             │
│ • HTTPS/SSL                         │
│ • Environment variables             │
│ • Logging system                    │
│ • Monitoring (New Relic, etc.)      │
└─────────────────────────────────────┘
```

---

This architecture documentation provides a comprehensive overview of the Share-It application's structure, data flow, and design decisions.
