# Share-It - File Sharing Application

A secure web-based file sharing application built with Node.js, Express, and MongoDB that allows users to upload, manage, and share files via generated links.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)

## Overview

Share-It is a file sharing platform that enables users to:
- Upload files securely with automatic encryption
- Manage their uploaded files
- Generate shareable links for files
- Download files with automatic decryption
- Track and manage shared links

## Features

### 1. User Authentication
- **Registration**: New users can create accounts with name, email, and password
- **Login**: Secure authentication with bcrypt password hashing
- **Session Management**: Express sessions for maintaining user state
- **Logout**: Clean session termination

### 2. File Management
- **Upload**: Upload files with automatic encryption using user-specific keys
- **View**: Browse all uploaded files in a grid layout
- **Download**: Download files with automatic decryption
- **Delete**: Remove uploaded files from the system

### 3. File Sharing
- **Link Generation**: Create unique shareable links for files
- **Link Management**: View and manage all generated share links
- **Link Deletion**: Remove share links when no longer needed
- **Public Access**: Share files with anyone via generated links

### 4. Security
- **Password Encryption**: Bcrypt hashing for secure password storage
- **File Encryption**: XOR-based encryption for uploaded files
- **User-Specific Keys**: Each user gets a unique encryption key
- **Session Security**: Secure session management with Express sessions

## Architecture

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │◄───────►│   Server    │◄───────►│  MongoDB    │
│  (Browser)  │         │  (Express)  │         │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ File System │
                        │  (Uploads)  │
                        └─────────────┘
```

### Application Flow

1. **User Registration/Login**
   - User provides credentials
   - Password is hashed using bcrypt
   - Unique encryption key is generated
   - User data stored in MongoDB

2. **File Upload**
   - User selects file
   - File is read into memory
   - File is encrypted using user's encryption key
   - Encrypted file is saved to disk
   - File metadata stored in user's document

3. **File Sharing**
   - User selects a file to share
   - System generates unique hash using bcrypt
   - Share link created with hash
   - Link stored in public_links collection

4. **File Download**
   - User/visitor requests file
   - System retrieves encrypted file
   - File is decrypted using encryption key
   - Decrypted data sent to user

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for user and file metadata
- **express-formidable**: Form and file upload handling

### Security
- **bcrypt**: Password hashing
- **express-session**: Session management
- Custom XOR-based file encryption

### Frontend
- **EJS**: Templating engine
- **Vue.js 3**: Frontend framework for interactivity
- **Bootstrap**: CSS framework for responsive design
- **jQuery**: DOM manipulation
- **SweetAlert**: Beautiful alert dialogs
- **Font Awesome**: Icons

## Installation

### Prerequisites
- Node.js (v12 or higher)
- MongoDB (v3.6 or higher)
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Share-It
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

4. **Start the application**
   ```bash
   npm start
   # or
   node server.js
   ```

5. **Access the application**
   ```
   Open browser and navigate to: http://localhost:3000
   ```

## Configuration

### Environment Variables
The application uses the following configuration (can be set in a `.env` file):

- **Port**: 3000 (default)
- **MongoDB URL**: `mongodb://127.0.0.1:27017`
- **Database Name**: `file_transfer`
- **Session Secret**: `secret key` (should be changed in production)

### File Storage
- Uploaded files are stored in: `public/uploads/{user-email}/`
- Files are encrypted before storage
- Original filenames are preserved in metadata

## Usage

### For Users

1. **Register an Account**
   - Navigate to `/Register`
   - Provide name, email, and password
   - System generates unique encryption key

2. **Login**
   - Navigate to `/Login`
   - Enter credentials
   - Access file management features

3. **Upload Files**
   - Go to "My Uploads" page
   - Click "Upload" button
   - Select file from your device
   - Confirm upload
   - File is automatically encrypted and stored

4. **Share Files**
   - View file details
   - Click "Share via link"
   - Copy generated link
   - Share link with others

5. **Manage Shared Links**
   - Navigate to "My Shared Links"
   - View all generated links
   - Delete links when needed

## Security Features

### 1. Password Security
- **Bcrypt Hashing**: All passwords are hashed with salt rounds of 10
- **No Plain Text Storage**: Passwords never stored in plain text

### 2. File Encryption
```javascript
// Encryption Process
1. Generate random encryption key (6-12 characters)
2. Read file data into buffer
3. Apply XOR operation with key
4. Save encrypted data to disk

// Decryption Process
1. Read encrypted file
2. Apply XOR operation with same key
3. Return original file data
```

### 3. User-Specific Keys
- Each user receives a unique encryption key during registration
- Keys are 6-12 characters long
- Keys contain alphanumeric characters
- Encryption key stored in user document

### 4. Session Management
- Express sessions with secure configuration
- Sessions cleared on logout
- User authentication required for protected routes

### 5. Access Control
- File access restricted to owner
- Public links enable controlled sharing
- Link deletion removes public access

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Home page | No |
| GET | `/Register` | Registration page | No |
| POST | `/Register` | Create new account | No |
| GET | `/Login` | Login page | No |
| POST | `/Login` | Authenticate user | No |
| GET | `/Logout` | End session | Yes |

### File Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/MyUploads` | View uploaded files | Yes |
| POST | `/UploadFile` | Upload new file | Yes |
| POST | `/DownloadFile` | Download file | Yes/No* |
| POST | `/DeleteFile` | Delete file | Yes |

*Download can work with public links without authentication

### Link Sharing
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ShareViaLink` | Generate share link | Yes |
| GET | `/MySharedLinks` | View all shared links | Yes |
| GET | `/SharedViaLink/:hash` | Access shared file | No |
| POST | `/DeleteLink` | Delete share link | Yes |

## Project Structure

```
Share-It/
├── server.js                 # Main application file
├── package.json             # Project dependencies
├── package-lock.json        # Locked dependency versions
├── .gitignore              # Git ignore rules
│
├── views/                   # EJS templates
│   ├── index.ejs           # Home page
│   ├── Login.ejs           # Login page
│   ├── Register.ejs        # Registration page
│   ├── MyUploads.ejs       # File management page
│   ├── MySharedLinks.ejs   # Shared links page
│   ├── SharedViaLink.ejs   # Public file view page
│   ├── Error.ejs           # Error page
│   └── includes/           # Reusable components
│       ├── header.ejs      # Page header
│       ├── footer.ejs      # Page footer
│       └── ResponseAlert.ejs # Alert messages
│
└── public/                  # Static assets
    ├── css/                # Stylesheets
    ├── js/                 # JavaScript libraries
    │   ├── vue.global.js   # Vue.js 3
    │   ├── jquery-3.3.1.min.js
    │   ├── bootstrap.min.js
    │   ├── sweetalert.min.js
    │   └── pdfobject.min.js
    ├── fonts/              # Custom fonts
    ├── font-awesome-4.7.0/ # Icon library
    └── uploads/            # User uploaded files
        └── {user-email}/   # User-specific folders
```

## How It Works

### 1. User Registration Flow
```
User submits form
      ↓
Validate email uniqueness
      ↓
Generate encryption key (6-12 chars)
      ↓
Hash password with bcrypt
      ↓
Store user in MongoDB
      ↓
User can login
```

### 2. File Upload Flow
```
User selects file
      ↓
File uploaded to server (temporary)
      ↓
Read file into buffer
      ↓
Encrypt with user's encryption key (XOR)
      ↓
Save encrypted file to public/uploads/{email}/
      ↓
Store metadata in user.uploaded array
      ↓
Delete temporary file
      ↓
Update user document in MongoDB
```

### 3. Link Sharing Flow
```
User clicks "Share via link"
      ↓
Generate hash from filename (bcrypt)
      ↓
Extract 10 characters from hash
      ↓
Create link: /SharedViaLink/{hash}
      ↓
Store in public_links collection
      ↓
Return link to user
```

### 4. File Download Flow
```
User requests file download
      ↓
Check if file accessed via link OR by owner
      ↓
Locate file in filesystem
      ↓
Read encrypted file data
      ↓
Decrypt using user's encryption key (XOR)
      ↓
Send decrypted data to browser
      ↓
Browser downloads file
```

### 5. Encryption/Decryption Process

**Encryption:**
```javascript
for each byte in file:
    encrypted_byte = original_byte XOR key_byte
    (key cycles if shorter than file)
```

**Decryption:**
```javascript
for each byte in encrypted_file:
    original_byte = encrypted_byte XOR key_byte
    (same XOR operation reverses encryption)
```

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  encryptionKey: String,
  isVerified: Boolean,
  verification_token: Number,
  reset_token: String,
  uploaded: [
    {
      _id: ObjectId,
      name: String,
      type: String,
      size: Number,
      filePath: String,
      createdAt: Number
    }
  ]
}
```

#### Public Links Collection
```javascript
{
  _id: ObjectId,
  hash: String,
  file: {
    _id: ObjectId,
    name: String,
    type: String,
    size: Number,
    filePath: String
  },
  uploadedBy: {
    _id: ObjectId,
    name: String,
    email: String
  },
  createdAt: Number
}
```

## Key Functions

### Encryption Key Generation
```javascript
generateEncryptionKey()
- Generates random 6-12 character key
- Uses alphanumeric characters
- Called during user registration
```

### File Encryption/Decryption
```javascript
encryptFile(fileData, key)
- XOR operation on each byte
- Uses user's encryption key
- Returns encrypted buffer

decryptFile(encryptedData, key)
- Same XOR operation
- Reverses encryption
- Returns original file data
```

### Recursive File Operations
```javascript
recursiveGetFile(files, _id)
- Searches through nested file structure
- Supports folder hierarchy
- Returns specific file by ID

removeFileReturnUpdated(arr, _id)
- Removes file from nested structure
- Deletes physical file
- Returns updated array
```

## Development

### Running in Development Mode
```bash
npm start
# Uses nodemon for auto-reload
```

### Testing the Application

1. **Register a new user**
2. **Login with credentials**
3. **Upload a test file**
4. **Generate a share link**
5. **Test download functionality**
6. **Open link in incognito/private window**
7. **Verify file is accessible**

## Security Considerations

### Current Implementation
✅ Password hashing with bcrypt
✅ File encryption at rest
✅ Session-based authentication
✅ User-specific encryption keys

### Production Recommendations
⚠️ Change session secret to strong random value
⚠️ Use environment variables for configuration
⚠️ Implement HTTPS/TLS
⚠️ Add rate limiting for API endpoints
⚠️ Consider stronger encryption (AES instead of XOR)
⚠️ Add file type validation
⚠️ Implement file size limits
⚠️ Add CSRF protection
⚠️ Implement user email verification
⚠️ Add password reset functionality

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is available for educational purposes.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using Node.js, Express, MongoDB, and Vue.js**
