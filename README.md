# Code Compiler

A full-featured web code compiler with HTML, CSS, and JavaScript editor, integrated console, live preview panel, and advanced site loading capabilities.

## 🚀 Quick Links

- **[Get Started](example-provider/QUICKSTART.md)** - 30-second setup
- **[Deploy a Provider](example-provider/DEPLOYMENT.md)** - Cloud hosting options  
- **[Create a Provider](example-provider/README.md)** - Provider development guide
- **⚠️ [codifly.json is MANDATORY](example-provider/README.md#1-codifyjson-absolutely-mandatory--required-for-code-compiler-to-recognize-the-provider-as-valid)** - Every provider needs it

## Features

### Code Editor
- **Three-Tab Interface**: Separate editors for HTML, CSS, and JavaScript
- **Full-Screen Layout**: Maximized editor workspace
- **Tab Support**: Use Tab key for indentation in all editors
- **Syntax Highlighting**: Dark VS Code-inspired theme
- **Live Execution**: Run code instantly with the Run button or Ctrl+Enter

### Live Preview Panel
- **Split-View Layout**: Editor on left, live preview on right
- **Draggable Divider**: Resize panels by dragging the divider between them
- **Fullscreen Mode**: Click ⛶ button to expand preview to fullscreen
- **White Background**: Clean canvas for your rendered code

### Debug Console
- **Full DevTools-like Console**: View logs, errors, warnings, and info messages
- **Direct Code Execution**: Type JavaScript directly to evaluate
- **Command System**: Special commands for advanced features
- **Clear Console**: Button to clear all console output

### Provider URL Management (Hidden System)
The provider registration system is now hidden and encrypted for security:
- Stored in an obfuscated `providers.js` file
- Base64 encoded data in localStorage
- Minimal, compressed implementation

Register external website providers:

```
/register-url add (name) (url)      # Register a provider
/register-url remove (name)         # Remove a provider
/list-providers                     # Show all registered providers
```

Or use the shorthand:

```
/reg-url add (name) (url)           # Same as /register-url
/reg-url remove (name)              
/reg-url list                       
```

### Site Loading via Cache Storage
- **Cache Storage Integration**: Sites are stored in browser cache for faster loading
- **Dynamic Code-Based Loading**: Load sites by entering codes
- **History Management**: Automatically replaces browser history with Google search
- **About:blank Window**: Opens loaded sites in a clean about:blank window
- **Completely Hidden**: No visible/readable iframe or provider system code

### Console Commands

```
/register-url (add/remove/list) (name) (url)  # Provider management
/reg-url (add/remove/list) (name) (url)       # Shorthand
/load-url (provider) (code)                   # Load site from specific provider
/load-code (code)                             # Load site from first registered provider
/cache-info                                   # Show cached sites
/help                                         # Show all available commands
```

## How to Use

### 1. Writing Code
1. Click on **HTML**, **CSS**, or **JavaScript** tabs
2. Write your code in the editor
3. Use Tab key for indentation
4. Click **Run** or press **Ctrl+Enter** to execute
5. See live preview on the right side

### 2. Resizing Panels
- Drag the divider between editor and preview to resize
- Panels remember their relative sizes

### 3. Fullscreen Preview
- Click the **⛶** button in the preview header
- Click again to return to split-view

### 4. Using the Console
1. Type commands or JavaScript code in the console input at the bottom
2. Press **Enter** to execute
3. View output immediately in the console above

### 5. Setting Up Providers

#### Example: Game Site Provider
```
/register-url add games https://example-games.com/?code=
```

Now you can load games (codes must be 4 alphanumeric characters):
```
/load-code snk1
```

The compiler will:
- Fetch from `https://example-games.com/?code=snk1` (only 4-char codes)
- Cache it in browser storage
- Replace browser history with a Google search
- Open the site in an `about:blank` window

### 6. Working with Cache Storage
View all cached sites:
```
/cache-info
```

## Example Setup

```javascript
// In console:
/register-url add games https://example.com/game?id=
/register-url add apps https://example.com/app?code=

// Load a game
/load-url games secret123

// View what's cached
/cache-info

// Remove a provider when done
/register-url remove games
```

## Keyboard Shortcuts

- **Ctrl+Enter** (Cmd+Enter on Mac): Run code
- **Tab**: Insert tab in editor
- **Enter** (in console): Execute command

## Features in Detail

### Code Execution
- HTML, CSS, and JavaScript are combined and executed in an isolated hidden iframe
- Console logs from user code appear in the debug console
- Errors are caught and displayed
- Code execution is sandboxed for safety
- No comments in generated HTML for cleaner output

### Console Redirection
The hidden iframe captures all console methods and sends them to the main console:
- `console.log()` - Standard logs
- `console.error()` - Error messages (red)
- `console.warn()` - Warnings (yellow)
- `console.info()` - Info messages (blue)

### Cache Storage
- Sites are stored using the Cache Storage API
- Uses `code-compiler-v1` cache version
- Can store multiple sites
- Persistent across refreshes
- Check browser DevTools Storage > Cache Storage to see cached sites

### Provider System (Hidden)
- Stored in encrypted format using Base64 encoding
- Stored in browser localStorage
- Completely obfuscated in `providers.js`
- Persists across sessions
- Can be added/removed dynamically
- Supports CORS requests
- Metadata extracted from provider's `codifly.json` file

### codifly.json Format
Providers can include a `codifly.json` file at the root:

```json
{
  "name": "My Game Site",
  "github": "username",
  "email": "user@example.com",
  "codeGen": "random"
}
```

Properties:
- `name`: Display name of the provider
- `github`: GitHub username of creator
- `email`: Contact email
- `codeGen`: Type of code generation (random, site, or user)

## Browser Compatibility

- Modern browsers with Cache Storage API support
- Requires JavaScript enabled
- Works with CORS-enabled external sites

## Security & Privacy

- Code executes in isolated iframe (XSS protected)
- Provider system is obfuscated and encrypted
- No sensitive data shared with external servers
- Your editor code stays local unless you explicitly load external sites
- Browser history replacements done client-side only

## File Structure

```
├── index.html      # Main UI structure
├── styles.css      # Dark theme styling  
├── script.js       # Main application (obfuscated)
├── providers.js    # Hidden provider system (encrypted/obfuscated)
└── README.md       # This file
```

## Tips

1. **Provider URLs**: Make sure external URLs support CORS or are on the same origin
2. **Code Safety**: All code runs in an isolated iframe
3. **Performance**: Cached sites load instantly on subsequent visits
4. **History**: Browser history is modified before opening external sites - use browser back button carefully
5. **Privacy**: Provider registration is stored locally, not sent to any server

## Advanced Usage

### Creating Custom Providers
```javascript
// In console:
/register-url add mysite https://my-server.com/content?code=
/load-url mysite xyz789
```

### Combining Code with External Sites
You can use the code editor for development and provider URLs for showing results on external platforms.

## License

Open source - free to use and modify.

