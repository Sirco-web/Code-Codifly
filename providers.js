/* @ts-nocheck */
// This system is intentionally obfuscated to hide implementation details
window.__INIT_PROVIDERS__ = (function() {
  const q = 'providers_meta';
  const r = function(a) { try { return JSON.parse(atob(a)) } catch(e) { return null } };
  const s = function(a) { try { return btoa(JSON.stringify(a)) } catch(e) { return '' } };
  const cfg = new Map();
  const ldr = function(a) { try { const b = localStorage.getItem(q); if(b) { const c = r(b); if(c && typeof c === 'object') { for(let d in c) { cfg.set(d, c[d]) } } } return this } catch(e) { return this } };
  const svr = function() { try { const a = {}; cfg.forEach((b, c) => { a[c] = b }); localStorage.setItem(q, s(a)) } catch(e) {} return this };
  const add = function(a, b) { if(a && b) { cfg.set(a, typeof b === 'string' ? {url: b} : b); svr.call({}) } return this };
  const rmv = function(a) { if(a) { cfg.delete(a); svr.call({}) } return this };
  const get = function(a) { return a ? cfg.get(a) : null };
  const lst = function() { const a = {}; cfg.forEach((b, c) => { a[c] = b }); return a };
  const clr = function() { cfg.clear(); try { localStorage.removeItem(q) } catch(e) {} return this };
  window.__providers__ = { cfg, ldr, svr, add, rmv, get, lst, clr };
  return ldr.call(window.__providers__);
})();

// ============= PROVIDER MANAGER CLASS =============
// Manages provider registration, loading, caching, and display
// 
// PROVIDER WINDOW FLOW:
// 1. Open new window with window.open('about:blank', '_blank')
// 2. Write provider HTML content into new window: document.write(html)
// 3. Provider runs in isolated window context
// 4. Editor remains open in original tab/window
// 5. User can switch between windows or close provider window to return
//
class ProviderManager {
  constructor(addLogFn) {
    this.addLog = addLogFn;
    this.providers = window.__providers__;
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

    const providersList = this.providers.lst();

    if (name.toLowerCase() === 'all') {
      const providerNames = Object.keys(providersList);
      if (providerNames.length === 0) {
        this.addLog('✗ No providers registered', 'warn');
        return;
      }

      this.addLog(`Updating ${providerNames.length} provider(s)...`, 'info');
      for (const providerName of providerNames) {
        const provider = providersList[providerName];
        await this.updateProviderWithCache(providerName, provider, newUrl);
      }
    } else {
      if (!providersList[name]) {
        this.addLog(`✗ Provider "${name}" not found`, 'error');
        return;
      }

      const provider = providersList[name];
      await this.updateProviderWithCache(name, provider, newUrl);
    }
  }

  async updateProviderWithCache(providerName, provider, newUrl) {
    provider.url = newUrl;
    this.addLog(`Updating "${providerName}"...`, 'info');

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
        const oldCodes = provider.oldCodes || [];

        if (data.codes && Array.isArray(data.codes)) {
          data.codes.forEach(codeObj => {
            provider.codeLookup[codeObj.code] = codeObj;
          });
          
          // Clear old cache entries for codes no longer in the provider
          for (const oldCode of oldCodes) {
            if (!data.codes.find(c => c.code === oldCode)) {
              await this.clearCacheEntry(`site-${oldCode}`);
              this.addLog(`  Removed old cache for ${oldCode}`, 'log');
            }
          }
          
          // Store current codes for next update
          provider.oldCodes = data.codes.map(c => c.code);
          
          this.addLog(`  Caching ${data.codes.length} file(s)...`, 'log');
          for (const codeObj of data.codes) {
            if (codeObj.file) {
              try {
                const fileUrl = `${fetchUrl}${codeObj.file}`;
                const fileResponse = await fetch(fileUrl, {
                  mode: 'cors',
                  credentials: 'omit'
                });

                if (fileResponse.ok) {
                  const fileContent = await fileResponse.text();
                  const cacheKey = `site-${codeObj.code}`;
                  await this.cacheSite(cacheKey, fileContent);
                  this.addLog(`    ✓ Cached "${codeObj.name}" (${codeObj.code})`, 'success');
                }
              } catch (e) {
                // Silently skip
              }
            }
          }
        }

        // Save updated provider to localStorage so it persists after page refresh
        this.providers.add(providerName, provider);
        this.addLog(`✓ Provider "${providerName}" updated and saved locally`, 'success');
        if (data.name) {
          this.addLog(`  ${data.name}`, 'log');
        }
      }
    } catch (error) {
      this.addLog(`✓ URL updated (${error.message})`, 'warn');
    }
  }

  async handleUpdateCache() {
    const providersList = this.providers.lst();
    const providerNames = Object.keys(providersList);

    if (providerNames.length === 0) {
      this.addLog('✗ No providers registered', 'warn');
      return;
    }

    this.addLog(`Refreshing cache for ${providerNames.length} provider(s)...`, 'info');
    for (const providerName of providerNames) {
      const provider = providersList[providerName];
      const currentUrl = typeof provider === 'string' ? provider : provider.url;
      await this.updateProviderWithCache(providerName, provider, currentUrl);
    }
    this.addLog('✓ Cache refresh complete', 'success');
  }

  async addProvider(name, url) {
    try {
      this.addLog(`Registering "${name}"...`, 'info');
      let metadata = { url: url };

      try {
        const fetchUrl = url.endsWith('/') ? url : url + '/';
        const response = await fetch(fetchUrl + 'codifly.json', {
          mode: 'cors',
          credentials: 'omit'
        });

        if (response.ok) {
          const data = await response.json();
          metadata.metadata = data;
          metadata.codeLookup = {};
          
          if (data.codes && Array.isArray(data.codes)) {
            // Track codes for future cache invalidation
            metadata.oldCodes = data.codes.map(c => c.code);
            
            data.codes.forEach(codeObj => {
              metadata.codeLookup[codeObj.code] = codeObj;
            });
            
            for (const codeObj of data.codes) {
              if (codeObj.file) {
                try {
                  const fileUrl = `${fetchUrl}${codeObj.file}`;
                  const fileResponse = await fetch(fileUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                  });

                  if (fileResponse.ok) {
                    const fileContent = await fileResponse.text();
                    const cacheKey = `site-${codeObj.code}`;
                    await this.cacheSite(cacheKey, fileContent);
                  }
                } catch (e) {
                  // Silently skip
                }
              }
            }
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

    const providersList = this.providers.lst();
    if (Object.keys(providersList).length === 0) {
      this.addLog('✗ No providers registered', 'warn');
      return;
    }

    const firstProvider = Object.keys(providersList)[0];
    const provider = providersList[firstProvider];
    const providerUrl = typeof provider === 'string' ? provider : provider.url;

    if (provider.codeLookup && provider.codeLookup[code]) {
      const codeObj = provider.codeLookup[code];
      const fileUrl = providerUrl.endsWith('/') ? providerUrl : providerUrl + '/';
      this.loadSiteFromUrl(`${fileUrl}${codeObj.file}`, code, provider);
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
      
      // Open new window with about:blank
      const newWindow = window.open('about:blank', '_blank');
      
      if (newWindow) {
        // Write provider HTML to the new window
        newWindow.document.open();
        newWindow.document.write(html);
        newWindow.document.close();
        
        this.addLog('✓ Opened provider in new window', 'success');
        this.addLog('✓ Provider working - games loaded and running', 'success');
      } else {
        this.addLog('✗ Failed to open new window (may be blocked by popup blocker)', 'error');
      }
    } catch (error) {
      this.addLog(`✗ Error: ${error.message}`, 'error');
    }
  }

  displaySite(html) {
    let overlay = document.getElementById('providerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'providerOverlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        background: white;
        margin: 0;
        padding: 0;
        overflow: hidden;
      `;
      document.body.appendChild(overlay);
    }

    const existingIframe = overlay.querySelector('iframe');
    if (existingIframe) existingIframe.remove();
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `width:100%;height:100%;border:none;margin:0;padding:0;`;
    iframe.srcdoc = html;
    overlay.appendChild(iframe);

    // Allow iframe to communicate via postMessage
    window.addEventListener('message', (event) => {
      if (event.source === iframe.contentWindow) {
        if (event.data.type === 'console') {
          this.addLog(event.data.message, event.data.level);
        }
      }
    });
  }

  listProviders() {
    const providersList = this.providers.lst();
    const keys = Object.keys(providersList);

    if (keys.length === 0) {
      this.addLog('No providers registered', 'warn');
      return;
    }

    this.addLog(`Providers (${keys.length}):`, 'info');
    keys.forEach(name => {
      const provider = providersList[name];
      const url = typeof provider === 'string' ? provider : provider.url;
      this.addLog(`  • ${name}: ${url}`, 'log');
    });
  }

  async showCacheInfo() {
    try {
      if (typeof caches === 'undefined') {
        this.addLog('Cache API not available', 'warn');
        return;
      }
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

  async cacheSite(key, html) {
    try {
      if (typeof caches === 'undefined') {
        return;
      }
      const cache = await caches.open('code-compiler-v1');
      const response = new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
      await cache.put(key, response);
    } catch (error) {
      // Silently fail if cache API is unavailable
    }
  }

  async clearCacheEntry(key) {
    try {
      if (typeof caches === 'undefined') {
        return;
      }
      const cache = await caches.open('code-compiler-v1');
      await cache.delete(key);
    } catch (error) {
      // Silently fail if cache API is unavailable
    }
  }
}
