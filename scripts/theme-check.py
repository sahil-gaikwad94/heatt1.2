#!/usr/bin/env python3
"""Heatt · the theme + token gate, in Python.

`scripts/theme-contrast-check.ts` is the canonical gate, but it needs Node and
the machine that built these themes has none. This is a faithful twin of that
script — same parser, same compositing, same WCAG maths, same 18 measured
pairs — so the palette can still be verified here. It additionally checks three
things the TypeScript gate cannot see:

  1. every `var(--token)` used anywhere in `src/` is actually defined (or is a
     value set deliberately at runtime),
  2. every `ds-*` class used by the preview and the dev kit exists in
     `src/ui/design-system.css`,
  3. no file still references a stylesheet or component that was deleted.

Run it with:  python scripts/theme-check.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "src" / "theme" / "tokens.css"
DESIGN_SYSTEM = ROOT / "src" / "ui" / "design-system.css"

COMMENT = re.compile(r"/\*[\s\S]*?\*/")
BLOCK = re.compile(r"([^{}]+)\{([^{}]*)\}")
DECL = re.compile(r"(--[a-z0-9-]+)\s*:\s*(.+)", re.IGNORECASE)
HEX = re.compile(r"^#([0-9a-f]{3}|[0-9a-f]{6})$", re.IGNORECASE)
RGBA = re.compile(
    r"^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?\s*\)$", re.IGNORECASE
)


def parse_blocks(text: str) -> list[tuple[str, dict[str, str]]]:
    blocks: list[tuple[str, dict[str, str]]] = []
    for match in BLOCK.finditer(text):
        selector = " ".join(match.group(1).split())
        tokens: dict[str, str] = {}
        for declaration in match.group(2).split(";"):
            found = DECL.match(declaration.strip())
            if found:
                tokens[found.group(1).strip()] = found.group(2).strip()
        if tokens:
            blocks.append((selector, tokens))
    return blocks


def parse_color(value: str, name: str, theme: str) -> tuple[float, float, float, float]:
    value = value.strip()
    hex_match = HEX.match(value)
    if hex_match:
        digits = hex_match.group(1)
        if len(digits) == 3:
            digits = "".join(character * 2 for character in digits)
        return (int(digits[0:2], 16), int(digits[2:4], 16), int(digits[4:6], 16), 1.0)
    rgba_match = RGBA.match(value)
    if rgba_match:
        red, green, blue = (float(rgba_match.group(index)) for index in (1, 2, 3))
        alpha = float(rgba_match.group(4)) if rgba_match.group(4) else 1.0
        return (red, green, blue, alpha)
    raise SystemExit(f"{theme}: the measured token {name} is not a literal colour: {value!r}")


def over(front, back):
    """Composites `front` onto the opaque `back`."""
    red, green, blue, alpha = front
    back_red, back_green, back_blue, _ = back
    return (
        red * alpha + back_red * (1 - alpha),
        green * alpha + back_green * (1 - alpha),
        blue * alpha + back_blue * (1 - alpha),
        1.0,
    )


def luminance(color) -> float:
    channels = []
    for value in color[:3]:
        value = value / 255
        channels.append(value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(front, back) -> float:
    lighter, darker = sorted((luminance(front), luminance(back)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


# The pairs that actually ship. The minimum defaults to AA body text (4.5:1);
# 3:1 is allowed only for non-text UI such as icons and borders.
PAIRS = [
    ("body text on the app background", "--text", "--bg", None, 4.5),
    ("secondary copy on the app background", "--copy", "--bg", None, 4.5),
    ("meta text on the app background", "--muted", "--bg", None, 4.5),
    ("body text on a card", "--text", "--panel", None, 4.5),
    ("secondary copy on a card", "--copy", "--panel", None, 4.5),
    ("meta text on a card", "--muted", "--panel", None, 4.5),
    ("secondary copy on a soft surface", "--copy", "--panel-soft", None, 4.5),
    ("meta text on a soft surface", "--muted", "--panel-soft", None, 4.5),
    ("primary action label", "--on-accent", "--accent", None, 4.5),
    ("accent on the background (icons, borders)", "--accent", "--bg", None, 3.0),
    ("accent on a card (icons, borders)", "--accent", "--panel", None, 3.0),
    ("eyebrow gold on a card", "--gold", "--panel", None, 4.5),
    ("chip label, unselected", "--chip-text", "--chip-bg", "--bg", 4.5),
    ("chip label, selected", "--chip-text-active", "--chip-bg-active", None, 4.5),
    ("numeral on a card", "--numeral", "--panel", None, 4.5),
    ("text on the dark panel", "--panel-ink-text", "--panel-ink", None, 4.5),
    ("copy on the dark panel", "--panel-ink-copy", "--panel-ink", None, 4.5),
    ("toast text on the toast surface", "--on-accent", "--accent-strong", None, 4.5),
]

# Set from JSX inline styles or from src/theme/theme.ts, never from a stylesheet.
RUNTIME_ONLY = {"--angle", "--buddy-hue", "--i", "--d", "--reveal-x", "--reveal-y"}


def main() -> int:
    failures: list[str] = []
    source = COMMENT.sub("", TOKENS.read_text(encoding="utf8"))
    blocks = parse_blocks(source)

    def block_for(needle: str) -> dict[str, str]:
        for selector, tokens in blocks:
            if needle in selector:
                return tokens
        raise SystemExit(f"tokens.css: no theme block found for {needle!r}")

    ramp = block_for(":root")
    themes = [
        ("Ember", block_for("data-theme='ember'")),
        ("Midnight", block_for("data-theme='midnight'")),
        ("Paper", block_for("data-theme='ink'")),
    ]

    # ---------- parity: a token in one theme must exist in all ----------
    reference = themes[0][1]
    for label, tokens in themes[1:]:
        missing = sorted(set(reference) - set(tokens))
        extra = sorted(set(tokens) - set(reference))
        if missing:
            failures.append(f"{label} is missing tokens: {', '.join(missing)}")
        if extra:
            failures.append(f"{label} declares tokens no other theme declares: {', '.join(extra)}")
    if not failures:
        print(f"Token parity: {len(reference)} tokens declared by all {len(themes)} themes.")

    # ---------- contrast ----------
    measured = 0
    for label, personality in themes:
        palette = dict(ramp)
        palette.update(personality)
        print(f"\n{label}")
        for pair_label, fg_name, bg_name, behind_name, minimum in PAIRS:
            if fg_name not in palette or bg_name not in palette:
                failures.append(f"{label}: unknown token in pair {pair_label!r}")
                continue
            behind_value = palette.get(behind_name) if behind_name else palette[bg_name]
            behind = parse_color(behind_value or "", behind_name or bg_name, label)
            background = over(parse_color(palette[bg_name], bg_name, label), behind)
            foreground = over(parse_color(palette[fg_name], fg_name, label), background)
            value = contrast(foreground, background)
            measured += 1
            passed = value >= minimum
            if not passed:
                failures.append(f"{label} · {pair_label}: {value:.2f}:1 (needs {minimum}:1)")
            print(
                f"  {'ok  ' if passed else 'FAIL'} {pair_label:<46.46} "
                f"{value:5.2f}:1  ({fg_name} on {bg_name})"
            )

    # ---------- every var() used in src/ must be defined ----------
    defined: set[str] = set()
    used: dict[str, set[str]] = {}
    for path in sorted((ROOT / "src").rglob("*")):
        if path.suffix not in {".css", ".ts", ".tsx"} or not path.is_file():
            continue
        text = COMMENT.sub("", path.read_text(encoding="utf8"))
        if path.suffix == ".css":
            defined.update(match.group(1) for match in re.finditer(r"(--[a-zA-Z0-9-]+)\s*:", text))
        for match in re.finditer(r"var\((--[a-zA-Z0-9-]+)", text):
            used.setdefault(match.group(1), set()).add(path.name)
    undefined = {
        name: files for name, files in used.items() if name not in defined | RUNTIME_ONLY
    }
    if undefined:
        for name, files in sorted(undefined.items()):
            failures.append(f"{name} is used in {', '.join(sorted(files))} but never defined")
    else:
        print(
            f"\nTokens: {len(used)} distinct var() references, all defined "
            f"({len(RUNTIME_ONLY)} are runtime-set)."
        )

    # ---------- ds-* classes used by the preview and the kit must exist ----------
    declared_ds = set(
        re.findall(r"\.(ds-[a-z0-9-]+)", DESIGN_SYSTEM.read_text(encoding="utf8"))
    )
    for relative in ("preview/index.html", "src/dev/KitPage.tsx"):
        target = ROOT / relative
        if not target.is_file():
            continue
        markup = target.read_text(encoding="utf8")
        used_ds: set[str] = set()
        for attribute in re.findall(r'class(?:Name)?="([^"]+)"', markup):
            used_ds.update(part for part in attribute.split() if part.startswith("ds-"))
        unknown = sorted(used_ds - declared_ds)
        if unknown:
            failures.append(
                f"{relative} uses ds- classes that are not defined: {', '.join(unknown)}"
            )
        else:
            print(f"{relative}: {len(used_ds)} ds- classes used, all defined.")

    # ---------- nothing may reference what was deleted ----------
    removed = {
        "src/theme.css": "src/theme.css",
        "src/reader.css": "src/reader.css",
        "FlareReader": "FlareReader.tsx",
        "landing-overrides": "src/landing-overrides.css",
    }
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix not in {".css", ".ts", ".tsx", ".html"}:
            continue
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf8", errors="ignore")
        for needle, name in removed.items():
            if needle in text:
                failures.append(f"{path.relative_to(ROOT)} still references the removed {name}")

    print()
    if failures:
        print(f"{len(failures)} check(s) failed:", file=sys.stderr)
        for failure in failures:
            print(f" - {failure}", file=sys.stderr)
        return 1

    print(
        f"All checks passed: {measured} measured pairs across {len(themes)} themes, "
        "read from src/theme/tokens.css."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

