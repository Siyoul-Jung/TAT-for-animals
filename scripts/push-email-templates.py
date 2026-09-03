import json, os, sys, urllib.request, re

PROJECT = "nbkpjluuepxhqtkaygyl"

def read_env(key):
    with open(".env.local", encoding="utf-8") as f:
        for line in f:
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("\r")
    return None

token = read_env("SUPABASE_MANAGEMENT_TOKEN")
if not token:
    print("NO TOKEN"); sys.exit(1)

def html(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

body = {
    "mailer_templates_recovery_content": html("docs/email-templates/reset-password.html"),
    "mailer_templates_confirmation_content": html("docs/email-templates/confirm-signup.html"),
    "mailer_templates_magic_link_content": html("docs/email-templates/magic-link.html"),
}

req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{PROJECT}/config/auth",
    data=json.dumps(body).encode("utf-8"),
    method="PATCH",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/json",
    },
)
try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode("utf-8"))
        print("STATUS", r.status)
        # confirm the stored content now matches what we sent
        for k in body:
            stored = data.get(k, "")
            print(k, "->", "OK match" if stored == body[k] else f"MISMATCH (len stored={len(stored)})")
except urllib.error.HTTPError as e:
    print("HTTP ERROR", e.code, e.read().decode("utf-8"))
