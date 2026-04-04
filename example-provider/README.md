# Example Provider Setup Guide

This folder demonstrates how to create a provider site for the Code Compiler.

## ⚠️ CRITICAL: codifly.json is MANDATORY

**Every valid Codifly provider MUST have `codifly.json` in the root directory.**

This file identifies your site as a Codifly provider. Code Compiler requires it to:
- Recognize your provider as valid
- Auto-discover provider metadata
- Establish trust relationship
- Allow content loading

**Without codifly.json, Code Compiler will NOT load your provider. Period.**

## What is a Provider?

A provider is a web server that hosts games, sites, or content that can be loaded into the Code Compiler through the console using special commands.

## Code Format (IMPORTANT)

**All codes MUST be exactly 4 characters: letters (a-z, A-Z) and/or digits (0-9)**

Valid examples:
- `abc1` ✅
- `test` ✅
- `9999` ✅
- `xYz0` ✅

Invalid examples:
- `ab` ❌ (too short)
- `abcde` ❌ (too long)
- `abc!` ❌ (special character)
- `-abc` ❌ (special character)

When a user loads a code, Code Compiler validates it and sends it to the provider:
```
/load-code abc1  →  https://your-provider.com/?code=abc1
```

## How It Works

1. **Register a Provider URL**: 
   ```
   /register-url add games https://your-provider.com/?code=
   /reg-url add games https://your-provider.com/?code=
   ```

2. **Load Content by Code** (4-char alphanumeric):
   ```
/load-url games snk1
/load-code test
```

3. **Provider Route Handling**:
   - When user loads code `abc1`
   - Code Compiler validates: must be 4 alphanumeric characters ✓
   - Request goes to: `https://your-provider.com/?code=abc1`
   - Your server/site returns the HTML/game for that code
   - Code Compiler caches the assets (per codifly.json) and opens in preview

## Provider Requirements

### 1. codifly.json (ABSOLUTELY MANDATORY ✅ REQUIRED)
Located at: `https://your-provider.com/codifly.json`

**This file is NOT optional. It is required.**

```json
{
  "name": "Provider Name",
  "github": "your-github-username",
  "email": "contact@example.com",
  "codeGen": "random"
}
```

**All four fields are REQUIRED:**
- `name`: Display name of your provider (required)
- `github`: GitHub username of maintainer (required)
- `email`: Contact email (required)
- `codeGen`: How codes are generated (required):
  - `"random"` - Codes generated randomly
  - `"site"` - Codes determined by the website
  - `"user"` - Users can create their own codes

**Optional fields:**
- `cache`: Specifies what assets Code Compiler should cache
  - `type`: Type of content ("html", "json", "image", etc.)
  - `description`: What gets cached
- `codes`: (Optional) Array of available codes with metadata
  - Each code can list its name and what assets it uses
  - Helps Code Compiler understand what to cache for each code
  - Format: `{ "code": "snk1", "name": "Snake", "type": "html", "assets": [...] }`

**Complete Example:**
```json
{
  "name": "Example Game Hub",
  "github": "your-username",
  "email": "you@example.com",
  "codeGen": "random",
  "cache": {
    "type": "html",
    "description": "Games served as complete HTML responses"
  },
  "codes": [
    {
      "code": "snk1",
      "name": "Snake Game",
      "type": "html",
      "assets": ["game HTML (inline JavaScript and CSS)"]
    }
  ]
}
```

Without this file, Code Compiler has no way to identify your provider as valid.

### 2. Routing Handler
Your server must handle requests with `?code=` parameter and return HTML content.

## Example: Simple Node.js Server

```javascript
// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const games = {
  'snk1': '<html><body><h1>Game 1</h1><p>This is game 1</p></body></html>',
  'gm02': '<html><body><h1>Game 2</h1><p>This is game 2</p></body></html>',
  'test': fs.readFileSync('./games/test.html', 'utf8')
  '2048': fs.readFileSync('./games/2048.html', 'utf8'),
  'test123': fs.readFileSync('./games/test.html', 'utf8')
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Handle codifly.json
  if (url.pathname === '/codifly.json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'Example Game Hub',
      github: 'your-username',
      email: 'you@example.com',
      codeGen: 'random'
    }));
    return;
  }
  
  // Handle game requests
  const code = url.searchParams.get('code');
  
  if (code && games[code]) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(games[code]);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(404);
    res.end('<h1>Game not found</h1><p>Code: ' + code + '</p>');
  }
});

server.listen(3000, () => {
  console.log('Provider running on http://localhost:3000');
  console.log('Register with: /register-url add games http://localhost:3000/?code=');
});
```

## Example: PHP Server

```php
<?php
// index.php
header('Content-Type: text/html');
header('Access-Control-Allow-Origin: *');

$code = $_GET['code'] ?? null;

// Handle codifly.json
if ($_SERVER['REQUEST_URI'] === '/codifly.json') {
  header('Content-Type: application/json');
  echo json_encode([
    'name' => 'Example Game Hub',
    'github' => 'your-username',
    'email' => 'you@example.com',
    'codeGen' => 'random'
  ]);
  exit;
}

if (!$code) {
  http_response_code(400);
  echo '<h1>Missing code parameter</h1>';
  exit;
}

// Map codes to content
$games = [
  'game001' => file_get_contents('./games/game1.html'),
  'game002' => file_get_contents('./games/game2.html'),
  'snake' => file_get_contents('./games/snake.html'),
  '2048' => file_get_contents('./games/2048.html'),
];

if (isset($games[$code])) {
  echo $games[$code];
} else {
  http_response_code(404);
  echo '<h1>Game not found!</h1><p>Code: ' . htmlspecialchars($code) . '</p>';
}
?>
```

## Example: Static HTML with JavaScript Routing

You can also use a simple static HTML file with JavaScript routing:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Provider Router</title>
</head>
<body>
  <div id="content"></div>
  
  <script>
    // Get the code from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    // Games database
    const games = {
      'snake': `<iframe src="/games/snake.html"></iframe>`,
      'pong': `<iframe src="/games/pong.html"></iframe>`,
      '2048': `<iframe src="/games/2048.html"></iframe>`
    };
    
    const content = document.getElementById('content');
    
    if (!code) {
      content.innerHTML = '<h1>Provider Active</h1><p>Send a code via ?code=parameter</p>';
    } else if (games[code]) {
      content.innerHTML = games[code];
    } else {
      content.innerHTML = `<h1>Game not found</h1><p>Code: ${code}</p>`;
    }
  </script>
</body>
</html>
```

## Setting Up This Example Provider

### Option 1: Local Node.js Server

```bash
cd /workspaces/Code-Codifly/example-provider
node server.js
```

Then in Code Compiler console:
```
/register-url add example http://localhost:3000/?code=
/load-code snk1
```

### Option 2: Local Python Server

```bash
cd /workspaces/Code-Codifly/example-provider
python3 server.py
```

### Option 3: Deploy to the Cloud

Popular free hosting options:
- **Vercel** (Node.js, Python)
- **Heroku** (Node.js, Python, PHP)
- **Netlify** (Static with serverless functions)
- **Replit** (Node.js, Python)
- **Railway** (Node.js, Python, PHP)

## File Structure

```
example-provider/
├── codifly.json              # Provider metadata
├── index.html                # Main router (or start here)
├── server.js                 # Node.js example
├── server.py                 # Python example
├── games/
│   ├── snake.html
│   ├── pong.html
│   └── 2048.html
└── README.md                 # This file
```

## Usage in Code Compiler

1. **Register your provider**:
   ```
   /register-url add mygames https://your-provider.com/?code=
   ```

2. **See provider info** (if codifly.json exists):
   ```
   /reg-url list
   ```

3. **Load a game**:
   ```
   /load-url mygames snake
   /load-code pong
   ```

4. **Check cache**:
   ```
   /cache-info
   ```

5. **Remove provider**:
   ```
   /register-url remove mygames
   ```

## CORS Headers Required

Make sure your server responds with:
```
Access-Control-Allow-Origin: *
Content-Type: text/html
```

This allows Code Compiler to fetch from your provider.

## Tips

1. **Security**: Don't store sensitive data in codes
2. **Performance**: Compress content for faster loading
3. **Caching**: Code Compiler caches all loaded sites
4. **About:blank**: Sites open in `about:blank` windows
5. **History**: Browser history is replaced with Google search

## Testing

Test your provider directly in browser:
```
https://your-provider.com/?code=test123
```

Should return valid HTML content.

## More Examples

See the games folder for example implementations of:
- 2048
- Snake
- Flappy Bird
- Tic Tac Toe
- More...
