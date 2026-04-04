# 🔴 MANDATORY: codifly.json

This document explains why `codifly.json` is absolutely required for any provider to work with Code Compiler.

## The Rule

**EVERY provider MUST have a `codifly.json` file in its root directory.**

This is not optional. It is mandatory. Without it, your provider will not work.

## Code Format Rule

**All codes MUST be exactly 4 alphanumeric characters (letters a-z, A-Z and/or digits 0-9)**

Valid codes:
- `abc1` ✅ (3 letters, 1 digit)
- `test` ✅ (4 letters)
- `0000` ✅ (4 digits)
- `Xy9a` ✅ (mixed case, letters and digits)

Invalid codes (will be rejected by Code Compiler):
- `abc` ❌ (3 chars - too short)
- `abcde` ❌ (5 chars - too long)
- `abc!` ❌ (special character not allowed)
- `abc_1` ❌ (underscore not allowed)
- `abc-1` ❌ (dash not allowed)

When users try to load an invalid code, Code Compiler displays:
```
❌ Code must be exactly 4 alphanumeric characters (a-z, A-Z, 0-9)
```

Your provider should also validate codes using the regex:
```javascript
/^[a-zA-Z0-9]{4}$/
```

## Why Is codifly.json Mandatory?

`codifly.json` is the **provider identification file**. It tells Code Compiler:

1. **Provider Identity**: "This is a real Codifly provider, not just any website"
2. **Provider Metadata**: Name, creator, contact info
3. **Provider Capability**: What type of code generation it uses
4. **What to Cache**: What assets need to be cached for each code
5. **Available Content**: What codes are available and what they contain

Without `codifly.json`, Code Compiler cannot:
- Determine if a site is a provider or just a regular website
- Get provider metadata
- Establish provider capabilities
- Know what to cache
- Trust loading content from the site

## Required Fields

Every `codifly.json` MUST include ALL four of these fields:

```json
{
  "name": "Display name of your provider",
  "github": "Your GitHub username",
  "email": "Your contact email",
  "codeGen": "random|site|user"
}
```

### Field Descriptions

| Field | Type | Required | Example | Purpose |
|-------|------|----------|---------|---------|
| `name` | string | ✅ YES | "Example Game Hub" | Display name shown in Code Compiler |
| `github` | string | ✅ YES | "your-username" | Creator's GitHub for credibility |
| `email` | string | ✅ YES | "you@example.com" | Contact info for support |
| `codeGen` | string | ✅ YES | "random", "site", or "user" | How codes are generated |

All fields must be present. Do not skip any.

### codeGen Types

- **`"random"`** - Your provider generates random codes (typical for game hubs)
- **`"site"`** - The site itself determines what codes mean (like a URL router)
- **`"user"`** - Users can create their own codes

## Optional Fields: Caching Instructions

Code Compiler uses the optional `cache` and `codes` fields to know what to cache:

```json
{
  "cache": {
    "type": "html",
    "description": "Games served as complete HTML responses"
  },
  "codes": [
    {
      "code": "snk1",
      "name": "Snake Game",
      "type": "html",
      "assets": [
        "game HTML (inline JavaScript and CSS)"
      ]
    },
    {
      "code": "2048",
      "name": "2048 Game",
      "type": "html",
      "assets": [
        "game HTML (inline JavaScript and CSS)"
      ]
    }
  ]
}
```

### Cache Field

```json
"cache": {
  "type": "html|json|image|text",
  "description": "What gets cached"
}
```

- `type`: Type of content being cached
  - `"html"` - HTML pages/games (typical)
  - `"json"` - JSON data
  - `"image"` - Image files
  - `"text"` - Text content
- `description`: What is actually cached (for user reference)

### Codes Field (Optional but Recommended)

Array of objects describing available codes:

```json
"codes": [
  {
    "code": "snk1",                    # 4-character code
    "name": "Snake Game",             # Friendly name
    "type": "html",                   # Content type
    "assets": [                       # What gets cached
      "game HTML (inline JavaScript and CSS)"
    ]
  }
]
```

Each code entry:
- `code` - The 4-character code (MUST be 4 alphanumeric)
- `name` - Human-readable display name
- `type` - Type of content served
- `assets` - List of what gets cached (descriptions or file paths)

## Complete codifly.json Example

```json
{
  "name": "My Game Hub",
  "github": "john-doe",
  "email": "john@example.com",
  "codeGen": "random",
  "description": "A collection of fun games",
  "version": "1.0.0",
  "cache": {
    "type": "html",
    "description": "Game pages with inline JavaScript and CSS"
  },
  "codes": [
    {
      "code": "snk1",
      "name": "Snake Game",
      "type": "html",
      "assets": ["game HTML (inline JavaScript and CSS)"]
    },
    {
      "code": "2048",
      "name": "2048 Puzzle",
      "type": "html",
      "assets": ["game HTML (inline JavaScript and CSS)"]
    },
    {
      "code": "pong",
      "name": "Pong Game",
      "type": "html",
      "assets": ["game HTML (inline JavaScript and CSS)"]
    }
  ]
}
```

## File Location

The file MUST be at the **root** of your provider:

```
https://your-provider.com/codifly.json
```

NOT at any of these:
- ❌ `https://your-provider.com/meta/codifly.json`
- ❌ `https://your-provider.com/config/codifly.json`
- ❌ `https://your-provider.com/api/codifly.json`

It must be at the root with the exact filename: `codifly.json`

## Valid JSON Format

Your file must be **valid JSON**. This is invalid:

```json
{
  "name": "My Provider",
  "github": "username",
  "email": "email@example.com",
  "codeGen": "random"
  // Comments are not allowed in JSON!
}
```

This is valid:

```json
{
  "name": "My Provider",
  "github": "username",
  "email": "email@example.com",
  "codeGen": "random"
}
```

No comments. Valid JSON only.

## Server Requirements

When deploying your provider, ensure:

1. **File exists**: `codifly.json` must be present
2. **File is readable**: Server must be able to serve it when requested
3. **CORS headers**: Must include `Access-Control-Allow-Origin: *` when serving it:
   ```
   GET /codifly.json HTTP/1.1
   ...
   
   HTTP/1.1 200 OK
   Content-Type: application/json
   Access-Control-Allow-Origin: *
   
   { "name": "...", ... }
   ```
4. **Valid JSON**: The file must contain valid JSON (checked when Code Compiler fetches it)

## Code Validation in Your Provider

Your server should validate the 4-character code format:

**JavaScript/Node.js:**
```javascript
const isValidCode = /^[a-zA-Z0-9]{4}$/.test(code);
```

**Python:**
```python
import re
is_valid_code = bool(re.match(r'^[a-zA-Z0-9]{4}$', code))
```

**PHP:**
```php
$is_valid_code = preg_match('/^[a-zA-Z0-9]{4}$/', $code);
```

If an invalid code is received, return a 400 error:
```html
<h1>Invalid Code</h1>
<p>Codes must be exactly 4 alphanumeric characters</p>
```

## Registration Flow

When a user registers your provider:

```
User: /register-url add games https://my-provider.com/?code=
↓
Code Compiler: Fetches https://my-provider.com/codifly.json
↓
Code Compiler: Reads cache field to know what to cache
↓
Code Compiler: Reads codes field to show available options
↓
If found AND valid: ✅ Provider registered successfully
If not found OR invalid: ❌ Provider registration fails
↓
User: /load-code snk1
↓
Code Compiler: Validates snk1 is 4-char alphanumeric ✓
↓
Code Compiler: Fetches https://my-provider.com/?code=snk1
↓
Provider: Returns HTML content for code snk1
↓
Code Compiler: Caches assets (per codifly.json specifications)
↓
Code Compiler: Opens content in preview pane
```

## Verification

To verify your provider is correctly set up:

1. **Check file exists**: 
   - Visit `https://your-provider.com/codifly.json` in your browser
   - Should show the JSON content, not a 404 error

2. **Check valid JSON**:
   - Copy the JSON content
   - Paste at [jsonlint.com](https://www.jsonlint.com) to validate
   - Should show no errors

3. **Check CORS**:
   - Open browser dev tools (F12)
   - Try registering in Code Compiler
   - Should not show CORS errors in console

4. **Check all required fields**:
   - File must have: `name`, `github`, `email`, `codeGen`
   - All fields must have values (non-empty strings)

5. **Check cache field** (if provided):
   - `cache.type` should be a valid type
   - `cache.description` should describe what gets cached

6. **Check codes field** (if provided):
   - Each code must be exactly 4 alphanumeric characters
   - Each code must have `name`, `type`, and `assets` fields

7. **Test loading**:
   - Register provider
   - Try loading with valid code: `/load-code snk1`
   - Should load content or return 404
   - Try with invalid code: `/load-code abc`
   - Should be rejected by Code Compiler before reaching server

## Common Mistakes

### ❌ No codifly.json file
**Problem**: File doesn't exist or can't be accessed  
**Solution**: Create file in provider root directory

### ❌ Invalid JSON
**Problem**: Syntax errors (missing quotes, trailing commas, comments)  
**Solution**: Validate at jsonlint.com

### ❌ Missing required fields
**Problem**: File exists but doesn't have name, github, email, or codeGen  
**Solution**: Add all four required fields with values

### ❌ File in wrong location
**Problem**: File at `/api/codifly.json` instead of `/codifly.json`  
**Solution**: Move to provider root

### ❌ No CORS headers
**Problem**: Browser won't load the file due to CORS restrictions  
**Solution**: Add `Access-Control-Allow-Origin: *` header when serving the file

### ❌ Empty required fields
**Problem**: Fields like `"name": ""` are empty  
**Solution**: Put actual values in all required fields

### ❌ Invalid codes in cache field
**Problem**: Codes like `ab`, `abcde` listed in codes array  
**Solution**: Ensure all codes are exactly 4 alphanumeric characters

### ❌ Cache type not specified
**Problem**: Cache field exists but type is missing  
**Solution**: Add `"type": "html"` or appropriate content type

### ❌ Assets not documented
**Problem**: Cache field has no description of what gets cached  
**Solution**: Add `"description"` and list `"assets"` in codes

## Summary

**TL;DR:**
- ✅ Create `codifly.json` in provider root
- ✅ Include all 4 required fields: name, github, email, codeGen
- ✅ Add optional `cache` field to specify what gets cached
- ✅ Add optional `codes` array to list available codes
- ✅ Use valid JSON format (no comments)
- ✅ Ensure server serves it with CORS headers
- ✅ Validate all codes are exactly 4 alphanumeric characters
- ✅ Test by visiting `https://your-provider.com/codifly.json`
- ✅ Test by registering in Code Compiler

This single file is what makes Code Compiler recognize your provider as valid, trustworthy, and correctly configured.

---

**Questions?** Read the full [Provider Setup Guide](example-provider/README.md)

**Ready to deploy?** See [Deployment Options](example-provider/DEPLOYMENT.md)

**Need a quick start?** Follow [Quick Start Guide](example-provider/QUICKSTART.md)
