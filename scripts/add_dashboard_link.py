from pathlib import Path
p = Path('/home/ubuntu/truefix/client/src/pages/Home.tsx')
s = p.read_text()
needle = '<a href="#stack" className="transition hover:text-[#122131]">Built local-first</a>'
assert needle in s
s = s.replace(needle, needle + '<a href="/dashboard" className="transition hover:text-[#122131]">Internal dashboard</a>', 1)
p.write_text(s)
PY
python3 /home/ubuntu/truefix/scripts/add_dashboard_link.py
rm /home/ubuntu/truefix/scripts/add_dashboard_link.py
