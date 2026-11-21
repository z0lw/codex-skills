"""Exercise the memory-size CLI against the user's byte cap."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


CHECKER = Path(__file__).resolve().parents[1] / "scripts" / "check_memory_size.py"


class MemorySizeTests(unittest.TestCase):
    def check(self, content, *options):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "AGENTS.md"
            path.write_bytes(content)
            return subprocess.run(
                [sys.executable, str(CHECKER), str(path), "--json", *options],
                capture_output=True, text=True, check=False,
            )

    def test_byte_boundary(self):
        cases = [
            (b"x" * 29_999, 0),
            (b"x" * 30_000, 0),
            (b"x" * 30_001, 1),
            ("あ".encode() * 9_999 + b"xxx", 0),
            ("あ".encode() * 9_999 + b"xxxx", 1),
        ]
        for content, code in cases:
            with self.subTest(bytes=len(content), utf8=content[:1] != b"x"):
                result = self.check(content)
                self.assertEqual(result.returncode, code, result.stderr)
                report = json.loads(result.stdout)
                self.assertEqual(report["bytes"], len(content))
                self.assertEqual(report["limit"], 30_000)
                self.assertEqual(report["within_limit"], code == 0)

    def test_limit_cannot_bypass_cap(self):
        for limit in ["0", "-1", "30001", "65536"]:
            with self.subTest(limit=limit):
                result = self.check(b"x" * 30_001, "--limit", limit)
                self.assertEqual(result.returncode, 2)

    def test_stricter_limit(self):
        self.assertEqual(self.check(b"x" * 16, "--limit", "16").returncode, 0)
        self.assertEqual(self.check(b"x" * 16, "--limit", "15").returncode, 1)

    def test_required_section_is_excluded(self):
        content = b"x" * 29_990 + "\n## 8. 本人指定の必須要件\n".encode() + "あ".encode() * 5_000
        result = self.check(content)
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["bytes"], 29_991)
        self.assertEqual(report["total_bytes"], len(content))
        over = b"x" * 30_001 + "\n## 8. 本人指定の必須要件\n- a\n".encode()
        self.assertEqual(self.check(over).returncode, 1)

    def test_invalid_utf8(self):
        result = self.check(b"\xff")
        self.assertEqual(result.returncode, 2)
        self.assertIn("valid UTF-8", result.stderr)


if __name__ == "__main__":
    unittest.main()
