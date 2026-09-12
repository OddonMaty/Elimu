# Design System: Elimu (SAO School Manager / EduGestion RDC)
**Project ID:** `18382339084164586766`
**Design System Identity:** *"L'Excellence Institutionnelle"*

---

## 1. Visual Theme & Atmosphere

The Elimu design system focuses on **authority, efficiency, and administrative clarity**. Specifically engineered for school leadership, secretariats, teachers, and parents in the Democratic Republic of Congo, the visual identity rejects playful school tropes in favor of a sophisticated, sober **Corporate Modern SaaS** approach.

The visual language communicates institutional reliability, longevity, and administrative rigor through:
- **Tonal Structured Surfaces:** High-contrast crisp paper white surfaces layered on top of a very soft blue-grey canvas (`#F7FAFD` / `#F1F4F7`) to reduce eye strain during intensive administrative sessions.
- **Deep Navy Anchor:** Deep Institutional Navy (`#002547` and `#1B3B5F`) symbolizing gravitas, official government alignment, and structure.
- **Warm Amber Accent:** Warm Amber (`#FDA13A` / `#E08A22` / `#8B5000`) used intentionally for high-priority calls to action, financial statuses, and critical pending tasks without cluttering the interface.
- **Utilitarian Elegance:** Dense, scannable data tables with clean 1px hairline borders (`#C3C6CF` / `#E0E3E6`), legible tabular figures, and official DR Congo ministerial formatting for report cards (*Bulletins Scolaires*).

---

## 2. Color Palette & Roles

| Token Name | Hex Code | Descriptive Name | Functional Role |
|---|---|---|---|
| `primary` | `#002547` | Deep Institutional Navy | Brand anchor, high-level headers, primary buttons, major titles |
| `primary-container` | `#1b3b5f` | Classic Authority Navy | Top navigation bar, sidebar background, highlighted container headers |
| `on-primary` | `#ffffff` | Pure White | Text on primary navy backgrounds |
| `on-primary-container` | `#88a6cf` | Soft Ice Blue | Subtitle text and muted icons on navy headers |
| `secondary` | `#8b5000` | Deep Amber Brown | Accent borders, secondary badges, warning borders |
| `secondary-container` | `#fda13a` | Warm Amber CTA | Action buttons (e.g., "Inscrire un élève", "Payer"), pending badges |
| `on-secondary-container` | `#6a3c00` | Dark Amber Ochre | Text on amber warning badges |
| `tertiary` | `#032641` | Midnight Slate Navy | Dark neutral borders and high-emphasis icons |
| `tertiary-container` | `#1e3c58` | Deep Slate Indigo | Secondary card surfaces and dark badges |
| `surface` | `#f7fafd` | Crisp Slate-White Canvas | Default application background |
| `surface-container-lowest` | `#ffffff` | Pure White Card | Primary card, modal, and table container surfaces |
| `surface-container-low` | `#f1f4f7` | Very Light Tint Grey | Table alternate rows, search input backgrounds |
| `surface-container` | `#ebeef1` | Soft Administrative Grey | Sidebar active background, badge containers |
| `surface-container-high` | `#e5e8eb` | Muted Border Grey | Card headers, table header backgrounds |
| `surface-container-highest` | `#e0e3e6` | Slate Border Line | Divider lines, card outlines |
| `on-surface` | `#181c1e` | Deep Charcoal | Primary readable text, body copy, and table cells |
| `on-surface-variant` | `#43474e` | Slate Charcoal | Metadata, secondary labels, table headers, descriptions |
| `outline` | `#73777f` | Medium Slate Outline | Form field borders, secondary button strokes |
| `outline-variant` | `#c3c6cf` | Light Grey Divider | Card borders, table grid lines |
| `error` | `#ba1a1a` | Crimson Red | Error alerts, rejected application badges, unpaid status |
| `error-container` | `#ffdad6` | Soft Pink Alert | Background for error banners and absent student badges |
| `on-error-container` | `#93000a` | Deep Crimson | Text on error badges |
| `success` (custom) | `#137333` | Ministerial Green | Paid status badges, present attendance, approved dossiers |
| `success-container` | `#e6f4ea` | Soft Mint Green | Background for positive status chips |

---

## 3. Typography & Hierarchy

The application utilizes **Inter** exclusively for maximum legibility across dense data tables, administrative forms, and official certificate layouts.

| Typography Token | Font Size | Line Height | Weight | Letter Spacing | Usage Example |
|---|---|---|---|---|---|
| `display-lg` | 36px (2.25rem) | 44px | 700 (Bold) | -0.02em | Landing page heroes, main portal hero titles |
| `headline-lg` | 28px (1.75rem) | 36px | 600 (SemiBold) | -0.01em | Top-level dashboard page headers |
| `headline-md` | 20px (1.25rem) | 28px | 600 (SemiBold) | 0.00em | Card titles, section headers, modal titles |
| `headline-lg-mobile` | 24px (1.5rem) | 32px | 600 (SemiBold) | 0.00em | Mobile screen titles |
| `body-lg` | 16px (1.0rem) | 24px | 400 (Regular) | 0.00em | Lead paragraphs, modal descriptions |
| `body-md` | 14px (0.875rem) | 20px | 400 / 500 | 0.00em | Table body text, form input text, default body copy |
| `label-md` | 12px (0.75rem) | 16px | 600 (SemiBold) | +0.05em (Caps) | Table column headers, badge text, field labels |

**Icons:** Google **Material Symbols Outlined** (20px, 24px) with 2px stroke weight.

---

## 4. Geometry, Spacing & Elevation

- **Base Unit:** 4px scale (`xs`: 4px, `sm`: 8px, `md`: 16px, `lg`: 24px, `xl`: 32px, `2xl`: 48px).
- **Desktop Grid:** 12-column responsive fluid grid with fixed 260px left sidebar and 32px-40px desktop margins.
- **Mobile Grid:** Fluid 1-column layout with 16px safe margin and sticky bottom navigation.
- **Border Radius (Geometric & Sober):**
  - Buttons & Inputs: `rounded` (0.25rem / 4px) or `rounded-md` (0.375rem / 6px)
  - Cards & Modals: `rounded-lg` (0.5rem / 8px)
  - Badges & Chips: `rounded-full` (9999px)
- **Elevation & Depth:**
  - Standard cards: Flat with 1px solid border (`border border-[#e0e3e6]`) on `#ffffff` background.
  - Floating dropdowns & popovers: `shadow-md` with `rgba(0, 37, 71, 0.08)` ambient shadow.
  - Modals: Dark backdrop `bg-black/50 backdrop-blur-sm` with centered elevated card (`shadow-xl`).

---

## 5. Reusable Component Specifications

### 5.1 Buttons
- **Primary Action (`Button variant="primary"`):** Solid Deep Navy (`bg-[#002547] text-white hover:bg-[#1b3b5f]`), 4px rounded, font-medium, height 40px, padding x-4.
- **Accent CTA (`Button variant="accent"`):** Solid Warm Amber (`bg-[#fda13a] text-[#002547] hover:bg-[#e08a22] font-semibold`).
- **Secondary Outlined (`Button variant="outline"`):** 1px solid outline (`border border-[#c3c6cf] text-[#181c1e] hover:bg-[#f1f4f7]`).
- **Ghost / Icon Button (`Button variant="ghost"`):** Transparent (`hover:bg-[#ebeef1] text-[#43474e]`).
- **Danger Button (`Button variant="danger"`):** Crimson (`bg-[#ba1a1a] text-white hover:bg-[#93000a]`).

### 5.2 Form Inputs & Controls
- **Text / Number / Date Inputs:** Height 40px, white background, 1px border (`border-[#c3c6cf]`), rounded 4px, focus ring (`focus:border-[#002547] focus:ring-1 focus:ring-[#002547]`), placeholder in `#73777f`.
- **Select Dropdowns:** Standard Chevron icon, white dropdown menu with clear hover states.
- **Search Bar:** Embedded leading magnifying glass icon, trailing shortcut or clear button.

### 5.3 Data Tables
- **Header:** Background `#f1f4f7`, font `label-md` (12px, semibold, tracking-wider, uppercase), text `#43474e`, 12px vertical padding.
- **Rows:** Alternating faint zebra striping or hover highlight (`hover:bg-[#f7fafd]`), 1px bottom border (`border-[#e0e3e6]`), 14px body text.
- **Action Column:** Inline quick action buttons (Détails, Modifier, Imprimer, Valider).

### 5.4 Badges & Status Indicators
- **Success ("Payé", "Validé", "Présent"):** `bg-[#e6f4ea] text-[#137333] border border-[#ceead6]`.
- **Warning ("En attente", "Tranche 1 payée", "Retard"):** `bg-[#fff0db] text-[#8b5000] border border-[#ffdcbe]`.
- **Danger ("Impayé", "Rejeté", "Absent"):** `bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]`.
- **Info / Neutral ("Inscrit", "Archive"):** `bg-[#eef1f4] text-[#43474e] border border-[#c3c6cf]`.

### 5.5 Official RDC Report Card (*Bulletin Scolaire Ministériel*)
- Distinct multi-column table format conforming to DR Congo Ministry of Primary and Secondary Education (EPST) requirements:
  - Header: RDC Coat of Arms / Flag, Province Éducationnelle, Nom de l'Établissement, Code Matricule, Nom de l'élève, Option/Section.
  - Columns: Branches / Cours (Maxima, 1ère Période, 2ème Période, Examen 1er Semestre, Total Semestre 1, 3ème Période, 4ème Période, Examen 2ème Semestre, Total Semestre 2, Total Général, Pourcentage, Place).
  - Footer: Conduite, Application, Décision du jury (Passé / Ajourné), Signatures (Titulaire, Chef d'Établissement, Sceau de l'école).

---

## 6. Responsive Layouts & Navigation

- **Desktop (>= 1024px):**
  - Left persistent navigation drawer (260px) in Dark Navy (`#1b3b5f`) with Elimu logo, active tab indicator, role selector, and user avatar.
  - Sticky Top Bar (`#ffffff`) with school selector, academic year badge (`2025 - 2026`), global search, notifications bell, and quick action CTA.
  - Main scrollable content container with max-w-7xl and generous 32px padding.
- **Mobile (< 1024px):**
  - Collapsible slide-over drawer or bottom navigation bar with key routes (Accueil, Notes, Assiduité, Devoirs, Finances).
  - Full touch-target compliant buttons (min 44px height).
