import subprocess
import json

try:
    out = subprocess.check_output(['npm', 'audit', '--json'], shell=True).decode('utf-8')
except subprocess.CalledProcessError as e:
    out = e.output.decode('utf-8')

data = json.loads(out)
vulns = data.get('vulnerabilities', {})

rows = []
for pkg, info in vulns.items():
    sev = info.get('severity')
    is_direct = info.get('isDirect')
    effects = info.get('effects', [])
    via = info.get('via', [])
    advisories = []
    for v in via:
        if isinstance(v, dict):
            advisories.append((v.get('title'), v.get('range'), v.get('url')))
        elif isinstance(v, str):
            advisories.append((f'via {v}', '', ''))
    
    # Determine exposure:
    # Packages used purely by eslint/typescript are Dev / Build Tooling
    # Packages bundled in next/runtime are Production / Serverless Runtime
    dev_pkgs = ['brace-expansion', 'minimatch', '@eslint/config-array', 'eslint',
                '@eslint-community/eslint-utils', '@next/eslint-plugin-next',
                'eslint-config-next', '@typescript-eslint/utils',
                '@typescript-eslint/eslint-plugin', '@typescript-eslint/type-utils',
                'typescript-eslint', '@typescript-eslint/parser', '@eslint/eslintrc',
                '@typescript-eslint/typescript-estree', 'eslint-plugin-import',
                'eslint-plugin-jsx-a11y', 'eslint-plugin-react', 'source-map-js']
    
    if pkg in dev_pkgs:
        exp = 'Dev / Build Tooling (Linter/PostCSS)'
    elif pkg in ['next', 'sharp', 'zod']:
        exp = 'Produção (Runtime Serverless)'
    else:
        exp = 'Indireto'

    rows.append({
        'package': pkg,
        'severity': sev,
        'isDirect': is_direct,
        'exposure': exp,
        'effects': effects,
        'advisories': advisories
    })

sev_order = {'critical': 0, 'high': 1, 'moderate': 2, 'low': 3, 'info': 4}
rows.sort(key=lambda r: sev_order.get(r['severity'], 99))

print("Total de entradas:", len(rows))
print("\nMatriz Sanitizada de Vulnerabilidades (Ordem 042 - Item 3):\n")
for r in rows:
    adv_titles = [a[0] for a in r['advisories']]
    print(f"- Pacote: {r['package']} | Severidade: {r['severity'].upper()} | Direto: {r['isDirect']} | Exposicao: {r['exposure']}")
    for a in r['advisories']:
        if a[2]:
            print(f"    * {a[0]} (Range: {a[1]}) -> {a[2]}")
        else:
            print(f"    * {a[0]}")
