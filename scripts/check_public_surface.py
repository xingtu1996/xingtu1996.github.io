#!/usr/bin/env python3
"""Small, deterministic pre-release gate for this PUBLIC GitHub Pages repository.

Checks only the current tree. It does NOT inspect git history, image EXIF,
third-party caches, external URL reachability or the deployed Pages build.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = ("*.html", "*.md", "*.json", "assets/**/*.svg")
EMAIL = re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b")
CN_PHONE = re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)")
CONTACT_URI = re.compile(r"(?i)\b(?:mailto|tel):")
PRIVATE_REPOS = (
    "xingtu-site", "xingtu-vault", "xingtu-accounts", "xingtu-sessions",
    "xingtu-material-vault", "xingtu-brand-assets", "xingtu-rules-internal",
    "xingtu-agent-skills", "xingtu-publish-packs", "xingtu-publish-calendar",
)
PRIVATE_LINK = re.compile(
    r"(?i)https?://github\.com/xingtu1996/(?:" +
    "|".join(map(re.escape, PRIVATE_REPOS)) + r")(?:[/#?]|\b)"
)


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.refs.append(value)

    handle_startendtag = handle_starttag


def check_local_ref(page: Path, ref: str):
    if ref.startswith(("#", "//")):
        return None
    u = urlsplit(ref)
    if u.scheme or u.netloc:
        if u.scheme.lower() in ("javascript", "file"):
            return f"disallowed URL scheme: {u.scheme}"
        return None
    rel = unquote(u.path)
    if not rel:
        return None
    target = (ROOT / rel.lstrip("/")) if rel.startswith("/") else (page.parent / rel)
    target = target.resolve()
    if not target.is_relative_to(ROOT.resolve()):
        return "local reference escapes repository root"
    if not target.is_file():
        return f"missing local resource: {rel}"
    return None


def main():
    errors = []
    files = sorted({p for glob in PATTERNS for p in ROOT.glob(glob) if p.is_file()})
    for path in files:
        content = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT)
        for title, regex in (
            ("public email address", EMAIL),
            ("possible mainland China phone number", CN_PHONE),
            ("public email/telephone contact link", CONTACT_URI),
            ("link to a known private repository", PRIVATE_LINK),
        ):
            if regex.search(content):
                errors.append(f"{rel}: {title} (value omitted)")
        if path.suffix.lower() == ".html":
            parser = RefParser()
            parser.feed(content)
            for ref in parser.refs:
                problem = check_local_ref(path, ref)
                if problem:
                    errors.append(f"{rel}: {problem}")
    if errors:
        for issue in errors:
            print("FAIL:", issue)
        return 1
    print(f"PASS: scanned {len(files)} current public text files, no prohibited links/contact patterns; relative HTML assets resolve")
    print("NOT CHECKED: git history, external URLs, binary media metadata, online deployment, authorization and content truth")
    return 0


if __name__ == "__main__":
    sys.exit(main())
