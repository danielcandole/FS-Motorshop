# FS MOTORSHOP

FS MOTORSHOP is a motorcycle repair shop management system using:

- HTML
- JavaScript
- SCSS
- Sass
- PHP

Vite is not used.

## Requirements

Install:

- Node.js
- npm
- PHP

Check Node.js and npm:

```bash
node --version
npm --version
````

Check PHP:

```bash
php --version
```

## Project Setup

From the project root:

```bash
cd ~/Luke/1Updated_files/comProjects/FS\ Motorshop
```

Initialize npm:

```bash
npm init -y
```

This creates:

```text
package.json
```

## Install Sass and Concurrently

Install Sass:

```bash
npm install --save-dev sass
```

Install Concurrently:

```bash
npm install --save-dev concurrently
```

Concurrently allows Sass and PHP to run at the same time.

## Configure package.json

Use:

```json
{
  "name": "fs-motorshop",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "sass": "sass --watch frontend/scss/main.scss:public/css/main.css",
    "php": "php -S localhost:8000 -t public",
    "dev": "concurrently --kill-others \"npm run sass\" \"npm run php\""
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "sass": "^1.0.0"
  }
}
```

The installed package versions are added automatically by npm.

## Run the Project

From the project root:

```bash
npm run dev
```

This starts both processes:

```text
npm run dev
    │
    ├── Sass
    │     └── frontend/scss/main.scss
    │             ↓
    │       public/css/main.css
    │
    └── PHP
          └── localhost:8000
```

Open the project in your browser:

```text
http://localhost:8000
```
