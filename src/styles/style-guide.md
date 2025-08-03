📝 PrimeVue CSS Variable Cheat Sheet

## **Quick Conversion Table**

| rem      | 16px   | 18px   | 14px   |
|----------|--------|--------|--------|
| 0.5rem   | 8px    | 9px    | 7px    |
| 1rem     | 16px   | 18px   | 14px   |
| 2rem     | 32px   | 36px   | 28px   |
| 3rem     | 48px   | 54px   | 42px

## Common PrimeVue Font Size Variables**

| Variable Name                    | Typical Value | Where Used                                |
| -------------------------------- | ------------- | ----------------------------------------- |
| `--p-inputtext-sm-font-size`     | 0.875rem      | Small input, button, or label text        |
| `--p-inputtext-font-size`        | 1rem          | Default input, button, or label text      |
| `--p-inputtext-lg-font-size`     | 1.125rem      | Large input/button text                   |
| `--p-button-sm-font-size`        | 0.875rem      | Small button                              |
| `--p-button-font-size`           | 1rem          | Normal button                             |
| `--p-button-lg-font-size`        | 1.125rem      | Large button                              |
| `--p-toolbar-font-size`*         | (varies)      | Toolbars, not always present              |
| `--p-form-field-sm-font-size`    | 0.875rem      | Small input field                         |
| `--p-form-field-lg-font-size`    | 1.125rem      | Large input field

## 🎨 **Palette (Color) Variables**

| Variable                        | Purpose                      |
|----------------------------------|------------------------------|
| `--p-primary-color`              | Main theme color (buttons, highlights, links, focus) |
| `--p-primary-contrast-color`     | Foreground for `primary` background (button text, etc.) |
| `--p-highlight-background`       | Selected/focused state background |
| `--p-highlight-color`            | Foreground on selected/focused |
| `--p-content-background`         | General app/page background  |
| `--p-content-border-color`       | Borders between content areas (cards, panels, header lines) |

### **Surfaces (Background shades − for cards, panels, etc.)**
| Variable             | Purpose                                  |
|----------------------|------------------------------------------|
| `--p-surface-0`      | Lightest surface (cards, panels, modals) |
| `--p-surface-100`    | Slightly darker surface                  |
| `--p-surface-200...` | Progressively darker; use for layering   |
| `--p-surface-800`    | Use for overlays, footers, modals (dark) |
| `--p-surface-950`    | Darkest, use in dark mode backgrounds    |

### **Text**
| Variable                  | Purpose                                                           |
|---------------------------|-------------------------------------------------------------------|
| `--p-text-color`          | Primary text color (most text/UI)                                 |
| `--p-text-muted-color`    | Secondary/muted/inactive text                                    |
| `--p-text-hover-color`    | Text color on hover for buttons/links                            |

---

## 🧩 **Component-Specific**

### **Buttons**
| Variable                                 | Purpose                        |
|-------------------------------------------|--------------------------------|
| `--p-button-primary-background`           | Button background/main color   |
| `--p-button-primary-color`                | Button text/icon color         |
| `--p-button-primary-hover-background`     | On hover                      |
| `--p-button-primary-focus-ring-color`     | Button focus outline           |
| `--p-button-gap`                         | Spacing between icon and text  |

| Outlined/Button Borders                   |                                |
|-------------------------------------------|--------------------------------|
| `--p-button-outlined-primary-border-color` | Outlined border color          |
| `--p-button-outlined-primary-color`        | Outlined text/icon color       |

### **Form Inputs**
| Variable                         | Purpose                       |
|-----------------------------------|-------------------------------|
| `--p-inputtext-background`        | Input background color        |
| `--p-inputtext-color`             | Input text                    |
| `--p-inputtext-border-color`      | Default border                |
| `--p-inputtext-hover-border-color`| Border on hover               |
| `--p-inputtext-focus-border-color`| Border on focus               |
| `--p-inputtext-placeholder-color` | Placeholder text color        |

---

## ➖ **Spacing & Sizing**

### **Paddings (most important for custom layouts!)**
| Variable                       | Purpose                                  |
|---------------------------------|------------------------------------------|
| `--p-form-field-padding-x`      | Left/right padding for inputs/forms      |
| `--p-form-field-padding-y`      | Top/bottom padding for inputs/forms      |
| `--p-button-padding-x`          | Button internal horizontal padding       |
| `--p-button-padding-y`          | Button internal vertical padding         |
| `--p-toolbar-padding`           | Toolbar/section padding                  |

### **Border Radius**
| Variable                 | Purpose                       |
|--------------------------|-------------------------------|
| `--p-border-radius-sm`   | Small radius                  |
| `--p-border-radius-md`   | Medium (default) radius       |
| `--p-border-radius-lg`   | Large                         |

---

## 🔥 **Others (Borders, Focus, Shadows, Gaps)**

| Variable                         | Purpose                      |
|-----------------------------------|------------------------------|
| `--p-content-border-color`        | Panel/card/header bottom borders |
| `--p-focus-ring-color`            | Global focus outline color   |
| `--p-focus-ring-width`            | Focus outline thickness      |
| `--p-transition-duration`         | How fast things animate      |
| `--p-form-field-shadow`           | Shadow for focused inputs    |
| `--p-button-raised-shadow`        | Shadow for elevated buttons  |

---

## 🛠️ **How to Use These**

- **For backgrounds:** `background: var(--p-surface-0)`
- **For headlines/section separators:** `border-bottom: 1px solid var(--p-content-border-color)`
- **For custom buttons:**
  ```
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-radius: var(--p-border-radius-md);
  ```
- **For inputs:**
  ```
  padding: var(--p-form-field-padding-y) var(--p-form-field-padding-x);
  border-radius: var(--p-border-radius-md);
  background: var(--p-inputtext-background);
  color: var(--p-inputtext-color);
  ```

---

## 💡 **Tips**

- If unsure about which surface or color, start with `--p-surface-0` (main backgrounds/cards), and `--p-content-border-color` for most divider/border uses.
- For all button, form, and text tweaks—always reference these before using a hard-coded value!
- If you override header size, sidebar size, or container widths, define your own CSS variables (`--my-sidebar-width`) to keep things clean—PrimeVue doesn't provide those.

---

**Bookmark or save this list for easy theming in PrimeVue! And if you need the variable for a specific component state, ask me and I’ll look it up against your app’s variables.
