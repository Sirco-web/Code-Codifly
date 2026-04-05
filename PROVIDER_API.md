# Provider API Documentation

## Overview
Providers can now interact with the Code Compiler Pro editor using a simple API exposed via `window.parent`.

---

## API Methods

### 1. Close Provider and Return to Editor
**Method:** `window.parent.closeProviderOverlay()`

Close the provider overlay and return focus to the editor.

```javascript
// Direct function call
window.parent.closeProviderOverlay();

// Alternative: via postMessage
window.parent.postMessage({ type: 'closeProvider' }, '*');
```

**Example: Close button in provider**
```html
<button onclick="window.parent.closeProviderOverlay()">Close & Back to Editor</button>
```

---

## Configuration: History Replacement

In your `codifly.json`, configure history replacement behavior:

```json
{
  "name": "My Provider",
  "email": "contact@example.com",
  "github": "https://github.com/user/repo",
  "codes": [
    {
      "code": "GAME",
      "name": "Game Title",
      "file": "game.html"
    }
  ],
  "historyReplace": {
    "enabled": true,
    "url": "https://www.google.com"
  }
}
```

**Important:** Set `"enabled": true` to activate history replacement. If `enabled` is `false` or omitted, the provider displays normally without any history changes.

### History Replacement Flow
When `historyReplace.enabled` is `true`:

1. **T=0s**: Provider overlay displays in iframe
2. **T=0s**: `window.location.replace('about:blank')` executes
3. **T=0-3s**: User sees provider content in iframe overlay
4. **T=3s**: `window.location.replace(historyUrl)` executes to configured URL
5. Browser history entry is now the coded URL
6. User can close provider to return to editor

### Timeline Example
```
[Editor] /load-code GAME
    ↓
Fetch game.html + metadata from provider
    ↓
Display provider in iframe overlay
    ↓
Check if historyReplace.enabled === true
    ↓ YES
Set window.location.replace('about:blank')
    ↓
[Wait 3 seconds - user sees provider playing]
    ↓
Execute window.location.replace('https://www.google.com')
    ↓
[User can now press "back" to return to editor]
```

### No History Replacement
If `historyReplace.enabled` is `false` or omitted:

```json
"historyReplace": {
  "enabled": false,
  "url": "https://www.google.com"
}
```

or simply omit it:

```json
// historyReplace section not present
```

**Result:** Provider displays normally, history is NOT modified. User cannot press "back" to leave (must use close button).

---

## Console Communication

Send console messages from provider to editor console:

```javascript
window.parent.postMessage({
  type: 'console',
  message: 'Custom message',
  level: 'log'    // 'log', 'info', 'warn', 'error', 'success'
}, '*');
```

**Example:**
```javascript
function onGameStart() {
  window.parent.postMessage({
    type: 'console',
    message: 'Game started!',
    level: 'info'
  }, '*');
}
```

---

## Example Provider HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #222;
      color: white;
      font-family: Arial, sans-serif;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>My Awesome Game</h1>
  <p>Playing in Code Compiler Pro</p>
  
  <button onclick="closeGame()">Close & Back to Editor</button>

  <script>
    function closeGame() {
      // Notify editor we're closing
      window.parent.postMessage({
        type: 'console',
        message: 'Game closed by user',
        level: 'info'
      }, '*');
      
      // Close the overlay
      window.parent.closeProviderOverlay();
    }

    // On load
    window.parent.postMessage({
      type: 'console',
      message: 'Provider loaded successfully!',
      level: 'success'
    }, '*');
  </script>
</body>
</html>
```

---

## codifly.json Template

```json
{
  "name": "Your Provider Name",
  "email": "your@email.com",
  "github": "https://github.com/yourname/yourrepo",
  "codes": [
    {
      "code": "ABC1",
      "name": "First Game/App",
      "file": "game1.html"
    },
    {
      "code": "XYZ9",
      "name": "Second Game/App",
      "file": "game2.html"
    }
  ],
  "historyReplace": {
    "enabled": false,
    "url": "https://www.google.com"
  }
}
```

**Fields:**
- `code` (required): Exactly 4 alphanumeric characters, used to load via `/load-code ABC1`
- `name` (required): Display name shown in provider list
- `file` (required): Relative path to HTML file
- `historyReplace.enabled` (boolean): Set to `true` to enable history replacement (default: `false`)
  - When `true`: At T=3s, history is replaced to the configured URL
  - When `false` or omitted: No history modifications, provider displays normally
- `historyReplace.url`: URL to replace history with after 3 seconds (typically a redirect/cover URL like Google)

---

## Security & Considerations

- All communication is **same-origin** within the iframe sandbox
- `postMessage` uses `'*'` for convenience in iframes (customize in your provider)
- History replacement respects CORS - make sure your `historyReplace.url` is accessible
- Provider content runs in **isolated iframe** - no direct access to editor's localStorage

---

## Troubleshooting

**Q: Close button not working?**
- Ensure you're calling `window.parent.closeProviderOverlay()` from within the iframe
- Check browser console for errors

**Q: History not replacing?**
- Verify `historyReplace.enabled` is `true` in codifly.json
- Check that `historyReplace.url` is a valid HTTPS URL
- Some browsers may block certain domains

**Q: Can't see provider content?**
- Check that the HTML file path in `codifly.json` is correct
- Verify codifly.json is being fetched (check Network tab)
- Check editor console for error messages

