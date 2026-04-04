# Example Provider Setup Guide

This folder demonstrates how to create a **STATIC provider** for Code Compiler.

## ⚠️ CRITICAL: Providers Are STATIC (No Servers)

**A provider is a collection of static files.** No Node.js, no Python, no server code needed!

- Provider = HTML files + codifly.json
- Codes = Defined in codifly.json
- Caching = Code Compiler handles everything
- Just serve the files with any static server

## ⚠️ MANDATORY: codifly.json

**Every valid Codifly provider MUST have `codifly.json` in the root directory.**

This file tells Code Compiler:
- What codes are available (e.g., snk1, gm48, pong)
- What files to cache
- Provider metadata (name, creator, email)
- Whether codes are site-defined or randomly generated

**Without codifly.json, Code Compiler will NOT recognize your provider.**

## What is a Provider?

A **provider** is a collection of static HTML files plus a codifly.json metadata file. Code Compiler loads content from the provider using predefined 4-character codes.

## Code Format (IMPORTANT)

**All codes MUST be exactly 4 alphanumeric characters (a-z, A-Z, 0-9)**

Valid examples:
- `snk1` ✅ (code for Snake game)
- `gm48` ✅ (code for 2048 game)
- `pong` ✅ (code for Pong game)

Invalid examples:
- `abc` ❌ (too short)
- `abcde` ❌ (too long)
- `abc!` ❌ (special character)

## How It Works

1. **Define codes in codifly.json**: 
   ```json
   "codeGen": "site",
   "codes": [
     { "code": "snk1", "name": "Snake", "file": "games/snake.html" },
     { "code": "gm48", "name": "2048", "file": "games/2048.html" }
   ]
   ```

2. **User registers provider**:
   ```
   /register-url add games https://your-provider.com/
   ```
   Code Compiler fetches `codifly.json` and learns about your codes

3. **User loads a code**:
   ```
   /load-code snk1
   ```
   Code Compiler looks up "snk1" in codifly.json, finds it maps to `games/snake.html`

4. **Provider serves the file**: 
   Code Compiler fetches the static HTML file and caches it

## Provider Requirements

### 1. codifly.json (ABSOLUTELY MANDATORY ✅ REQUIRED)
Located at: `https://your-provider.com/codifly.json`

**This file is NOT optional. It is required.**

```json
{
  "name": "Example Game Hub",
  "github": "your-github-username",
  "email": "contact@example.com",
  "codeGen": "site",
  "codes": [
    {
      "code": "snk1",
      "name": "Snake Game",
      "file": "games/snake.html"
    },
    {
      "code": "gm48",
      "name": "2048 Game",
      "file": "games/2048.html"
    }
  ]
}
```

**Required fields:**
- `name`: Display name of your provider
- `github`: GitHub username of maintainer
- `email`: Contact email
- `codeGen`: `"site"` (codes are predefined in JSON) or `"random"` (Code Compiler generates random codes)
- `codes`: Array of code mappings (only if codeGen: "site")

**codes array format:**
```json
{
  "code": "snk1",           # 4-character code
  "name": "Snake Game",     # Display name
  "file": "games/snake.html" # Path to static HTML file
}
```

**What codeGen means:**
- `"site"` → Codes listed in codifly.json (like snk1, gm48, pong)
- `"random"` → Code Compiler generates random 4-char codes for users
- `"user"` → Users can create their own codes

Without this file, Code Compiler cannot recognize your provider.

### 2. Static HTML Files
Your provider must have HTML files for each code defined in codifly.json:

```
example-provider/
├── codifly.json
└── games/
    ├── snake.html    (code: snk1)
    ├── 2048.html     (code: gm48)
    └── pong.html     (code: pong)
```

Each HTML file should be **complete and self-contained** with inline CSS and JavaScript.

## Example: Static Provider Structure

Create these files:
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
