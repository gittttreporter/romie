This project is a ROM Manager app built using Electron with Vue.js and TypeScript. Its main purpose is to let users import and organize their ROM libraries easily. The key value proposition is the ability to create and sync playlists (tags) of ROMs to an SD card, which can then be plugged into a portable retro handheld device. The first supported device target is the MiyooMini+. The project focuses on efficient ROM library management, user-defined grouping/tagging (playlists), and seamless syncing to the SD card for use in the handheld.

## Communication Style
- Be direct and honest. If an idea has flaws, point them out clearly
- Don't sugarcoat feedback or say something is good just to be nice
- Rate ideas accurately - not everything is 8/10
- Challenge technical decisions when they're questionable
- Keep responses concise and practical
- Be chill and conversational, but prioritize accuracy over politeness
- If something won't work, say it won't work and explain why

## Key points to remember:
- Vue.js + TypeScript stack
- Component library is PrimeVue
- Import, organize, and tag ROMs
- Sync playlists to SD card for portable device use
- First iteration targets MiyooMini+
- Helps users manage their retro game collections conveniently

## Code style to follow:
- Use less for styles with BEM (Block Element Modifier) style class names (e.g., .block__element--modifier)
- Use REM values wherever relevant. The root font size is set to 14px.

# PrimeVue CSS Variables Reference

## Colors

### Primary Colors
- `--p-primary-50` through `--p-primary-950`
- `--p-primary-color`
- `--p-primary-hover-color`
- `--p-primary-active-color`
- `--p-primary-contrast-color`

### Content & Text
- `--p-content-color`
- `--p-content-background`
- `--p-content-border-color`
- `--p-content-border-radius`
- `--p-content-hover-color`
- `--p-content-hover-background`
- `--p-text-color`
- `--p-text-hover-color`
- `--p-text-hover-muted-color`
- `--p-text-muted-color`

### Surface & Background
- `--p-surface-0` through `--p-surface-950`
- `--p-highlight-background`
- `--p-highlight-color`
- `--p-highlight-focus-background`
- `--p-highlight-focus-color`

### State Colors (Full Range)
- Red: `--p-red-50` through `--p-red-950`
- Green: `--p-green-50` through `--p-green-950`
- Blue: `--p-blue-50` through `--p-blue-950`
- Yellow: `--p-yellow-50` through `--p-yellow-950`
- Orange: `--p-orange-50` through `--p-orange-950`
- Purple: `--p-purple-50` through `--p-purple-950`
- Pink: `--p-pink-50` through `--p-pink-950`
- Rose: `--p-rose-50` through `--p-rose-950`
- Indigo: `--p-indigo-50` through `--p-indigo-950`
- Violet: `--p-violet-50` through `--p-violet-950`
- Sky: `--p-sky-50` through `--p-sky-950`
- Cyan: `--p-cyan-50` through `--p-cyan-950`
- Teal: `--p-teal-50` through `--p-teal-950`
- Emerald: `--p-emerald-50` through `--p-emerald-950`
- Lime: `--p-lime-50` through `--p-lime-950`
- Amber: `--p-amber-50` through `--p-amber-950`
- Fuchsia: `--p-fuchsia-50` through `--p-fuchsia-950`

### Neutral Colors
- Gray: `--p-gray-50` through `--p-gray-950`
- Slate: `--p-slate-50` through `--p-slate-950`
- Zinc: `--p-zinc-50` through `--p-zinc-950`
- Neutral: `--p-neutral-50` through `--p-neutral-950`
- Stone: `--p-stone-50` through `--p-stone-950`

## Layout & Spacing

### Border Radius
- `--p-border-radius-none`
- `--p-border-radius-xs`
- `--p-border-radius-sm`
- `--p-border-radius-md`
- `--p-border-radius-lg`
- `--p-border-radius-xl`

### Focus Ring
- `--p-focus-ring-width`
- `--p-focus-ring-style`
- `--p-focus-ring-color`
- `--p-focus-ring-offset`
- `--p-focus-ring-shadow`

### General Spacing
- `--p-icon-size`
- `--p-anchor-gutter`
- `--p-ripple-background`
- `--p-mask-background`
- `--p-mask-color`

## Form Components

### Input Text
- `--p-inputtext-background`
- `--p-inputtext-border-color`
- `--p-inputtext-border-radius`
- `--p-inputtext-color`
- `--p-inputtext-padding-x`
- `--p-inputtext-padding-y`
- `--p-inputtext-focus-border-color`
- `--p-inputtext-focus-ring-color`
- `--p-inputtext-focus-ring-width`
- `--p-inputtext-focus-ring-style`
- `--p-inputtext-focus-ring-shadow`
- `--p-inputtext-focus-ring-offset`
- `--p-inputtext-hover-border-color`
- `--p-inputtext-invalid-border-color`
- `--p-inputtext-disabled-background`
- `--p-inputtext-disabled-color`
- `--p-inputtext-placeholder-color`
- `--p-inputtext-invalid-placeholder-color`
- `--p-inputtext-shadow`
- `--p-inputtext-transition-duration`
- `--p-inputtext-filled-background`
- `--p-inputtext-filled-hover-background`
- `--p-inputtext-filled-focus-background`

### Form Fields (Generic)
- `--p-form-field-background`
- `--p-form-field-border-color`
- `--p-form-field-border-radius`
- `--p-form-field-color`
- `--p-form-field-padding-x`
- `--p-form-field-padding-y`
- `--p-form-field-focus-border-color`
- `--p-form-field-focus-ring-color`
- `--p-form-field-focus-ring-width`
- `--p-form-field-focus-ring-style`
- `--p-form-field-focus-ring-shadow`
- `--p-form-field-focus-ring-offset`
- `--p-form-field-hover-border-color`
- `--p-form-field-invalid-border-color`
- `--p-form-field-disabled-background`
- `--p-form-field-disabled-color`
- `--p-form-field-placeholder-color`
- `--p-form-field-invalid-placeholder-color`
- `--p-form-field-icon-color`
- `--p-form-field-shadow`
- `--p-form-field-transition-duration`
- `--p-form-field-filled-background`
- `--p-form-field-filled-hover-background`
- `--p-form-field-filled-focus-background`

### Form Field Sizes
- `--p-form-field-sm-font-size`
- `--p-form-field-sm-padding-x`
- `--p-form-field-sm-padding-y`
- `--p-form-field-lg-font-size`
- `--p-form-field-lg-padding-x`
- `--p-form-field-lg-padding-y`

### Form Field Float Labels
- `--p-form-field-float-label-color`
- `--p-form-field-float-label-focus-color`
- `--p-form-field-float-label-active-color`
- `--p-form-field-float-label-invalid-color`

## Button Components

### Button Base
- `--p-button-border-radius`
- `--p-button-rounded-border-radius`
- `--p-button-gap`
- `--p-button-padding-x`
- `--p-button-padding-y`
- `--p-button-icon-only-width`
- `--p-button-badge-size`
- `--p-button-label-font-weight`
- `--p-button-focus-ring-width`
- `--p-button-focus-ring-style`
- `--p-button-focus-ring-offset`
- `--p-button-transition-duration`
- `--p-button-raised-shadow`

### Button Sizes
- `--p-button-sm-font-size`
- `--p-button-sm-padding-x`
- `--p-button-sm-padding-y`
- `--p-button-sm-icon-only-width`
- `--p-button-lg-font-size`
- `--p-button-lg-padding-x`
- `--p-button-lg-padding-y`
- `--p-button-lg-icon-only-width`

### Button Variants (Primary, Secondary, Success, Info, Warn, Help, Danger, Contrast)
For each variant, variables follow this pattern:
- `--p-button-{variant}-background`
- `--p-button-{variant}-border-color`
- `--p-button-{variant}-color`
- `--p-button-{variant}-hover-background`
- `--p-button-{variant}-hover-border-color`
- `--p-button-{variant}-hover-color`
- `--p-button-{variant}-active-background`
- `--p-button-{variant}-active-border-color`
- `--p-button-{variant}-active-color`
- `--p-button-{variant}-focus-ring-color`
- `--p-button-{variant}-focus-ring-shadow`

### Button Outlined Variants
Similar pattern with `--p-button-outlined-{variant}-*`

### Button Text Variants
Similar pattern with `--p-button-text-{variant}-*`

### Button Link
- `--p-button-link-color`
- `--p-button-link-hover-color`
- `--p-button-link-active-color`

## Badge Component
- `--p-badge-font-size`
- `--p-badge-font-weight`
- `--p-badge-height`
- `--p-badge-min-width`
- `--p-badge-border-radius`
- `--p-badge-padding`
- `--p-badge-dot-size`

### Badge Sizes
- `--p-badge-sm-font-size`
- `--p-badge-sm-height`
- `--p-badge-sm-min-width`
- `--p-badge-lg-font-size`
- `--p-badge-lg-height`
- `--p-badge-lg-min-width`
- `--p-badge-xl-font-size`
- `--p-badge-xl-height`
- `--p-badge-xl-min-width`

### Badge Variants
- `--p-badge-primary-background`
- `--p-badge-primary-color`
- `--p-badge-secondary-background`
- `--p-badge-secondary-color`
- `--p-badge-success-background`
- `--p-badge-success-color`
- `--p-badge-info-background`
- `--p-badge-info-color`
- `--p-badge-warn-background`
- `--p-badge-warn-color`
- `--p-badge-danger-background`
- `--p-badge-danger-color`
- `--p-badge-contrast-background`
- `--p-badge-contrast-color`

## Toast Component
- `--p-toast-width`
- `--p-toast-border-width`
- `--p-toast-border-radius`
- `--p-toast-blur`
- `--p-toast-transition-duration`
- `--p-toast-content-gap`
- `--p-toast-content-padding`
- `--p-toast-text-gap`
- `--p-toast-summary-font-size`
- `--p-toast-summary-font-weight`
- `--p-toast-detail-font-size`
- `--p-toast-detail-font-weight`
- `--p-toast-icon-size`
- `--p-toast-close-button-width`
- `--p-toast-close-button-height`
- `--p-toast-close-button-border-radius`
- `--p-toast-close-button-focus-ring-style`
- `--p-toast-close-button-focus-ring-width`
- `--p-toast-close-button-focus-ring-offset`
- `--p-toast-close-icon-size`

### Toast Variants (Success, Info, Warn, Error, Secondary, Contrast)
For each variant:
- `--p-toast-{variant}-background`
- `--p-toast-{variant}-border-color`
- `--p-toast-{variant}-color`
- `--p-toast-{variant}-detail-color`
- `--p-toast-{variant}-shadow`
- `--p-toast-{variant}-close-button-hover-background`
- `--p-toast-{variant}-close-button-focus-ring-color`
- `--p-toast-{variant}-close-button-focus-ring-shadow`

## List Component
- `--p-list-gap`
- `--p-list-padding`
- `--p-list-header-padding`
- `--p-list-option-padding`
- `--p-list-option-border-radius`
- `--p-list-option-color`
- `--p-list-option-icon-color`
- `--p-list-option-icon-focus-color`
- `--p-list-option-focus-background`
- `--p-list-option-focus-color`
- `--p-list-option-selected-background`
- `--p-list-option-selected-color`
- `--p-list-option-selected-focus-background`
- `--p-list-option-selected-focus-color`
- `--p-list-option-group-background`
- `--p-list-option-group-color`
- `--p-list-option-group-font-weight`
- `--p-list-option-group-padding`

## Navigation Component
- `--p-navigation-list-gap`
- `--p-navigation-list-padding`
- `--p-navigation-item-padding`
- `--p-navigation-item-border-radius`
- `--p-navigation-item-gap`
- `--p-navigation-item-color`
- `--p-navigation-item-icon-color`
- `--p-navigation-item-icon-focus-color`
- `--p-navigation-item-icon-active-color`
- `--p-navigation-item-focus-background`
- `--p-navigation-item-focus-color`
- `--p-navigation-item-active-background`
- `--p-navigation-item-active-color`
- `--p-navigation-submenu-label-padding`
- `--p-navigation-submenu-label-background`
- `--p-navigation-submenu-label-color`
- `--p-navigation-submenu-label-font-weight`
- `--p-navigation-submenu-icon-size`
- `--p-navigation-submenu-icon-color`
- `--p-navigation-submenu-icon-focus-color`
- `--p-navigation-submenu-icon-active-color`

## Overlay Components
- `--p-overlay-modal-background`
- `--p-overlay-modal-border-color`
- `--p-overlay-modal-border-radius`
- `--p-overlay-modal-color`
- `--p-overlay-modal-shadow`
- `--p-overlay-modal-padding`
- `--p-overlay-popover-background`
- `--p-overlay-popover-border-color`
- `--p-overlay-popover-border-radius`
- `--p-overlay-popover-color`
- `--p-overlay-popover-shadow`
- `--p-overlay-popover-padding`
- `--p-overlay-navigation-shadow`
- `--p-overlay-select-background`
- `--p-overlay-select-border-color`
- `--p-overlay-select-border-radius`
- `--p-overlay-select-color`
- `--p-overlay-select-shadow`

## Utilities
- `--p-disabled-opacity`
- `--p-transition-duration`
- `--p-mask-transition-duration`
- `--p-iconfield-icon-color`

## Input Text Size Variants
- `--p-inputtext-sm-font-size`
- `--p-inputtext-sm-padding-x`
- `--p-inputtext-sm-padding-y`
- `--p-inputtext-lg-font-size`
- `--p-inputtext-lg-padding-x`
- `--p-inputtext-lg-padding-y`
