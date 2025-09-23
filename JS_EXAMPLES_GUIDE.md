# JavaScript-Only Examples Guide

This guide shows how to use examples in your ReSpec templates using only JavaScript (no Python processing needed).

## How It Works

The `example.js` script automatically:
1. **Scans** for HTML elements with class `.examples`
2. **Creates** tabbed interfaces with Turtle and JSON-LD tabs
3. **Loads** example files via AJAX
4. **Adds** interactive features (copy, playground, syntax highlighting)

## File Structure Required

```
implementation/demo_ontology/respec-resources/
├── assets/
│   ├── examples/
│   │   ├── example1.ttl      # Turtle version
│   │   ├── example1.jsonld   # JSON-LD version
│   │   ├── example2.ttl      # Another example
│   │   └── example2.jsonld
│   └── example.js            # The JavaScript file
└── templates/
    └── your-template.j2
```

## Usage in Templates

### Basic Usage
```html
<!-- This creates an example with ID "example1" -->
<div class="h3 examples" id="example1">Example 1 - Basic dataset</div>
```

### Custom Title
```html
<!-- Custom title with any ID -->
<div class="h3 examples" id="bee-population">Example - Bee population dataset</div>
```

### Multiple Examples
```html
<div class="h3 examples" id="example1">Example 1 - Basic usage</div>
<p>Some explanation...</p>

<div class="h3 examples" id="example2">Example 2 - Advanced usage</div>
<p>More explanation...</p>
```

## File Naming Convention

The JavaScript looks for files based on the `id` attribute:

| HTML ID | Files Loaded |
|---------|-------------|
| `id="example1"` | `example1.ttl` + `example1.jsonld` |
| `id="bee-population"` | `bee-population.ttl` + `bee-population.jsonld` |
| `id="my-example"` | `my-example.ttl` + `my-example.jsonld` |

## What Gets Generated

For each example div, JavaScript creates:

```html
<div class="h3 examples" id="example1">Example 1 - Basic dataset</div>
<div id="example1-tabs" class="tabs tabsstyle">
    <ul>
        <li><a href="#example1-tabs-1">Turtle</a></li>
        <li><a href="#example1-tabs-2">JSON-LD</a></li>
    </ul>
    <div id="example1-tabs-1">
        <textarea><!-- Turtle content loaded here --></textarea>
        <button class="copyturtletoclipboard">Copy</button>
    </div>
    <div id="example1-tabs-2">
        <textarea><!-- JSON-LD content loaded here --></textarea>
        <button class="copyjsonldtoclipboard">Copy</button>
        <button class="openinplayground">Open in Playground</button>
    </div>
</div>
```

## Features Included

✅ **Syntax Highlighting** - CodeMirror editors with Turtle/JSON-LD highlighting
✅ **Copy to Clipboard** - Copy button for each tab
✅ **JSON-LD Playground** - Opens JSON-LD in online playground
✅ **Tab Switching** - Clean tabbed interface
✅ **Dynamic Loading** - Files loaded via AJAX when page loads
✅ **Error Handling** - Shows alerts if files can't be loaded

## Template Integration

### In your Jinja template:
```jinja2
{% extends "base.j2" %}

{% block pageContent %}
    <section id="introduction">
        <h2>Introduction</h2>
        <p>Here's how to use this vocabulary:</p>
        
        <!-- JavaScript will automatically process this -->
        <div class="h3 examples" id="example1">Example 1 - Basic usage</div>
        
        <p>The example above shows...</p>
    </section>
    
    <section id="advanced">
        <h2>Advanced Usage</h2>
        
        <!-- Another example -->
        <div class="h3 examples" id="advanced-example">Advanced Example</div>
    </section>
{% endblock %}
```

### Make sure example.js is included:
The `base.j2` template should already include:
```html
<script src="{{ jsScriptsRoot }}/example.js"></script>
```

## Adding New Examples

1. **Create the files**:
   - `assets/examples/my-new-example.ttl`
   - `assets/examples/my-new-example.jsonld`

2. **Add to template**:
   ```html
   <div class="h3 examples" id="my-new-example">My New Example</div>
   ```

3. **That's it!** JavaScript handles the rest automatically.

## Advantages of JavaScript Approach

✅ **No build-time processing** needed
✅ **Interactive editors** with syntax highlighting
✅ **Copy functionality** built-in
✅ **JSON-LD Playground** integration
✅ **Dynamic loading** - add examples without rebuilding
✅ **Professional UI** with tabs and buttons
✅ **Error handling** for missing files

## Dependencies

- jQuery (for DOM manipulation)
- jQuery UI (for tabs)
- CodeMirror (for syntax highlighting)

These should already be included in your ReSpec setup.

