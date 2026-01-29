# BountyFlow

BountyFlow is a specialized Bug Bounty Methodology and Workflow Manager designed for security researchers. It combines an "Infinite Canvas" visualization of your reconnaissance process with a Notion-like rich text editor for documentation.

## Features

- **Infinite Methodology Canvas**: Visualize your entire workflow (Recon, Scanning, Exploitation) as a dynamic node tree using React Flow.
- **Granular Reconnaissance Tree**: Pre-loaded with a comprehensive, step-by-step bug bounty methodology based on industry standards.
- **Interactive Tools**: Nodes represent specific tools (e.g., Subfinder, httpx) and contain exact, copy-pasteable bash commands.
- **Rich Text Editor**: Powered by Tiptap, the sidebar editor supports Markdown, syntax highlighting, and slash commands.
- **Node Management**:
  - **Dynamic Updates**: Edits in the sidebar instantly reflect on the canvas.
  - **Customizable**: Change node categories (colors) to track your progress (e.g., mark a step as "Active Enum" red).
  - **Data Injection**: Automatically loads knowledge base content from Markdown files.
- **Cyberpunk Aesthetic**: A sleek, dark-themed UI built with Tailwind CSS and Shadcn UI, designed for focus.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI, Lucide React
- **Canvas**: React Flow
- **Editor**: Tiptap (Headless rich-text editor)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/bountyflow.git
    cd bountyflow
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: If you encounter peer dependency warnings, you can safe ignore them or use `--force` if necessary, but standard install should work.*

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.

## Usage

1.  **Navigation**: Drag to pan around the canvas. Scroll to zoom.
2.  **View Details**: Click on any node (e.g., "Subfinder") to open the Sidebar.
3.  **Execute Commands**: Copy the pre-defined bash command from the sidebar usage block.
4.  **Take Notes**: Use the rich text area to document your findings. You use Markdown syntax (e.g., `# Header`, `**bold**`, `> quote`).
5.  **Customize**: Use the sidebar controls to change the node's category color or delete it from your current flow.
6.  **Extend**: Click "Add Node" to create custom steps in your workflow.

## License

MIT
