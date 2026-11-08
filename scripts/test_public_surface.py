"""Offline regression tests for the Pages public-surface scanner."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

MODULE = Path(__file__).with_name("check_public_surface.py")
spec = importlib.util.spec_from_file_location("public_surface", MODULE)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class PublicSurfaceGateTests(unittest.TestCase):
    def test_contact_patterns(self):
        samples = [
            ("person@example.com", gate.EMAIL),
            ("13812345678", gate.CN_PHONE),
            ("mailto:person@example.com", gate.CONTACT_URI),
            ("https://github.com/xingtu1996/xingtu-vault/blob/main/readme.md", gate.PRIVATE_LINK),
        ]
        for value, regex in samples:
            with self.subTest(value=value):
                self.assertIsNotNone(regex.search(value))

    def test_local_reference_validation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "assets").mkdir()
            (root / "assets" / "logo.svg").write_text("<svg></svg>", encoding="utf-8")
            page = root / "index.html"
            page.write_text("", encoding="utf-8")
            with patch.object(gate, "ROOT", root):
                self.assertIsNone(gate.check_local_ref(page, "assets/logo.svg"))
                self.assertIsNone(gate.check_local_ref(page, "#section"))
                self.assertIsNone(gate.check_local_ref(page, "https://example.org"))
                self.assertIn("missing local resource", gate.check_local_ref(page, "missing.svg"))
                self.assertIn("escapes repository root", gate.check_local_ref(page, "../secret.txt"))
                self.assertIn("disallowed URL scheme", gate.check_local_ref(page, "javascript:alert(1)"))

    def test_suspicious_public_html_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "index.html").write_text(
                '<a href="mailto:person@example.com">contact</a>',
                encoding="utf-8",
            )
            with patch.object(gate, "ROOT", root):
                self.assertEqual(gate.main(), 1)


if __name__ == "__main__":
    unittest.main()
