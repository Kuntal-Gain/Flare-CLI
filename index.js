import figlet from 'figlet';
import { Command } from 'commander';
import chalk from 'chalk';
import { exec } from 'child_process';
import WebSocket from 'ws';  // Import WebSocket server
import QRCode from 'qrcode';  // Import QR code generator
import http from 'http';  // HTTP server for WebSocket
const program = new Command();

// Display the Flare CLI header
function displayInterface() {
    figlet.text('Flare CLI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, (err, data) => {
        if (err) {
            console.log('Error generating ASCII Art: ', err);
            return;
        }

        console.log('\n');
        console.log(chalk.yellow(data));
        console.log('\n');
    });
}

// Set up WebSocket server and QR code generation
function startDebuggingServer() {
    // Create an HTTP server to support WebSocket
    const server = http.createServer();
    const wss = new WebSocket.Server({ server });

    // Handle WebSocket connections
    wss.on('connection', (ws) => {
        console.log(chalk.green('Client connected for live debugging'));

        // Send a welcome message to the client
        ws.send('You are connected to Flare CLI for live debugging');

        // Listen for messages from the client (for live debugging)
        ws.on('message', (message) => {
            console.log(`Received from client: ${message}`);
            // Here you can process the messages and start debugging based on commands from the client
        });

        // Handle WebSocket close
        ws.on('close', () => {
            console.log(chalk.red('Client disconnected'));
        });
    });

    // Start the server on port 8080 (or any available port)
    server.listen(8080, () => {
        const wsUrl = `ws://localhost:8080`;  // WebSocket connection URL
        console.log(chalk.blue(`WebSocket server started at ${wsUrl}`));

        // Generate the QR code with the WebSocket URL
        QRCode.toString(wsUrl, { type: 'terminal' }, (err, qrCode) => {
            if (err) {
                console.error(chalk.red('Error generating QR code:', err));
                return;
            }
            console.log(chalk.green('\nScan the QR code below to start live debugging:'));
            console.log(qrCode);  // Display QR code in the terminal
        });
    });
}

// Function to create a Flutter project
function createFlutterProject(projectName) {
    console.log(chalk.blue(`Creating Flutter project: ${projectName}`));

    exec(`flutter create ${projectName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red(`Error creating project: ${stderr}`));
            return;
        }
        console.log(chalk.green(`Project ${projectName} created successfully!`));
        console.log(stdout); // Output any additional info
    });
}

// Set up the CLI commands
program
    .command('start')
    .description('Start the Flare CLI and begin live debugging')
    .action(() => {
        displayInterface();
        setTimeout(() => {
            console.log(chalk.green('Starting the application...'));

            // Set up WebSocket server and QR code for live debugging
            startDebuggingServer();
        }, 100);
    });

program
    .command('init <project-name>')
    .description('Initialize a new Flutter project with the specified name')
    .action((projectName) => {
        if (!projectName) {
            console.log(chalk.red('Error: Please provide a project name.'));
            return;
        }

        displayInterface();

        setTimeout(() => {
            console.log(chalk.green('Initializing project...'));
            createFlutterProject(projectName);
        }, 100);
    });

program.parse(process.argv);
