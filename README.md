# Code Compiler

A full-featured web code compiler with HTML, CSS, and JavaScript editor, integrated console, and advanced site loading capabilities.

## Features

### Code Editor
- **Three-Tab Interface**: Separate editors for HTML, CSS, and JavaScript
- **Full-Screen Layout**: Maximized editor workspace
- **Tab Support**: Use Tab key for indentation in all editors
- **Syntax Highlighting**: Dark VS Code-inspired theme
- **Live Execution**: Run code instantly with the Run button or Ctrl+Enter

### Debug Console
- **Full DevTools-like Console**: View logs, errors, warnings, and info messages
- **Direct Code Execution**: Type JavaScript directly to evaluate
- **Command System**: Special commands for advanced features
- **Clear Console**: Button to clear all console output

### Provider URL Management
Register external website providers and load them dynamically:

```
/register-url add (name) (url)      # Register a provider
/register-url remove (name)         # Remove a provider
/list-providers                     # Show all registered providers
```

### Site Loading via Cache Storage
- **Cache Storage Integration**: Sites are stored in browser cache for faster loading
- **Dynamic Code-Based Loading**: Load sites by entering codes
- **History Management**: Automatically replaces browser history with Google search
- **About:blank Window**: Opens loaded sites in a clean about:blank window

### Console Commands

```
/register-url add (name) (url)      # Register a URL provider
/register-url remove (name)         # Remove a registered provider
/list-providers                     # List all registered providers
/load-url (provider) (code)         # Load site from specific provider
/load-code (code)                   # Load site from first registered provider
/cache-info                         # Show cached sites
/help                               # Show all available commands
```

## How to Use

### 1. Writing Code
1. Click on **HTML**, **CSS**, or **JavaScript** tabs
2. Write your code in the editor
3. Use Tab key for indentation
4. Click **Run** or press **Ctrl+Enter** to execute

### 2. Using the Console
1. Type commands or JavaScript code in the console input at the bottom
2. Press **Enter** to execute
3. View output immediately in the console above

### 3. Setting Up Providers

#### Example: Game Site Provider
```
/register-url add games https://example-games.com/?code=
```

Now you can load games:
```
/load-code abc123
```

The compiler will:
- Fetch from `https://example-games.com/?code=abc123`
- Cache it in browser storage
- Replace browser history with a Google search
- Open the site in an `about:blank` window

### 4. Working with Cache Storage
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
- HTML, CSS, and JavaScript are combined and executed in an isolated iframe
- Console logs from user code appear in the debug console
- Errors are caught and displayed
- Code execution is sandboxed for safety

### Console Redirection
The iframe captures all console methods and sends them to the main console:
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

### Provider URLs
- Stored in browser localStorage
- Persists across sessions
- Can be added/removed dynamically
- Supports CORS requests

## Browser Compatibility

- Modern browsers with Cache Storage API support
- Requires JavaScript enabled
- Works with CORS-enabled external sites

## Tips

1. **Provider URLs**: Make sure external URLs support CORS or are on the same origin
2. **Code Safety**: All code runs in an isolated iframe
3. **Performance**: Cached sites load instantly on subsequent visits
4. **History**: Browser history is modified before opening external sites - use browser back button carefully

## Advanced Usage

### Creating Custom Providers
```javascript
// In console:
/register-url add mysite https://my-server.com/content?code=
/load-url mysite xyz789
```

### Combining Code with External Sites
You can use the code editor for development and provider URLs for showing results on external platforms.

## File Structure

```
├── index.html      # Main HTML structure
├── styles.css      # Dark theme styling
├── script.js       # All functionality
└── README.md       # This file
```

## License

Open source - free to use and modify.
