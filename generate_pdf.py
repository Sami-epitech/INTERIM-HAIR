import markdown
import subprocess
import os
import sys
import re

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

md_path = os.path.join(os.path.dirname(__file__), "DOCUMENTATION_COMPLETE_PROJET.md")
html_path = os.path.join(os.path.dirname(__file__), "DOCUMENTATION_COMPLETE_PROJET.html")
pdf_path = os.path.join(os.path.dirname(__file__), "DOCUMENTATION_COMPLETE_PROJET.pdf")

with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

# Nettoyage des éventuels résidus de syntaxe LaTeX
text = text.replace(r"$\ge$", "≥").replace(r"$\le$", "≤").replace(r"$\ge 60\%$", "≥ 60%")
text = text.replace(r"$<$", "<").replace(r"$>$", ">")

# Convert Markdown to HTML with table and fenced code extensions
html_body = markdown.markdown(text, extensions=['tables', 'fenced_code', 'toc'])

html_template = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Interim'hair — Dossier Technique & Fonctionnel</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  
  @page {{
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
    line-height: 1.6;
    font-size: 10.5pt;
    background: #fff;
    margin: 0;
    padding: 20px 28px;
  }}

  h1 {{
    font-size: 22pt;
    font-weight: 800;
    color: #4338ca;
    border-bottom: 3px solid #6366f1;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 12px;
  }}

  h2 {{
    font-size: 15pt;
    font-weight: 700;
    color: #1e1b4b;
    border-bottom: 1.5px solid #e0e7ff;
    padding-bottom: 6px;
    margin-top: 26px;
    margin-bottom: 12px;
    page-break-after: avoid;
  }}

  h3 {{
    font-size: 12.5pt;
    font-weight: 600;
    color: #3730a3;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }}

  h4 {{
    font-size: 11pt;
    font-weight: 600;
    color: #4b5563;
    margin-top: 14px;
    margin-bottom: 6px;
  }}

  p, li {{
    color: #374151;
  }}

  ul, ol {{
    padding-left: 22px;
    margin-top: 6px;
    margin-bottom: 12px;
  }}

  li {{
    margin-bottom: 4px;
  }}

  code {{
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9.5pt;
    background-color: #f3f4f6;
    color: #4338ca;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }}

  /* Style soigné pour les encadrés de formules et de code */
  pre {{
    background-color: #f8fafc;
    color: #1e1b4b;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #4f46e5;
    padding: 12px 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 10pt;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    line-height: 1.5;
    margin: 12px 0;
    page-break-inside: avoid;
  }}

  pre code {{
    background: transparent;
    color: #1e1b4b;
    padding: 0;
    border: none;
    font-size: 10pt;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }}

  th, td {{
    border: 1px solid #e5e7eb;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }}

  th {{
    background-color: #f1f5f9;
    color: #1e1b4b;
    font-weight: 600;
    border-bottom: 2px solid #cbd5e1;
  }}

  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}

  blockquote {{
    border-left: 4px solid #6366f1;
    margin: 14px 0;
    padding: 8px 16px;
    background-color: #eef2ff;
    color: #3730a3;
    border-radius: 0 6px 6px 0;
  }}

  hr {{
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 24px 0;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"✅ HTML généré : {html_path}")

# Run Microsoft Edge in headless mode to generate the PDF
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if os.path.exists(edge_path):
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    subprocess.run(cmd, check=True)
    print(f"🎉 PDF régénéré avec succès : {pdf_path}")
else:
    print("⚠️ Microsoft Edge introuvable pour la conversion directe en PDF.")
