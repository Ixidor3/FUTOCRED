# FUTOCRED

**Blockchain-Based Credential Issuance and Verification System for the Federal University of Technology, Owerri (FUTO)**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.x-black.svg)
![React](https://img.shields.io/badge/React-Frontend-61DAFB.svg)
![IPFS](https://img.shields.io/badge/IPFS-Pinata-orange.svg)

---

## Overview

**FUTOCRED** is a decentralized credential issuance and verification platform developed for the **Federal University of Technology, Owerri (FUTO)**. The system enables the university and its authorized departments to issue verifiable academic credentials directly to students using blockchain technology.

Unlike traditional credential management systems, FUTOCRED ensures that credentials are:

- Tamper-proof
- Easily verifiable
- Publicly verifiable without contacting the university
- Permanently linked to a student's blockchain wallet
- Decentralized and transparent

Credential documents (PDFs) are stored on **Pinata IPFS**, while only essential metadata is stored on-chain, significantly reducing blockchain storage costs (gas fees).

---

# Features

- Secure blockchain credential issuance
- Wallet-based student identity
- Decentralized PDF storage using Pinata IPFS
- Public credential verification
- Credential revocation
- Department authorization management
- Student credential dashboard
- Gas-efficient on-chain metadata storage

---

# System Architecture

```
                    +--------------------+
                    |   Admin Wallet     |
                    +---------+----------+
                              |
             Registers / Removes Departments
                              |
                              v
                  +-----------------------+
                  | Authorized Department |
                  +-----------+-----------+
                              |
          Upload PDF + Student Wallet Address
                              |
                              v
                     Pinata IPFS Storage
                              |
                     Returns IPFS Hash
                              |
                              v
                  Smart Contract (Ethereum)
        Stores Metadata + Credential Information
                              |
         +--------------------+--------------------+
         |                                         |
         v                                         v
    Student Portal                        Verification Portal
```

---

# Technology Stack

## Frontend

- React.js
- Ethers.js
- Tailwind CSS

## Blockchain

- Solidity
- Sepolia

## Storage

- Pinata IPFS
- Metadata stored on blockchain

## Wallet

- MetaMask

---

# Pages

The application consists of **four main pages**.

---

# 1. Verify Page

The **Verify** page is publicly accessible and allows anyone to verify the authenticity of a credential.

### Purpose

Employers, institutions, organizations, or any third party can verify whether a credential was genuinely issued by FUTO.

### Features

- Search using Credential ID
- Search using IPFS Hash
- View credential information
- Display credential status
- Check if credential has been revoked
- Download original PDF credential from IPFS

### Accessibility

✅ Public


---

# 2. Student Page

The **Student Portal** allows students to view every credential that has been issued to their blockchain wallet.

### Features

- Wallet authentication
- View all issued credentials
- View credential information
- Download credential PDF
- View issuance date
- View credential status

Every credential is permanently associated with the student's wallet address.

### Accessibility

Only registered students with connected wallets.

---

# 3. Issue Page

The **Issue** page enables authorized university departments to issue academic credentials.

### Workflow

1. Connect authorized wallet
2. Enter student's wallet address
3. Upload credential PDF
4. PDF is uploaded to Pinata IPFS
5. IPFS Hash is returned
6. Smart contract stores:

- Credential ID
- Student wallet address
- IPFS Hash
- Issue timestamp
- Credential metadata

7. Credential becomes immediately available in the student's portal.

### Accessibility

Only:

- Admin
- Authorized Departments

---

# 4. Admin Page

The **Admin** page manages the entire authorization and credential lifecycle.

There are four administrative functions.

---

## Register Department

Allows the administrator to authorize a department wallet to issue credentials.

### Access

Admin only

### Function

- Input department wallet address
- Grant issuing permission

---

## Remove Department

Revokes the authorization of a department.

### Access

Admin only

### Function

- Input department wallet
- Remove issuing permission

Once removed, the department can no longer issue credentials.

---

## Register Student

Registers a student's wallet address in the system.

### Access

- Admin
- Authorized Departments

### Function

- Input student's wallet address
- Register student
- Student becomes eligible to receive credentials

---

## Revoke Credential

Revokes an issued credential.

### Access

- Admin
- Authorized Departments

### Function

- Select credential
- Mark credential as revoked

A revoked credential remains visible on the blockchain but will display a revoked status during verification.

---

# Credential Lifecycle

```
Department
    │
    ▼
Upload PDF
    │
    ▼
Pinata IPFS
    │
Returns IPFS Hash
    │
    ▼
Smart Contract
Stores Metadata
    │
    ▼
Credential ID Generated
    │
    ▼
Attached to Student Wallet
    │
    ├──────────────► Student Portal
    │
    └──────────────► Public Verification Portal
```

---

# Smart Contract Responsibilities

The smart contract is responsible for:

- Registering departments
- Removing department authorization
- Registering students
- Issuing credentials
- Generating unique Credential IDs
- Associating credentials with student wallets
- Storing credential metadata
- Revoking credentials
- Verifying credential authenticity

---

# IPFS Storage

Instead of storing entire PDF documents on-chain, FUTOCRED stores them on **Pinata IPFS**.

### Stored on IPFS

- Credential PDF

### Stored on Blockchain

- Credential ID
- Student wallet address
- IPFS Hash
- Metadata
- Issue date
- Revocation status

This approach significantly reduces gas costs while maintaining decentralization.

---

# User Roles

| Role                  | Permissions                                              |
| --------------------- | -------------------------------------------------------- |
| Public Verifier       | Verify credentials and download PDFs                     |
| Student               | View and download personal credentials                   |
| Authorized Department | Register students, issue credentials, revoke credentials |
| Admin                 | Full system control including department management      |

---

# Security

FUTOCRED incorporates several security measures:

- Wallet-based authentication
- Role-based access control
- Immutable blockchain records
- Decentralized document storage
- Credential revocation tracking
- Unique Credential IDs
- Transparent verification process

---

# Benefits

- Eliminates forged academic certificates
- Instant verification from anywhere
- No need for manual transcript verification
- Reduced administrative workload
- Transparent credential management
- Secure and immutable academic records
- Lower storage costs through IPFS integration

---

# Future Improvements

- QR code verification
- Batch credential issuance
- Multi-signature department approval
- Email notification system
- NFT-based credentials
- Mobile application
- Analytics dashboard
- Multi-university support

---

# License

This project is released under the **MIT License**.

---

# Acknowledgements

Developed as a blockchain-based credential issuance and verification platform for the **Federal University of Technology, Owerri (FUTO)** to demonstrate the application of decentralized technologies in secure academic credential management.

