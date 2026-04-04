// Code Compiler - Full Featured JS
class CodeCompiler {
    constructor() {
        this.editors = {
            html: document.getElementById('htmlEditor'),
            css: document.getElementById('cssEditor'),
            js: document.getElementById('jsEditor')
        };

        this.consoleOutput = document.getElementById('consoleOutput');
        this.consoleInput = document.getElementById('consoleInput');
        this.runBtn = document.getElementById('runBtn');
        this.codeFrame = document.getElementById('codeFrame');
        this.clearConsoleBtn = document.getElementById('clearConsoleBtn');
        
        this.previewPanel = document.getElementById('previewPanel');
        this.previewContent = document.getElementById('previewContent');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.panelDivider = document.getElementById('panelDivider');
        this.mainContent = document.querySelector('.main-content');
        this.editorPanel = document.querySelector('.editor-panel');
        
        this.isResizing = false;

        this.providers = window.__providers__;
        this.setupEventListeners();
        this.printWelcome();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.tab-btn').dataset.type));
        });

        // Run button
        this.runBtn.addEventListener('click', () => this.runCode());

        // Console input
        this.consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = this.consoleInput.value.trim();
                this.handleConsoleInput(input);
                this.consoleInput.value = '';
            }
        });

        // Clear console button
        this.clearConsoleBtn.addEventListener('click', () => {
            this.consoleOutput.innerHTML = '';
        });

        // Keyboard shortcut for run (Ctrl+Enter)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.runCode();
            }
        });

        // Tab key in editors
        document.querySelectorAll('.editor').forEach(editor => {
            editor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    editor.value = editor.value.substring(0, start) + '\t' + editor.value.substring(end);
                    editor.selectionStart = editor.selectionEnd = start + 1;
                }
            });
        });

        // Panel divider resizing
        this.panelDivider.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            document.addEventListener('mousemove', (e) => this.resizePanel(e));
            document.addEventListener('mouseup', () => {
                this.isResizing = false;
            });
        });

        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    switchTab(type) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Update editors
        document.querySelectorAll('.editor').forEach(editor => {
            editor.classList.toggle('active', editor.dataset.type === type);
        });
    }

    runCode() {
        const html = this.editors.html.value;
        const css = this.editors.css.value;
        const js = this.editors.js.value;

        // Create complete HTML document
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${css}</style></head><body>${html}<script>const a=console.log,e=console.error,r=console.warn,n=console.info;console.log=function(...t){parent.postMessage({type:'console.log',data:t},'*'),a.apply(console,t)},console.error=function(...t){parent.postMessage({type:'console.error',data:t},'*'),e.apply(console,t)},console.warn=function(...t){parent.postMessage({type:'console.warn',data:t},'*'),r.apply(console,t)},console.info=function(...t){parent.postMessage({type:'console.info',data:t},'*'),n.apply(console,t)};try{${js}}catch(t){parent.postMessage({type:'console.error',data:['Runtime Error: '+t.message]},'*')}parent.postMessage({type:'iframe.ready'},'*');<\/script></body></html>`;

        this.addLog('Code executed!', 'success');
        
        this.codeFrame.srcdoc = fullHtml;
        
        // Also render to preview panel
        this.renderPreview(fullHtml);
    }

    renderPreview(fullHtml) {
        // Clear previous content
        this.previewContent.innerHTML = '';
        
        // Create iframe for preview
        const previewIframe = document.createElement('iframe');
        previewIframe.style.width = '100%';
        previewIframe.style.height = '100%';
        previewIframe.style.border = 'none';
        previewIframe.style.backgroundColor = 'white';
        previewIframe.srcdoc = fullHtml;
        
        this.previewContent.appendChild(previewIframe);
    }

    resizePanel(e) {
        if (!this.isResizing) return;
        
        const mainRect = this.mainContent.getBoundingClientRect();
        const newEditorWidth = e.clientX - mainRect.left;
        const minWidth = 300;
        
        // Prevent panels from getting too small
        if (newEditorWidth < minWidth || (mainRect.width - newEditorWidth) < minWidth) return;
        
        this.editorPanel.style.flex = `0 0 ${newEditorWidth}px`;
        this.previewPanel.style.flex = '1';
    }

    toggleFullscreen() {
        this.previewPanel.classList.toggle('fullscreen');
        this.editorPanel.style.display = this.previewPanel.classList.contains('fullscreen') ? 'none' : 'flex';
        this.panelDivider.style.display = this.previewPanel.classList.contains('fullscreen') ? 'none' : 'block';
        
        // Update button text
        if (this.previewPanel.classList.contains('fullscreen')) {
            this.fullscreenBtn.textContent = '⛶ Exit';
            this.fullscreenBtn.title = 'Exit fullscreen';
        } else {
            this.fullscreenBtn.textContent = '⛶';
            this.fullscreenBtn.title = 'Fullscreen';
        }
    }

    handleConsoleInput(input) {
        if (!input) return;

        // Print input
        this.addLog(`> ${input}`, 'prompt-line');

        // Check for commands
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
        const command = parts[0].toLowerCase();

        if (command === '/register-url' || command === '/reg-url') {
            this.handleRegisterUrl(parts);
        } else if (command === '/list-providers') {
            this.listProviders();
        } else if (command === '/help') {
            this.showHelp();
        } else if (command === '/load-url') {
            this.handleLoadUrl(parts);
        } else if (command === '/load-code') {
            this.handleLoadCode(parts);
        } else if (command === '/cache-info') {
            this.showCacheInfo();
        } else {
            this.addLog(`Unknown command: ${command}. Type /help for available commands.`, 'warn');
        }
    }

    handleRegisterUrl(parts) {
        const action=parts[1];const name=parts[2];const url=parts.slice(3).join(' ');
        if(!action){this.addLog('Usage: /register-url (add/remove/list) [name] [url]','warn');return}
        if(action==='add'){if(!name||!url){this.addLog('Usage: /register-url add (name) (url)','warn');return}this.addProvider(name,url)}else if(action==='remove'){if(!name){this.addLog('Usage: /register-url remove (name)','warn');return}if(this.providers.get(name)){this.providers.rmv(name);this.addLog(`Provider "${name}" removed.`,'success')}else{this.addLog(`Provider "${name}" not found.`,'error')}}else if(action==='list'){this.listProviders()}else{this.addLog('Usage: /register-url (add/remove/list) [name] [url]','warn')}
    }

    async addProvider(name, url) {
        try {
            this.addLog(`Registering provider "${name}"...`, 'info');
            let m={url:url};
            try{const b=url.endsWith('/')?url:url+'/';const c=await fetch(b+'codifly.json',{mode:'cors',credentials:'omit'});if(c.ok){const d=await c.json();m.metadata={name:d.name||'Unknown',github:d.github||'N/A',email:d.email||'N/A',codeGen:d.codeGen||'random'};this.addLog('✓ Found codifly.json','success')}}catch(e){this.addLog('⚠ codifly.json not found (optional)','warn')}
            this.providers.add(name,m);
            this.addLog(`Provider "${name}" registered: ${url}`,'success');
            if(m.metadata){this.addLog(`  Site: ${m.metadata.name}`,'log');this.addLog(`  Creator: ${m.metadata.github} (${m.metadata.email})`,'log');this.addLog(`  Code Gen: ${m.metadata.codeGen}`,'log')}
        } catch (error) {
            this.addLog(`Error registering provider: ${error.message}`,'error');
        }
    }

    handleLoadUrl(parts){const p=parts[1];const c=parts.slice(2).join(' ');if(!p||!c){this.addLog('Usage: /load-url (provider-name) (code)','warn');return}if(!/^[a-zA-Z0-9]{4}$/.test(c)){this.addLog('❌ Code must be exactly 4 alphanumeric characters (a-z, A-Z, 0-9)','error');return}const d=this.providers.get(p);if(!d){this.addLog(`Provider "${p}" not found.`,'error');return}const u=typeof d==='string'?d:d.url;this.loadSiteFromUrl(`${u}${c}`,c)}

    handleLoadCode(parts){const c=parts.slice(1).join(' ');if(!c){this.addLog('Usage: /load-code (code)','warn');return}if(!/^[a-zA-Z0-9]{4}$/.test(c)){this.addLog('❌ Code must be exactly 4 alphanumeric characters (a-z, A-Z, 0-9)','error');return}const p=this.providers.lst();if(!Object.keys(p).length){this.addLog('No providers registered. Use /register-url to add providers.','warn');return}const n=Object.keys(p)[0];const d=p[n];const u=typeof d==='string'?d:d.url;this.loadSiteFromUrl(`${u}${c}`,c)}

    async loadSiteFromUrl(url, code) {
        try {
            this.addLog(`Loading site from: ${url}`, 'info');

            // Check cache first
            const cacheKey = `site-${code}`;
            const cached = await this.getCachedSite(cacheKey);

            if (cached) {
                this.addLog('Loading from cache...', 'success');
                this.openSite(cached, code);
                return;
            }

            // Fetch from URL
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            let html = await response.text();

            // Store in cache
            await this.cacheSite(cacheKey, html);
            this.addLog('Site cached successfully!', 'success');

            this.openSite(html, code);
        } catch (error) {
            this.addLog(`Failed to load site: ${error.message}`, 'error');
        }
    }

    async cacheSite(key, html) {
        try {
            const cache = await caches.open('code-compiler-v1');
            const response = new Response(html, {
                headers: { 'Content-Type': 'text/html' }
            });
            await cache.put(key, response);
        } catch (error) {
            console.error('Cache storage error:', error);
        }
    }

    async getCachedSite(key) {
        try {
            const cache = await caches.open('code-compiler-v1');
            const response = await cache.match(key);
            if (response) {
                return await response.text();
            }
        } catch (error) {
            console.error('Cache retrieval error:', error);
        }
        return null;
    }

    async showCacheInfo() {
        try {
            const cacheStorage = await caches.keys();
            this.addLog(`Cache storages: ${cacheStorage.join(', ') || 'None'}`, 'log');

            const cache = await caches.open('code-compiler-v1');
            const requests = await cache.keys();
            this.addLog(`Cached sites: ${requests.map(r => r.url.split('-')[1]).join(', ') || 'None'}`, 'log');
        } catch (error) {
            this.addLog(`Cache error: ${error.message}`, 'error');
        }
    }

    openSite(html, code) {
        // Do history replace with Google search
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `https://www.google.com/search?q=${encodeURIComponent(code)}`);
        }

        // Open in about:blank window
        const newWindow = window.open('about:blank', '_blank', 'width=1200,height=800');
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
            this.addLog(`Site opened in new window!`, 'success');
            this.addLog(`Code: ${code}`, 'info');
        } else {
            this.addLog('Unable to open new window. Check popup blocker.', 'warn');
        }
    }

    listProviders(){const p=this.providers.lst();if(!Object.keys(p).length){this.addLog('No providers registered.','warn');return}this.addLog('=== Registered Providers ===','info');for(let n in p){const d=p[n];const u=typeof d==='string'?d:d.url;this.addLog(`\n[${n}]`,'log');this.addLog(`  URL: ${u}`,'log');if(d.metadata){this.addLog(`  Site: ${d.metadata.name}`,'log');this.addLog(`  Creator: ${d.metadata.github}`,'log');this.addLog(`  Email: ${d.metadata.email}`,'log');this.addLog(`  Code Gen: ${d.metadata.codeGen}`,'log')}}}

    showHelp() {
        this.addLog('=== Available Commands ===', 'info');
        this.addLog('/register-url (add/remove/list) (name) (url) - Register/remove/list providers', 'log');
        this.addLog('/reg-url (add/remove/list) (name) (url) - Shorthand for /register-url', 'log');
        this.addLog('/load-url (provider) (code) - Load site from specific provider', 'log');
        this.addLog('/load-code (code) - Load site using first registered provider', 'log');
        this.addLog('/cache-info - Show cached sites', 'log');
        this.addLog('/help - Show this help message', 'log');
        this.addLog('', 'log');
        this.addLog('=== Tips ===', 'info');
        this.addLog('• Type JavaScript code directly in console to execute', 'log');
        this.addLog('• Use Ctrl+Enter to run code (keyboard shortcut)', 'log');
        this.addLog('• Preview panel shows live preview on the right side', 'log');
        this.addLog('• Drag the divider between editor and preview to resize', 'log');
        this.addLog('• Click ⛶ button to fullscreen the preview', 'log');
        this.addLog('• Sites are cached for faster loading', 'log');
        this.addLog('• Use Tab in editors for indentation', 'log');
    }

    printWelcome() {
        this.addLog('=== Code Compiler ===', 'info');
        this.addLog('Write HTML, CSS, and JavaScript in the editor tabs above.', 'log');
        this.addLog('Click "Run" or press Ctrl+Enter to execute your code.', 'log');
        this.addLog('Type /help for console commands.', 'log');
        this.addLog('', 'log');
    }

    addLog(message, type = 'log') {
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;

        if (type === 'prompt-line') {
            message = message.replace(/^> /, '');
            line.innerHTML = `<span class="console-prompt">&gt;</span> <span class="user-input">${this.escapeHtml(message)}</span>`;
        } else {
            line.textContent = message;
        }

        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

}

// Initialize when DOM is ready
let compiler;
document.addEventListener('DOMContentLoaded', () => {
    compiler = new CodeCompiler();
    window.compiler = compiler;
});

// Handle messages from iframe
window.addEventListener('message', (event) => {
    if (event.source === document.getElementById('codeFrame').contentWindow) {
        const { type, data } = event.data;

        const compiler = window.compiler;
        if (!compiler) return;

        switch (type) {
            case 'console.log':
                data.forEach(arg => compiler.addLog(String(arg), 'log'));
                break;
            case 'console.error':
                data.forEach(arg => compiler.addLog(String(arg), 'error'));
                break;
            case 'console.warn':
                data.forEach(arg => compiler.addLog(String(arg), 'warn'));
                break;
            case 'console.info':
                data.forEach(arg => compiler.addLog(String(arg), 'info'));
                break;
            case 'iframe.ready':
                break;
        }
    }
});
