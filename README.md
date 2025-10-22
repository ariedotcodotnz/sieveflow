# SieveFlow

A modern, user-friendly web-based editor for creating and managing [Sieve email filtering scripts](https://en.wikipedia.org/wiki/Sieve_(mail_filtering_language)). Build complex email filtering rules with a visual interface, no coding required.

## Features

- **Visual Rule Builder**: Create email filtering rules through an intuitive graphical interface
- **Nested Rules Support**: Build complex filtering logic with nested rule conditions
- **Real-time Code Generation**: See your Sieve script generated in real-time as you build rules
- **Code Editor**: Switch between visual editor and code editor modes
- **Multiple Conditions**: Combine multiple conditions with AND/OR logic
- **Rich Action Support**: File into folders, redirect, discard, reject, and more
- **Extension Management**: Enable/disable Sieve extensions as needed
- **Script Validation**: Real-time validation with helpful warnings
- **Import/Export**: Import existing Sieve scripts or export your created rules
- **Auto-save**: Your work is automatically saved in the browser
- **Template Library**: Start quickly with pre-built filtering templates

## Supported Sieve Features

### Conditions
- Header matching (Subject, From, To, etc.)
- Address parsing and matching
- Message size checking
- Body content matching
- Envelope testing
- Header existence checks

### Actions
- Keep messages
- File into specific folders
- Redirect to another address
- Discard messages
- Reject with custom message
- Vacation auto-replies
- Header manipulation (add/delete)
- Stop processing

### Extensions
Supports common Sieve extensions including: `fileinto`, `reject`, `vacation`, `envelope`, `body`, `variables`, `copy`, `imap4flags`, and many more.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher recommended)
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ariedotcodotnz/sieveflow.git
cd sieveflow
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm start
# or
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Create Rules**: Click "Add Rule" to create a new filtering rule
2. **Add Conditions**: Define what emails to match (e.g., from a specific sender, contains keywords)
3. **Add Actions**: Specify what to do with matching emails (e.g., move to folder, mark as read)
4. **Enable Extensions**: Turn on required Sieve extensions in the sidebar
5. **Nested Rules**: Click "Add nested rule" to create complex conditional logic
6. **View Code**: Click "Show Code" to see the generated Sieve script
7. **Export**: Download your script as a `.sieve` file for use with your mail server

## Building for Production

```bash
pnpm run build
# or
npm run build
```

Builds the app for production to the `build` folder. The build is optimized and minified for the best performance.

## Available Scripts

### `pnpm start` / `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `pnpm test` / `npm test`
Launches the test runner in interactive watch mode

### `pnpm run build` / `npm run build`
Builds the app for production to the `build` folder

### `pnpm run eject` / `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**

## Technologies Used

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Create React App** - Build tooling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## About Sieve

Sieve is a powerful email filtering language defined in [RFC 5228](https://tools.ietf.org/html/rfc5228). It's supported by many mail servers including:
- Dovecot
- Cyrus IMAP
- FastMail
- ProtonMail
- And many others

SieveFlow makes it easy to create and manage Sieve scripts without having to learn the syntax.