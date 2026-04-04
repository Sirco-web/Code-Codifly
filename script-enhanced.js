// Clean Code Compiler
class CodeCompiler {
    constructor() {
        // Editor Elements
        this.editors = {
            html: document.getElementById('htmlEditor'),
            css: document.getElementById('cssEditor'),
            js: document.getElementById('jsEditor')
        };

        // Output Elements
        this.previewContent = document.getElementById('previewContent');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.consoleInput = document.getElementById('consoleInput');
        this.codeFrame = document.getElementById('codeFrame');

        // Buttons
        this.runBtn = document.getElementById('runBtn');
        this.formatBtn = document.getElementById('formatBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.clearPreviewBtn = document.getElementById('clearPreviewBtn');
        this.clearConsoleBtn = document.getElementById('clearConsoleBtn');

        // Providers
        this.providers = window.__providers__;

        this.setupEventListeners();
        this.printWelcome();
    }

    setupEventListeners() {
        // Run Code
        this.runBtn.addEventListener('click', () => this.runCode());

        // Format Code
        this.formatBtn.addEventListener('click', () => this.formatCode());

        // Fullscreen Preview
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Clear Preview
        this.clearPreviewBtn.addEventListener('click', () => this.clearPreview());

        // Clear Console
        this.clearConsoleBtn.addEventListener('click', () => {
            this.consoleOutput.innerHTML = '';
        });

        // Console Input
        this.consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = this.consoleInput.value.trim();
                this.handleConsoleInput(input);
                this.consoleInput.value = '';
            }
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.runCode();
            }
        });

        // Tab key in editors
        Object.values(this.editors).forEach(editor => {
            editor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    e.target.value = e.target.value.substring(0, start) + '\t' + e.target.value.substring(end);
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                }
            });
        });
    }

    handleConsoleInput(input) {
        if (!input) return;

        // Show input
        this.addLog(`> ${input}`, 'prompt-line');

        // Handle commands
        if (input.startsWith('/')) {
            this.handleCommand(input);
        } else {
            // Execute as JavaScript
            try {
                const result = eval(input);
                if (result !== undefined) {
                    this.addLog(JSON.stringify(result), 'log');
                }
            } catch (error) {
                this.addLog(`Error: ${error.message}`, 'error');
            }
        }
    }

    handleCommand(input) {
        const parts = input.split(/\s+/);
        const cmd = parts[0].toLowerCase();

        switch (cmd) {
            case '/help':
                this.showHelp();
                break;
            case '/register-url':
            case '/reg-url':
                this.handleRegisterUrl(parts);
                break;
            case '/update-url':
                this.handleUpdateUrl(parts);
                break;
            case '/load-code':
                this.handleLoadCode(parts);
                break;
            case '/load-url':
                this.handleLoadUrl(parts);
                break;
            case '/list-providers':
                this.listProviders();
                break;
            case '/cache-info':
                this.showCacheInfo();
                break;
            default:
                this.addLog(`Unknown command: ${cmd}`, 'error');
                this.addLog('Type /help for available commands', 'info');
        }
    }

    showHelp() {
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        this.addLog('Available Commands:', 'info');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        this.addLog('/help - Show this help', 'log');
        this.addLog('/register-url add <name> <url> - Register provider', 'log');
        this.addLog('/register-url remove <name> - Remove provider', 'log');
        this.addLog('/update-url <provider|all> <url> - Update provider URL', 'log');
        this.addLog('/load-code <4-char-code> - Load site by code', 'log');
        this.addLog('/list-providers - Show all providers', 'log');
        this.addLog('/cache-info - Show cache info', 'log');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        this.addLog('Loading codes replaces browser history with google.com', 'warn');
        this.addLog('Configure via codifly.json historyReplace property', 'warn');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    }

    handleRegisterUrl(parts) {
        const action = parts[1];
        const name = parts[2];
        const url = parts.slice(3).join(' ');

        if (!action) {
            this.addLog('Usage: /register-url add|remove|list [name] [url]', 'warn');
            return;
        }

        if (action === 'add') {
            if (!name || !url) {
                this.addLog('Usage: /register-url add <name> <url>', 'warn');
                return;
            }
            this.addProvider(name, url);
        } else if (action === 'remove') {
            if (!name) {
                this.addLog('Usage: /register-url remove <name>', 'warn');
                return;
            }
            if (this.providers.get(name)) {
                this.providers.rmv(name);
                this.addLog(`✓ Provider "${name}" removed`, 'success');
            } else {
                this.addLog(`✗ Provider "${name}" not found`, 'error');
            }
        } else if (action === 'list') {
            this.listProviders();
        }
    }

    async handleUpdateUrl(parts) {
        const name = parts[1];
        const newUrl = parts.slice(2).join(' ');

        if (!name || !newUrl) {
            this.addLog('Usage: /update-url <provider-name|all> <new-url>', 'warn');
            return;
        }

        const providers = this.providers.lst();

        if (name.toLowerCase() === 'all') {
            // Update all providers
            const providerNames = Object.keys(providers);
            if (providerNames.length === 0) {
                this.addLog('✗ No providers registered', 'warn');
                return;
            }

            this.addLog(`Updating ${providerNames.length} provider(s)...`, 'info');
            for (const providerName of providerNames) {
                const provider = providers[providerName];
                provider.url = newUrl;
                
                // Re-fetch metadata from new URL
                try {
                    const fetchUrl = newUrl.endsWith('/') ? newUrl : newUrl + '/';
                    const response = await fetch(fetchUrl + 'codifly.json', {
                        mode: 'cors',
                        credentials: 'omit'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        provider.metadata = data;
                        provider.codeLookup = {};
                        
                        if (data.codes && Array.isArray(data.codes)) {
                            data.codes.forEach(codeObj => {
                                provider.codeLookup[codeObj.code] = codeObj;
                            });
                        }
                        this.addLog(`✓ Updated "${providerName}"`, 'success');
                    }
                } catch (e) {
                    this.addLog(`⚠ Could not fetch codifly.json for "${providerName}"`, 'warn');
                }
            }
        } else {
            // Update single provider
            if (!providers[name]) {
                this.addLog(`✗ Provider "${name}" not found`, 'error');
                return;
            }

            const provider = providers[name];
            provider.url = newUrl;
            this.addLog(`Updating "${name}" URL to ${newUrl}...`, 'info');

            try {
                const fetchUrl = newUrl.endsWith('/') ? newUrl : newUrl + '/';
                const response = await fetch(fetchUrl + 'codifly.json', {
                    mode: 'cors',
                    credentials: 'omit'
                });

                if (response.ok) {
                    const data = await response.json();
                    provider.metadata = data;
                    provider.codeLookup = {};
                    
                    if (data.codes && Array.isArray(data.codes)) {
                        data.codes.forEach(codeObj => {
                            provider.codeLookup[codeObj.code] = codeObj;
                        });
                    }
                    this.addLog(`✓ Provider "${name}" updated`, 'success');
                    if (data.name) {
                        this.addLog(`  ${data.name}`, 'log');
                    }
                } else {
                    this.addLog(`✓ URL updated (codifly.json not found)`, 'warn');
                }
            } catch (error) {
                this.addLog(`✓ URL updated (could not fetch metadata: ${error.message})`, 'warn');
            }
        }
    }

    async addProvider(name, url) {
        try {
            this.addLog(`Registering "${name}"...`, 'info');
            let metadata = {url: url};

            try {
                const fetchUrl = url.endsWith('/') ? url : url + '/';
                const response = await fetch(fetchUrl + 'codifly.json', {
                    mode: 'cors',
                    credentials: 'omit'
                });

                if (response.ok) {
                    const data = await response.json();
                    metadata.metadata = data;  // Store full codifly.json
                    metadata.codeLookup = {};  // Create lookup map for codes
                    
                    // Build code lookup map for fast access
                    if (data.codes && Array.isArray(data.codes)) {
                        data.codes.forEach(codeObj => {
                            metadata.codeLookup[codeObj.code] = codeObj;
                        });
                    }
                    
                    this.addLog('✓ found codifly.json', 'success');
                }
            } catch (e) {
                this.addLog('⚠ codifly.json not found (optional)', 'warn');
            }

            this.providers.add(name, metadata);
            this.addLog(`✓ Provider registered: ${url}`, 'success');

            if (metadata.metadata) {
                this.addLog(`  ${metadata.metadata.name}`, 'log');
                this.addLog(`  ${metadata.metadata.github} (${metadata.metadata.email})`, 'log');
            }
        } catch (error) {
            this.addLog(`✗ Error: ${error.message}`, 'error');
        }
    }

    handleLoadCode(parts) {
        const code = parts.slice(1).join(' ');
        if (!code) {
            this.addLog('Usage: /load-code <code>', 'warn');
            return;
        }
        if (!/^[a-zA-Z0-9]{4}$/.test(code)) {
            this.addLog('✗ Code must be exactly 4 alphanumeric characters', 'error');
            return;
        }

        const providers = this.providers.lst();
        if (Object.keys(providers).length === 0) {
            this.addLog('✗ No providers registered', 'warn');
            return;
        }

        const firstProvider = Object.keys(providers)[0];
        const provider = providers[firstProvider];
        
        // Look up the code in the provider's metadata
        if (provider.codeLookup && provider.codeLookup[code]) {
            const codeObj = provider.codeLookup[code];
            const providerUrl = typeof provider === 'string' ? provider : provider.url;
            const fileUrl = providerUrl.endsWith('/') ? providerUrl : providerUrl + '/';
            this.loadSiteFromUrl(`${fileUrl}${codeObj.file}`, code, provider);
        } else {
            this.addLog(`✗ Code "${code}" not found in provider`, 'error');
        }
    }

    handleLoadUrl(parts) {
        const provider = parts[1];
        const code = parts.slice(2).join(' ');
        if (!provider || !code) {
            this.addLog('Usage: /load-url <provider-name> <code>', 'warn');
            return;
        }
        if (!/^[a-zA-Z0-9]{4}$/.test(code)) {
            this.addLog('✗ Code must be exactly 4 alphanumeric characters', 'error');
            return;
        }

        const p = this.providers.get(provider);
        if (!p) {
            this.addLog(`✗ Provider "${provider}" not found`, 'error');
            return;
        }

        // Look up the code in the provider's metadata
        if (p.codeLookup && p.codeLookup[code]) {
            const codeObj = p.codeLookup[code];
            const providerUrl = typeof p === 'string' ? p : p.url;
            const fileUrl = providerUrl.endsWith('/') ? providerUrl : providerUrl + '/';
            this.loadSiteFromUrl(`${fileUrl}${codeObj.file}`, code, p);
        } else {
            this.addLog(`✗ Code "${code}" not found in provider`, 'error');
        }
    }

    async loadSiteFromUrl(url, code, providerMetadata = null) {
        try {
            this.addLog(`Loading from ${url}...`, 'info');
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();
            await this.cacheSite(`site-${code}`, html);
            this.addLog('✓ Site loaded and cached', 'success');
            
            // Handle history replacement based on metadata
            const historyConfig = providerMetadata?.metadata?.historyReplace || {};
            const historyUrl = historyConfig.url || 'https://www.google.com';
            const doHistoryReplace = historyConfig.enabled !== false; // enabled by default
            
            if (doHistoryReplace) {
                history.replaceState({ originalUrl: window.location.href, code }, '', historyUrl);
                this.addLog(`History replaced with: ${historyUrl}`, 'info');
            }
            
            this.displaySite(html);
        } catch (error) {
            this.addLog(`✗ Error: ${error.message}`, 'error');
        }
    }

    async cacheSite(key, html) {
        try {
            const cache = await caches.open('code-compiler-v1');
            const response = new Response(html, {
                headers: {'Content-Type': 'text/html'}
            });
            await cache.put(key, response);
        } catch (error) {
            console.error('Cache error:', error);
        }
    }

    displaySite(html) {
        // Create fullscreen overlay for provider
        let overlay = document.getElementById('providerOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'providerOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                background: white;
                margin: 0;
                padding: 0;
                overflow: hidden;
            `;
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕ Back to Editor';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 8px 16px;
                background: #238636;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
            `;
            closeBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
                this.addLog('Back to editor', 'info');
            });
            overlay.appendChild(closeBtn);
            
            document.body.appendChild(overlay);
        }
        
        // Clear and add iframe
        const existingIframe = overlay.querySelector('iframe');
        if (existingIframe) existingIframe.remove();
        
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            margin: 0;
            padding: 0;
        `;
        iframe.srcdoc = html;
        overlay.appendChild(iframe);
        
        // Show overlay
        overlay.style.display = 'block';
        this.addLog('Provider loaded fullscreen', 'success');
    }

    listProviders() {
        const providers = this.providers.lst();
        const keys = Object.keys(providers);

        if (keys.length === 0) {
            this.addLog('No providers registered', 'warn');
            return;
        }

        this.addLog(`Providers (${keys.length}):`, 'info');
        keys.forEach(name => {
            const provider = providers[name];
            const url = typeof provider === 'string' ? provider : provider.url;
            this.addLog(`  • ${name}: ${url}`, 'log');
        });
    }

    async showCacheInfo() {
        try {
            const cacheNames = await caches.keys();
            this.addLog(`Caches: ${cacheNames.join(', ') || 'None'}`, 'info');

            if (cacheNames.includes('code-compiler-v1')) {
                const cache = await caches.open('code-compiler-v1');
                const items = await cache.keys();
                if (items.length > 0) {
                    this.addLog(`Cached (${items.length}):`, 'log');
                    items.forEach(req => {
                        this.addLog(`  • ${req.url}`, 'log');
                    });
                }
            }
        } catch (error) {
            this.addLog(`Cache error: ${error.message}`, 'error');
        }
    }

    runCode() {
        const html = this.editors.html.value;
        const css = this.editors.css.value;
        const js = this.editors.js.value;

        // Hide provider overlay if visible
        const overlay = document.getElementById('providerOverlay');
        if (overlay) overlay.style.display = 'none';

        this.addLog('Running code...', 'info');

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        const _log = console.log;
        const _err = console.error;
        const _warn = console.warn;
        
        console.log = function(...args) {
            parent.postMessage({type: 'log', data: args}, '*');
            _log(...args);
        };
        console.error = function(...args) {
            parent.postMessage({type: 'error', data: args}, '*');
            _err(...args);
        };
        console.warn = function(...args) {
            parent.postMessage({type: 'warn', data: args}, '*');
            _warn(...args);
        };
        
        try {
            ${js}
        } catch(e) {
            console.error('Runtime Error: ' + e.message);
        }
    </script>
</body>
</html>`;

        // Display in preview
        this.previewContent.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.srcdoc = fullHtml;

        // Listen for console messages
        window.addEventListener('message', (e) => {
            if (e.data.type === 'log') {
                this.addLog(e.data.data.join(' '), 'log');
            } else if (e.data.type === 'error') {
                this.addLog(e.data.data.join(' '), 'error');
            } else if (e.data.type === 'warn') {
                this.addLog(e.data.data.join(' '), 'warn');
            }
        });

        this.previewContent.appendChild(iframe);
        this.addLog('✓ Code executed', 'success');
    }

    formatCode() {
        this.addLog('Formatting...', 'info');
        const html = this.editors.html.value;
        this.editors.html.value = this.formatHTML(html);
        this.addLog('✓ Formatted', 'success');
    }

    formatHTML(html) {
        let formatted = '';
        let indent = 0;

        html.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.match(/^<\//)) indent--;
            formatted += '  '.repeat(Math.max(0, indent)) + line + '\n';
            if (line.match(/^<[^/][^>]*>$/) && !line.match(/\/>/)) indent++;
        });

        return formatted;
    }

    toggleFullscreen() {
        this.previewContent.parentElement.classList.toggle('fullscreen');
        this.fullscreenBtn.textContent = this.previewContent.parentElement.classList.contains('fullscreen') ? '⊟' : '⛶';
    }

    clearPreview() {
        this.previewContent.innerHTML = `<div class="preview-placeholder"><p>Click <strong>Run Code</strong> to execute</p></div>`;
        const overlay = document.getElementById('providerOverlay');
        if (overlay) overlay.style.display = 'none';
        this.addLog('Cleared preview', 'info');
    }

    addLog(message, type = 'log') {
        const line = document.createElement('div');
        line.className = `console-log-line ${type}`;
        line.textContent = message;
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    printWelcome() {
        this.addLog('Welcome to Code Compiler Pro! 🚀', 'info');
        this.addLog('Ctrl+Enter to run • Type /help for commands', 'info');
        this.addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.compiler = new CodeCompiler();
});
