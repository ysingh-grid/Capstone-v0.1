#!/usr/bin/env python3
"""Generate T3 metrics chart (CD, F1, IoU over prompt index) as a PNG."""
import json, pathlib, sys

runs = [
    ('phase3_t3',         'Gemini Flash 2.5',        '#6366f1'),
    ('phase3_t3_claude',  'Claude Sonnet 4.6 (v1)',  '#f59e0b'),
    ('phase2_full_claude','Claude Sonnet 4.6 (v2)',  '#10b981'),
]
all_ids = [f'T3_{str(i).zfill(3)}' for i in range(1, 26)]

all_data = {}
for run_name, label, color in runs:
    p = pathlib.Path('eval_results') / run_name / 'results.jsonl'
    if not p.exists(): continue
    with open(p) as f:
        lines = [json.loads(l) for l in f if l.strip()]
    idx_map = {r['id']: r for r in lines if r.get('tier') == 'T3'}
    all_data[label] = {'color': color, 'map': idx_map}

xs = list(range(1, 26))

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

fig, axes = plt.subplots(3, 1, figsize=(15, 13), facecolor='#0a0e1a')
fig.subplots_adjust(hspace=0.45, left=0.07, right=0.97, top=0.92, bottom=0.07)

metrics = [
    ('chamfer_distance', 'Chamfer Distance (CD) ↓', 'cd'),
    ('f1_score',         'F1 Score ↑',              'f1'),
    ('volumetric_iou',   'Volumetric IoU ↑',        'iou'),
]

for ax, (mkey, mlabel, _) in zip(axes, metrics):
    ax.set_facecolor('#111827')
    ax.spines['bottom'].set_color('#1e2d45')
    ax.spines['left'].set_color('#1e2d45')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.tick_params(colors='#64748b', labelsize=9)
    ax.set_xlabel('T3 Prompt Index', color='#64748b', fontsize=9)
    ax.set_ylabel(mlabel, color='#e2e8f0', fontsize=10, fontweight='bold')
    ax.grid(color='#1e2d45', linestyle='--', linewidth=0.6, alpha=0.7)
    ax.set_xlim(0.5, 25.5)
    ax.set_xticks(xs)
    ax.set_xticklabels([str(x) for x in xs], fontsize=7.5)

    for label, d in all_data.items():
        color = d['color']
        ys = []
        valid_xs = []
        for i, pid in enumerate(all_ids):
            r = d['map'].get(pid)
            m = r.get('metrics') if r else None
            val = m.get(mkey) if m else None
            # Cap outlier CD (T3_012 Gemini = 100+)
            if val is not None and mkey == 'chamfer_distance' and val > 10:
                val = None
            if val is not None:
                ys.append(val)
                valid_xs.append(i + 1)

        if valid_xs:
            ax.plot(valid_xs, ys, color=color, linewidth=1.8, alpha=0.9,
                    marker='o', markersize=5, markerfacecolor=color,
                    markeredgecolor='#0a0e1a', markeredgewidth=0.8,
                    label=label, zorder=3)

            # Trend line (running mean window=5)
            if len(ys) >= 5:
                kernel = np.ones(5) / 5
                trend = np.convolve(ys, kernel, mode='same')
                ax.plot(valid_xs, trend, color=color, linewidth=0.8,
                        linestyle=':', alpha=0.5, zorder=2)

    # Horizontal reference
    ref = {'chamfer_distance': 1.0, 'f1_score': 0.85, 'volumetric_iou': 0.85}
    if mkey in ref:
        ax.axhline(ref[mkey], color='#ef4444', linewidth=0.8,
                   linestyle='--', alpha=0.6, zorder=1)
        ax.text(25.6, ref[mkey], f'target', color='#ef4444',
                va='center', fontsize=7, alpha=0.8)

# Legend
patches = [mpatches.Patch(color=d['color'], label=lbl)
           for lbl, d in all_data.items()]
fig.legend(handles=patches, loc='upper center', ncol=3,
           facecolor='#1a2235', edgecolor='#1e2d45',
           labelcolor='#e2e8f0', fontsize=10,
           bbox_to_anchor=(0.5, 0.97), framealpha=0.9)

fig.suptitle('T3 Complex Parts — CD / F1 / IoU Across Eval Runs',
             color='#e2e8f0', fontsize=14, fontweight='bold', y=0.995)

note = '* CD values capped at 10 for readability (T3_012 Gemini outlier = 100+). Dotted line = 5-point moving average.'
fig.text(0.5, 0.01, note, ha='center', color='#64748b', fontsize=7.5, style='italic')

out = pathlib.Path('/tmp/t3_metrics_chart.png')
fig.savefig(out, dpi=150, bbox_inches='tight', facecolor='#0a0e1a')
print(f"Saved: {out}")
