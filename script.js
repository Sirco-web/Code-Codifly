// Modern Full-Page Code Editor
class CodeEditor {
    constructor() {
        // DOM Elements
        this.codeEditor = document.getElementById('codeEditor');
        this.languageSelect = document.getElementById('languageSelect');
        this.runBtn = document.getElementById('runBtn');
        this.previewBtn = document.getElementById('previewBtn');
        this.newFileBtn = document.getElementById('newFileBtn');
        this.uploadFileBtn = document.getElementById('uploadFileBtn');
        this.clearConsoleBtn = document.getElementById('clearConsoleBtn');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.consoleInput = document.getElementById('consoleInput');
        this.fileTabs = document.getElementById('fileTabs');
        this.previewModal = document.getElementById('previewModal');
        this.previewContent = document.getElementById('previewContent');
        this.closePreviewBtn = document.getElementById('closePreviewBtn');
        this.fileInput = document.getElementById('fileInput');
        this.fileUploadInput = document.getElementById('fileUploadInput');

        // State
        this.files = {
            'index.html': '<h1>Hello World</h1>\n<p>Welcome to Code Editor</p>',
            'style.css': 'body {\n  font-family: Arial, sans-serif;\n  background: #f0f0f0;\n}\n',
            'script.js': 'console.log("Hello from JavaScript!");'
        };
        this.currentFile = 'index.html';
        this.providers = window.__providers__;
        this.providerManager = new ProviderManager((msg, type) => this.addLog(msg, type));

        this.setupEventListeners();
        this.renderTabs();
        this.loadFile('index.html');
        this.printWelcome();
    }

    setupEventListeners() {
        // Run button
        this.runBtn.addEventListener('click', () => this.runCode());

        // Preview button
        this.previewBtn.addEventListener('click', () => this.togglePreview());

        // Close preview
        this.closePreviewBtn.addEventListener('click', () => this.closePreview());

        // Language select
        this.languageSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            const langMap = { 'html': 'html', 'css': 'css', 'javascript': 'javascript' };
            // Find file by language
            for (let file in this.files) {
                if (file.endsWith(langMap[lang] === 'html' ? '.html' : langMap[lang] === 'css' ? '.css' : '.js')) {
                    this.loadFile(file);
                    break;
                }
            }
        });

        // Console input
        this.consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = this.consoleInput.value.trim();
                this.handleConsoleInput(input);
                this.consoleInput.value = '';
            }
        });

        // Clear console
        this.clearConsoleBtn.addEventListener('click', () => {
            this.consoleOutput.innerHTML = '';
        });

        // New file
        this.newFileBtn.addEventListener('click', () => this.createNewFile());

        // Upload file
        this.uploadFileBtn.addEventListener('click', () => this.fileUploadInput.click());
        this.fileUploadInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.runCode();
            }
        });

        // Tab key in editor
        this.codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.codeEditor.selectionStart;
                const end = this.codeEditor.selectionEnd;
                this.codeEditor.value = this.codeEditor.value.substring(0, start) + '\t' + this.codeEditor.value.substring(end);
                this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 1;
                this.saveCurrentFile();
            }
        });

        // Save on input
        this.codeEditor.addEventListener('input', () => this.saveCurrentFile());

        // Close preview on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreview();
            }
        });
    }

    createNewFile() {
        const fileName = prompt('Enter file name (e.g., index.html):');
        if (fileName) {
            if (this.files[fileName]) {
                this.addLog('File already exists!', 'warn');
                return;
            }
            this.files[fileName] = '';
            this.loadFile(fileName);
            this.renderTabs();
            this.addLog(`✓ Created ${fileName}`, 'success');
        }
    }

    handleFileUpload(e) {
        const files = e.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.files[file.name] = event.target.result;
                this.loadFile(file.name);
                this.renderTabs();
                this.addLog(`✓ Uploaded ${file.name}`, 'success');
            };
            reader.readAsText(file);
        }
        this.fileUploadInput.value = '';
    }

    loadFile(fileName) {
        if (!this.files[fileName]) return;
        this.currentFile = fileName;
        this.codeEditor.value = this.files[fileName];
        
        // Update language selector
        if (fileName.endsWith('.html')) {
            this.languageSelect.value = 'html';
        } else if (fileName.endsWith('.css')) {
            this.languageSelect.value = 'css';
        } else if (fileName.endsWith('.js')) {
            this.languageSelect.value = 'javascript';
        }

        this.renderTabs();
    }

    saveCurrentFile() {
        this.files[this.currentFile] = this.codeEditor.value;
    }

    deleteFile(fileName) {
        if (Object.keys(this.files).length === 1) {
            this.addLog('Cannot delete the last file!', 'warn');
            return;
        }
        delete this.files[fileName];
        
        // Switch to another file
        const remaining = Object.keys(this.files)[0];
        this.loadFile(remaining);
        this.renderTabs();
        this.addLog(`✓ Deleted ${fileName}`, 'success');
    }

    renderTabs() {
        this.fileTabs.innerHTML = '';
        for (let fileName in this.files) {
            const tab = document.createElement('button');
            tab.className = 'file-tab' + (fileName === this.currentFile ? ' active' : '');
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = fileName;
            tab.appendChild(nameSpan);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'file-tab-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteFile(fileName);
            });
            tab.appendChild(closeBtn);

            tab.addEventListener('click', () => this.loadFile(fileName));
            this.fileTabs.appendChild(tab);
        }
    }

    runCode() {
        this.addLog('▶ Executing code...', 'info');
        
        try {
            const html = this.files['index.html'] || '';
            const css = this.files['style.css'] ? `<style>${this.files['style.css']}</style>` : '';
            const js = this.files['script.js'] || '';

            const fullHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${css}
                </head>
                <body>
                    ${html}
                    <script>
                        const originalLog = console.log;
                        const originalError = console.error;
                        const originalWarn = console.warn;
                        
                        console.log = (...args) => {
                            window.parent.postMessage({
                                type: 'console',
                                level: 'log',
                                message: args.map(arg => 
                                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                                ).join(' ')
                            }, '*');
                            originalLog(...args);
                        };
                        
                        console.error = (...args) => {
                            window.parent.postMessage({
                                type: 'console',
                                level: 'error',
                                message: args.join(' ')
                            }, '*');
                            originalError(...args);
                        };
                        
                        console.warn = (...args) => {
                            window.parent.postMessage({
                                type: 'console',
                                level: 'warn',
                                message: args.join(' ')
                            }, '*');
                            originalWarn(...args);
                        };

                        try {
                            ${js}
                        } catch (e) {
                            console.error('Error: ' + e.message);
                        }
                    </script>
                </body>
                </html>
            `;

            const codeFrame = document.getElementById('codeFrame');
            codeFrame.srcdoc = fullHtml;
            this.addLog('✓ Code compiled successfully', 'success');
        } catch (error) {
            this.addLog(`✗ Error: ${error.message}`, 'error');
        }
    }

    togglePreview() {
        this.previewModal.classList.toggle('active');
        if (this.previewModal.classList.contains('active')) {
            this.runPreview();
        }
    }

    closePreview() {
        this.previewModal.classList.remove('active');
    }

    runPreview() {
        const html = this.files['index.html'] || '';
        const css = this.files['style.css'] ? `<style>${this.files['style.css']}</style>` : '';
        const js = this.files['script.js'] || '';

        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${css}
            </head>
            <body>
                ${html}
                <script>${js}</script>
            </body>
            </html>
        `;

        this.previewContent.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;height:100%;border:none;';
        iframe.srcdoc = fullHtml;
        this.previewContent.appendChild(iframe);
    }

    handleConsoleInput(input) {
        if (!input) return;

        this.addLog(`> ${input}`, 'prompt-line');

        if (input.startsWith('/')) {
            this.handleCommand(input);
        } else {
            try {
                const result = eval(input);
                if (result !== undefined) {
                    this.addLog(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result), 'log');
                }
            } catch (error) {
                this.addLog(`Error: ${error.message}`, 'error');
            }
        }
    }

    handleCommand(cmd) {
        const parts = cmd.split(/\s+/);
        const command = parts[0].toLowerCase();

        switch (command) {
            case '/help':
                this.showHelp();
                break;
            case '/register-url':
            case '/reg-url':
                this.providerManager.handleRegisterUrl(parts);
                break;
            case '/update-url':
                this.providerManager.handleUpdateUrl(parts);
                break;
            case '/update-cache':
                this.providerManager.handleUpdateCache();
                break;
            case '/load-code':
                this.providerManager.handleLoadCode(parts);
                break;
            case '/list-providers':
                this.providerManager.listProviders();
                break;
            case '/cache-info':
                this.providerManager.showCacheInfo();
                break;
            case '/clear':
                this.consoleOutput.innerHTML = '';
                break;
            case '/run':
                this.runCode();
                break;
            default:
                this.addLog('Unknown command. Type /help for help.', 'warn');
        }
    }

    showHelp() {
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        this.addLog('EDITOR COMMANDS', 'info');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        this.addLog('/run - Execute code', 'log');
        this.addLog('/clear - Clear console output', 'log');
        this.addLog('', 'log');
        this.addLog('PROVIDER COMMANDS', 'info');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        this.addLog('/register-url add <name> <url> - Register provider', 'log');
        this.addLog('/register-url remove <name> - Remove provider', 'log');
        this.addLog('/register-url list - List providers', 'log');
        this.addLog('/reg-url - Shorthand for /register-url', 'log');
        this.addLog('/update-url <provider|all> <url> - Update provider URL', 'log');
        this.addLog('/update-cache - Refresh cache for all providers', 'log');
        this.addLog('/load-code <code> - Load site by 4-char code', 'log');
        this.addLog('/list-providers - Show all providers', 'log');
        this.addLog('/cache-info - Show cache info', 'log');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    }



    addLog(message, type = 'log') {
        const line = document.createElement('div');
        line.className = `console-log-line ${type}`;
        line.textContent = message;
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    printWelcome() {
        console.log('✨ Welcome to Code Editor Pro!');
        this.addLog('⚡ Code Editor Pro v1.0', 'success');
        this.addLog('Ctrl+Enter to run • Type /help for commands', 'info');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'log');
    }
}

// ============= MOBILE OPTIMIZATIONS =============
class MobileOptimizer {
    static init() {
        // Detect device type
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isLandscape = window.matchMedia("(max-width: 1024px) and (orientation: landscape)").matches;
        
        if (isMobile) {
            MobileOptimizer.disableZoomOnInputFocus();
            MobileOptimizer.optimizeViewport();
            MobileOptimizer.handleOrientationChange();
            MobileOptimizer.optimizeTouchEvents();
        }

        // TV/Large screen optimizations
        if (window.innerWidth > 1440) {
            MobileOptimizer.optimizeLargeScreen();
        }
    }

    static disableZoomOnInputFocus() {
        // Prevent automatic zoom on input focus on mobile
        const inputs = document.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                document.body.style.zoom = '100%';
            });
        });
    }

    static optimizeViewport() {
        // Ensure proper viewport handling
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }

        // Lock viewport on iOS
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.code-editor, .console-output, .file-tabs')) {
                return;
            }
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    static handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.documentElement.style.height = '100vh';
            }, 100);
        });

        window.addEventListener('resize', () => {
            // Adjust console height on resize
            const consoleSection = document.querySelector('.console-section');
            if (consoleSection && window.innerHeight < 600) {
                consoleSection.style.height = Math.max(100, window.innerHeight * 0.25) + 'px';
            }
        });
    }

    static optimizeTouchEvents() {
        // Add fast click for buttons
        const buttons = document.querySelectorAll('button, .file-tab');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });

        // Improve swipe detection for file tabs
        let touchStartX = 0;
        let touchEndX = 0;
        const fileTabs = document.getElementById('fileTabs');
        
        if (fileTabs) {
            fileTabs.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            fileTabs.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (Math.abs(touchEndX - touchStartX) > 50) {
                    // Auto-scroll file tabs
                    if (touchEndX > touchStartX) {
                        fileTabs.scrollLeft -= 100;
                    } else {
                        fileTabs.scrollLeft += 100;
                    }
                }
            });
        }
    }

    static optimizeLargeScreen() {
        // Increase spacing and sizes for large screens (TVs)
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-size: 18px;
            }
            .btn-run, .btn-preview {
                min-height: 50px;
                min-width: 120px;
            }
            .file-tab {
                min-height: 45px;
            }
            .code-editor {
                font-size: 16px;
                line-height: 1.8;
            }
            .console-output {
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.codeEditor = new CodeEditor();
    MobileOptimizer.init();

    // Listen for console messages from iframe
    window.addEventListener('message', (event) => {
        if (event.data.type === 'console') {
            window.codeEditor.addLog(event.data.message, event.data.level);
        }
    });
});

