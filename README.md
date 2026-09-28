# FS MOTORSHOP

FS MOTORSHOP is a motorcycle repair shop management system built using:

- HTML
- Vanilla JavaScript
- SCSS
- Node.js

The project uses a native Node.js server and does not use frontend frameworks or Vite.

## Requirements

Install the following:

- Node.js
- npm

Check your Node.js and npm versions:

```bash
node --version
npm --version
```

## Project Setup

Clone the repository and navigate to the project root:

```bash
git clone <repository-url>
cd FS-Motorshop
```

Install the project dependencies:

```bash
npm install
```

This installs the packages listed in `package.json`, including:

- **Sass** — Compiles SCSS into CSS.
- **Concurrently** — Runs the Sass compiler and Node.js server simultaneously.
- **bcrypt** — Provides password hashing.
- **mysql2** — Provides MySQL database connectivity.

## Environment Configuration

The Node.js server uses a `.env` file for environment variables.

Create a `.env` file in the project root:

```bash
touch .env
```

Configure the environment variables required by the server.

Do not commit sensitive credentials or other secrets to the repository.

## Available Scripts

The project provides the following npm scripts:

| Command | Description |
|---|---|
| `npm run sass` | Watches and compiles SCSS files into CSS. |
| `npm run server` | Starts the Node.js development server with automatic restarts. |
| `npm run dev` | Runs the Sass compiler and Node.js server simultaneously. |

## Run the Project

Start the development environment:

```bash
npm run dev
```

This starts both the Sass compiler and the Node.js development server.

```text
                 npm run dev
                      |
             +--------+--------+
             |                 |
          Sass              Node.js
             |                 |
        SCSS Watch        Development Server
             |                 |
       main.scss          server/server.js
             |                 |
             v                 v
        main.css          localhost:8000
```

The Sass compiler automatically recompiles your SCSS files whenever changes are detected.

The Node.js development server automatically restarts when server files change.

Open the application in your browser:

```text
http://localhost:8000
```
