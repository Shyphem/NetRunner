# ⚡ NetRunner

![Version](https://img.shields.io/badge/version-1.0.0-blueviolet?style=for-the-badge) 
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)

> **The Ultimate Bug Bounty Methodology & Workflow Manager.**
> 
> *Visualize. Scan. Exploit. Document.*

---

## 🚀 Overview

**NetRunner** is a specialized tool designed for security researchers and bug bounty hunters. It combines an **"Infinite Canvas"** visualization of your reconnaissance process with a powerful **Integrated Terminal** and **Rich Text Documentation** system. 

Navigate your workflow as a dynamic node tree, execute tools directly from the UI, and have your findings automatically documented.

## ✨ Key Features

### 🧠 **Infinite Methodology Canvas**
Visualize your entire workflow (Recon, Scanning, Exploitation) as a dynamic node tree using **React Flow**. Drag, drop, and connect steps to create your perfect attack path.

### 🛡️ **Granular Reconnaissance Tree**
Comes pre-loaded with a comprehensive, step-by-step bug bounty methodology based on industry standards. Never miss a step in your recon process.

### 💻 **Integrated Terminal**
Execute tools directly from the UI! A real-time terminal powered by **xterm.js** and **Socket.io** lets you run commands like `subfinder` or `nmap` without leaving the app.
*   **Auto-Documentation**: Command outputs are automatically captured and appended to your active node's notes.

### 🔐 **Secure Authentication**
*   **Username/Password Login**: Secure access with JWT tokens.
*   **Persistence**: Credentials and state are stored locally in a JSON database (`db.json`).
*   **User Management**: Easily change your password or logout from the **Settings** panel.

### 📝 **Rich Text Documentation**
Powered by **Tiptap**, the sidebar editor provides a Notion-like experience.
*   Markdown Support
*   Syntax Highlighting
*   Slash Commands

### 🎨 **Cyberpunk Aesthetic**
A sleek, dark-themed UI built with **Tailwind CSS** and **Shadcn UI**, designed for focus during late-night hacking sessions.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React + Vite |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Canvas** | React Flow |
| **Terminal** | xterm.js + Socket.io |
| **Backend** | Node.js + Express |
| **Database** | Local JSON (LowDB style) |

---

## ⚡ Getting Started

### Prerequisites

*   **Node.js** (v18+ recommended)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/netrunner.git
    cd netrunner
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the application**
    ```bash
    npm run dev
    ```
    *(This starts both the Frontend and Backend servers concurrently)*

4.  **Access the App**
    Open your browser and navigate to: `http://localhost:5173`

### 🔑 Default Credentials

| Username | Password |
| :--- | :--- |
| `admin` | `password` |

> **⚠️ IMPORTANT:** Please change your password immediately in the **Settings > Security** panel.

---

## 📖 Usage Guide

1.  **🧭 Navigation**: 
    *   **Pan**: Drag on the canvas.
    *   **Zoom**: Scroll your mouse wheel.
    
2.  **🔍 Detail View**: 
    *   Click on any node (e.g., "Subfinder") to open the **Sidebar**.
    
3.  **⌨️ Execute Commands**: 
    *   Open the **Terminal Drawer** at the bottom of the screen.
    *   Run your tools from the nodes.
    *   Watch as the output is **automatically saved** to your active node's documentation!

4.  **📝 Documentation**: 
    *   Use the sidebar to take detailed notes using Markdown syntax.
    
5.  **⚙️ Management**: 
    *   Click the **Gear Icon** in the sidebar to access **Settings**.
    *   Manage **Templates** or **Change Password**.
    *   **Logout** when you're done.

---

## 📄 License

This project is licensed under the **MIT License**.

---
*Happy Hacking! 🕵️‍♂️*
