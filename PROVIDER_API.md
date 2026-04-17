# Provider API Documentation

## Overview
Providers are loaded into **new browser windows/tabs** automatically when you use `/load-code`. The original Code Compiler editor stays open in its own tab. The new window displays in about:blank mode for security reasons.

---

## How Providers Load

When you execute `/load-code CODE` in the editor:

1. **Fetch** provider files and metadata from your codifly.json
2. **Open new window**: `window.open('about:blank', '_blank')`
3. **Write HTML**: Provider HTML is written to the new window using `document.write()`
4. **Replace URL** (if enabled): `history.replaceState()` changes the address bar to your configured URL
5. **Editor stays open**: Original Code Compiler tab remains accessible

### Example Timeline
```
Editor: /load-code GAME
   ↓
Fetch game.html from provider
   ↓
window.open('about:blank', '_blank')
   ↓
newWindow.document.write(gameHtml)
   ↓
IF enabled: newWindow.history.replaceState({}, '', 'https://google.com')
   ↓
New window shows: Your game with address bar showing 'https://google.com'
   ↓
Editor tab still open - user can switch between tabs
```

---

## Configuration: codifly.json

Your `codifly.json` defines your provider metadata and available games/apps:

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
    },
    {
      "code": "ABC1",
      "name": "Another Game",
      "file": "another.html"
    }
  ]
}
```

**Fields:**
- `name` (required): Display name of your provider
- `email` (required): Contact email
- `github` (required): Link to GitHub repository
- `codes` (required): Array of code objects:
  - `code` (required): Exactly 4 alphanumeric characters (used with `/load-code CODE`)
  - `name` (required): Display name/title of the game
  - `file` (required): Relative path to HTML file

---

## Cache Management

### Initial Caching (Registration)
When you register a provider with `/register-url add <name> <url>`:
1. Fetches `codifly.json` from your provider
2. **Caches each file** specified in the `codes` array  
3. **Saves provider metadata** to localStorage (persists after page refresh)
4. Files are stored in the browser's Cache API for instant access

### Updating Cache
When you run `/update-cache`:
1. **Fetches latest `codifly.json`** from all registered providers
2. **Deletes old cached files** that are no longer in the provider
3. **Downloads and caches new/updated files** from the provider
4. **Saves updated metadata** to localStorage
5. After page refresh, the **new updated cache is used** - not the old one

**Key:** `/update-cache` ensures that when you refresh the page (`F5`), you get the latest version of your files, not stale cache.

### Example Workflow
```
1. /register-url add mygames https://example.com/games
   └─ Caches: game1.html, game2.html (v1)
   └─ Saves metadata to localStorage

2. [You update game1.html on your server to v2]

3. /update-cache
   └─ Fetches codifly.json again
   └─ Detects game1.html updated
   └─ Deletes old cached game1.html (v1)
   └─ Caches new game1.html (v2)
   └─ Saves updated metadata to localStorage

4. /load-code GAME (or page refresh)
   └─ Loads game1.html (v2) from updated cache
   └─ NOT v1 anymore
```



## Console Communication

Since providers run in **isolated windows**, there is no direct communication with the editor console. However, you can display logs within your provider using:

```javascript
console.log('Your message here');
```

This will appear in the provider window's console (F12), not the editor's console.

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
      // Log before closing
      console.log('Game closed by user');
      
      // Close the window
      window.close();
    }

    // On load
    console.log('Provider loaded successfully!');
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
  ]
}
```

**Fields:**
- `code` (required): Exactly 4 alphanumeric characters, used to load via `/load-code ABC1`
- `name` (required): Display name shown in provider list
- `file` (required): Relative path to HTML file

---

## Security & Considerations

- All communication is **same-origin** within the iframe sandbox
- `postMessage` uses `'*'` for convenience in iframes (customize in your provider)
- History replacement respects CORS - make sure your `historyReplace.url` is accessible
- Provider content runs in **isolated iframe** - no direct access to editor's localStorage

---

## Troubleshooting

**Q: New window not opening?**
- Check if your browser is blocking popups from this site
- Allow popups from Code Compiler in your browser settings
- Try disabling popup blockers or add-ons

**Q: Can't see provider content?**
- Check that the HTML file path in `codifly.json` is correct
- Verify codifly.json is being fetched (check Network tab in F12)
- Check browser console for error messages
- Ensure HTML file is valid and accessible via CORS

**Q: How do I go back to the editor?**
- Click the X button on the provider window to close it
- Or use Alt+Tab to switch to the Code Compiler tab
- The editor stays open in its original tab

