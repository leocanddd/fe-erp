<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>DKI ERP — News</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<link rel="stylesheet" href="shell.css" />
<script src="auth.js"></script>
</head>
<body>

<!-- ====================== SIDEBAR ====================== -->
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <img class="logo-img" src="assets/Logo_DKI.png" alt="PT Duta Kencana Indah" />
  </div>

  <nav class="nav" id="nav"></nav>

  <div class="sidebar-bottom">
    <div class="user-row">
      <div class="avatar">R</div>
      <div class="user-meta">
        <div class="nm">Rayvin</div>
        <div class="rl">Superadmin</div>
      </div>
    </div>
    <a class="logout-row" href="index.html" title="Log Out">
      <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      <span class="label">LOG OUT</span>
    </a>
  </div>
</aside>

<!-- ====================== HEADER ====================== -->
<header class="header">
  <button class="collapse-toggle" id="collapseToggle">«</button>
  <div class="breadcrumb" id="breadcrumb"></div>
  <div class="company">PT. DUTA KENCANA INDAH</div>
</header>

<!-- ====================== MAIN ====================== -->
<main class="main">
<div class="welcome"><div><h1>News</h1><div class="date">09 Jun 2026</div></div><div class="sub-actions"><button class="btn" id="newNewsBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Tulis Berita</button></div></div><section class="vcard" id="newsListCard"><div class="pgrid" id="newsGrid"></div></section><section class="vcard" id="newsEditor" style="display:none"><div class="block"><h3 class="block-title">Tulis Berita Baru</h3><div class="fgrid"><div class="field"><label>Judul</label><input class="input" placeholder="Judul berita"></div><div class="field"><label>Subjudul</label><input class="input" placeholder="Subjudul"></div><div class="field full"><label>Deskripsi</label><textarea class="textarea" placeholder="Isi berita singkat..."></textarea></div><div class="field"><label>Gambar</label><div class="dropzone"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg><div style="font-size:12px">Upload gambar</div></div></div><div class="field"><label>Link Terkait</label><input class="input" placeholder="https://..."></div></div><div style="display:flex;gap:10px;margin-top:22px;justify-content:flex-end"><button class="btn ghost" id="cancelNews">Batal</button><button class="btn">Publish</button></div></div></section>
</main>

<style>
  /* ===== export buttons ===== */
  .export-row{display:flex;justify-content:flex-end;gap:10px;margin:-8px 0 16px;}
  .btn-export,.btn-excel{height:34px;padding:0 20px;border:none;border-radius:8px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;color:#fff;transition:filter .2s ease;}
  .btn-export{background:var(--grad);}
  .btn-excel{background:#27AE60;}
  .btn-export:hover,.btn-excel:hover{filter:brightness(1.08);}

  /* ===== main card ===== */
  .vcard{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px 28px;box-shadow:0 2px 8px rgba(0,0,0,.04);}
  .controls-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
  .vcard-title{margin:0;font-weight:700;font-size:16px;color:var(--text);}
  .custom-label{font-weight:500;font-size:14px;color:var(--muted);}
  .daterange{display:flex;align-items:center;gap:8px;position:relative;}
  .date-pill{height:30px;padding:0 14px;border:none;border-radius:100px;cursor:pointer;background:var(--grad);color:#fff;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;}
  .daterange .dash{color:var(--muted);}
  .date-native{position:absolute;left:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none;}
  .mw-toggle{margin-left:auto;display:flex;gap:6px;}
  .mw-toggle button{height:30px;padding:0 16px;border-radius:100px;border:none;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;background:var(--bg);color:var(--muted);transition:.2s;}
  .mw-toggle button.active{background:var(--grad);color:#fff;}

  .filter2-row{display:flex;align-items:center;gap:16px;margin-top:14px;flex-wrap:wrap;}
  .sp-filter{display:flex;gap:8px;flex-wrap:wrap;}
  .sp-pill{display:flex;align-items:center;gap:7px;height:30px;padding:0 14px;border-radius:100px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;background:#fff;border:1px solid var(--border);color:var(--muted);transition:.2s;white-space:nowrap;}
  .sp-pill .dot{width:7px;height:7px;border-radius:50%;background:var(--muted);flex:0 0 auto;}
  .sp-pill.active{background:var(--grad);border-color:transparent;color:#fff;}
  .sp-pill.active .dot{background:#fff;}
  .perpage{margin-left:auto;display:flex;align-items:center;gap:10px;}
  .pp-label{font-weight:500;font-size:13px;color:var(--muted);}
  .pp-pill{height:30px;padding:0 14px;border:none;border-radius:8px;cursor:pointer;background:var(--grad);color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;}

  /* salesperson summary cards (Pending) */
  .summary-row{display:flex;gap:12px;margin-top:16px;margin-bottom:16px;align-items:stretch;}
  .sum-card{flex:1 1 0;min-width:0;background:#F8FBFF;border:1px solid var(--border);border-radius:10px;padding:14px 16px;overflow:hidden;}
  .sum-top{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;}
  .sum-avatar{flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;}
  .sum-name{font-weight:600;font-size:14px;color:var(--dark);white-space:nowrap;}
  .sum-stat{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
  .sum-stat .k{font-weight:400;font-size:12px;color:var(--muted);white-space:nowrap;}
  .sum-stat .v{font-weight:700;font-size:16px;color:var(--red);}

  /* status filter (radio) */
  .statusfilter{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
  .sf-pill{height:34px;padding:0 18px;border:none;border-radius:100px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;background:var(--bg);color:var(--muted);transition:background .2s ease,color .2s ease;}
  .sf-pill.active{color:#fff;}
  .sf-pill.active[data-status="all"]{background:var(--grad);}
  .sf-pill.active[data-status="outstanding"]{background:#1CA7EC;}
  .sf-pill.active[data-status="due2w"]{background:#F5A623;}
  .sf-pill.active[data-status="overdue"]{background:#FE2C23;}
  .sf-pill.active[data-status="paid"]{background:#27AE60;}

  .divider{height:1px;background:var(--border);width:100%;}

  /* value summary (total / processing / target) */
  .valsummary{background:#F8FBFF;border:1px solid var(--border);border-radius:12px;padding:18px 22px;margin:16px 0 18px;}
  .vs-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;}
  .vs-lbl{display:block;font-weight:600;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
  .vs-amt{font-weight:800;font-size:28px;line-height:1;}
  .vs-amt.grad{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
  .vs-track{height:14px;border-radius:8px;background:var(--bg);overflow:hidden;margin:16px 0 7px;}
  .vs-fill{height:100%;border-radius:8px;background:var(--grad);transition:width .55s ease;}
  .vs-cap{font-weight:500;font-size:12px;color:var(--muted);}
  .vs-cap b{font-weight:800;color:var(--dark);}
  .vs-subs{display:flex;gap:30px;margin-top:14px;flex-wrap:wrap;}
  .vs-sub{display:flex;align-items:center;gap:9px;}
  .vs-sub .dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;}
  .vs-sub .dot.pend{background:#F5A623;}
  .vs-sub .dot.real{background:#27AE60;}
  .vs-sub .dot.tgt{background:var(--dark);}
  .vs-sub .k{font-weight:500;font-size:12px;color:var(--muted);}
  .vs-sub .v{font-weight:700;font-size:15px;color:var(--text);}

  /* purchase orders table */
  .visit-table{margin-top:4px;}
  .v-rowwrap{border-bottom:1px solid #F4F6F9;}
  .v-row{display:flex;align-items:center;gap:16px;padding:12px 8px;cursor:pointer;transition:background .2s ease;border-radius:8px;}
  .v-row:hover{background:#F8FBFF;}
  .v-oid{font-weight:700;font-size:14px;color:var(--dark);min-width:100px;}
  .v-store{font-weight:500;font-size:13px;color:var(--text);flex:1.5;min-width:150px;display:flex;flex-direction:column;gap:2px;overflow:hidden;}
  .v-store .vs-co{font-weight:600;font-size:13.5px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .v-store .vs-proj{font-weight:400;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .v-date{font-weight:400;font-size:13px;color:var(--muted);min-width:80px;}
  .v-delivery{font-weight:400;font-size:13px;color:var(--muted);min-width:100px;}
  .v-value{font-weight:600;font-size:13px;color:var(--text);min-width:100px;}
  .v-salesman{font-weight:400;font-size:13px;color:var(--muted);min-width:80px;}
  .v-status{font-weight:600;font-size:13px;min-width:70px;}
  .v-status.outstanding{color:#1CA7EC;}
  .v-status.due2w{color:#F5A623;}
  .v-status.overdue{color:#FE2C23;}
  .v-status.paid{color:#27AE60;}
  .v-view{font-weight:600;font-size:13px;color:var(--blue);cursor:pointer;min-width:40px;text-align:right;}
  .v-view:hover{text-decoration:underline;}
  .v-rowwrap.open .v-oid,.v-rowwrap.open .v-store .vs-co,.v-rowwrap.open .v-view{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
  @media (max-width:1320px){ .v-delivery{display:none;} }
  @media (max-width:1120px){ .v-date{display:none;} }
  @media (max-width:960px){ .v-salesman{display:none;} }

  /* expanded panel */
  .v-expand{overflow:hidden;height:0;opacity:0;}
  .v-expand-inner{background:#F8FBFF;border:1px solid var(--border);border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;display:flex;gap:32px;}
  .v-ex-left{flex:0 0 45%;}
  .v-ex-id{font-weight:800;font-size:22px;color:var(--dark);margin-bottom:12px;}
  .v-ex-store{font-weight:700;font-size:16px;color:var(--text);}
  .v-ex-addrlabel{font-weight:500;font-style:italic;font-size:13px;color:var(--muted);margin-top:4px;}
  .v-ex-addr{font-weight:400;font-size:13px;color:var(--text);line-height:1.6;margin-bottom:16px;}
  .v-ex-meta{font-weight:400;font-size:13px;color:var(--text);line-height:1.9;}
  .v-ex-pill{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:6px 20px;border-radius:100px;color:#fff;font-weight:700;font-size:13px;}
  .v-ex-pill .pdot{width:8px;height:8px;border-radius:50%;background:rgba(0,0,0,.28);}
  .v-ex-pill.outstanding{background:#1CA7EC;}
  .v-ex-pill.due2w{background:#F5A623;}
  .v-ex-pill.overdue{background:#FE2C23;}
  .v-ex-pill.paid{background:#27AE60;}
  .v-ex-substatus{display:flex;flex-direction:column;gap:2px;margin-top:12px;}
  .v-ex-substatus .sk{font-weight:500;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;}
  .v-ex-substatus .sv{font-weight:700;font-size:14px;}
  .v-ex-substatus .sv.outstanding{color:#1CA7EC;}
  .v-ex-substatus .sv.due2w{color:#F5A623;}
  .v-ex-substatus .sv.overdue{color:#FE2C23;}
  .v-ex-substatus .sv.paid{color:#27AE60;}
  /* Tanda Terima tracker (PO rows only) */
  .tt-block{margin-top:18px;border-top:1px solid var(--border);padding-top:14px;}
  .tt-title{font-weight:600;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;}
  .tt-step{display:flex;align-items:center;gap:11px;padding:6px 0;}
  .tt-dot{width:13px;height:13px;border-radius:50%;flex:0 0 auto;border:2px solid #E0E0E0;background:#fff;}
  .tt-step.done .tt-dot{background:var(--grad);border-color:transparent;}
  .tt-step.pending .tt-dot{background:#fff;border-color:#E0E0E0;}
  .tt-label{font-weight:600;font-size:13px;color:var(--text);flex:1;}
  .tt-step.pending .tt-label{color:var(--muted);}
  .tt-step.done .tt-label{color:var(--dark);}
  .tt-date{font-weight:500;font-size:12px;color:var(--muted);}
  .tt-step.done .tt-date{color:var(--blue);font-weight:700;}
  .tt-step.pending .tt-date{font-style:italic;}
  /* reminder / collection follow-up (expanded card) */
  .rm-block{margin-top:18px;border-top:1px solid var(--border);padding-top:14px;}
  .rm-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
  .rm-pill{display:inline-flex;align-items:center;gap:7px;font-weight:700;font-size:12px;padding:5px 12px;border-radius:100px;color:#fff;}
  .rm-pill .rm-dot{width:7px;height:7px;border-radius:50%;background:#fff;opacity:.9;}
  .rm-none{background:#9AA7B6;}
  .rm-reminded{background:#F5A623;}
  .rm-promised{background:var(--blue);}
  .rm-disputed{background:var(--red);}
  .rm-meta{font-weight:500;font-size:12px;color:var(--muted);}
  .rm-seglabel{font-weight:600;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
  .rm-seg{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
  .rm-opt{font-family:'Montserrat',sans-serif;font-weight:600;font-size:12px;color:var(--muted);background:#fff;border:1px solid var(--border);border-radius:100px;padding:6px 14px;cursor:pointer;transition:.18s;}
  .rm-opt:hover{border-color:var(--blue);color:var(--blue);}
  .rm-opt.sel{color:#fff;border-color:transparent;}
  .rm-opt.rm-none.sel{background:#9AA7B6;}
  .rm-opt.rm-reminded.sel{background:#F5A623;}
  .rm-opt.rm-promised.sel{background:var(--blue);}
  .rm-opt.rm-disputed.sel{background:var(--red);}
  .rm-actions{display:flex;gap:10px;flex-wrap:wrap;}
  .rm-send{display:inline-flex;align-items:center;gap:8px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;color:#fff;background:#25D366;border:none;border-radius:9px;padding:10px 16px;cursor:pointer;transition:.18s;box-shadow:0 2px 8px rgba(37,211,102,.25);}
  .rm-send:hover{filter:brightness(.95);transform:translateY(-1px);}
  .rm-send.alt{background:var(--grad);box-shadow:0 2px 8px rgba(28,167,236,.25);}
  .rm-send svg{flex:0 0 auto;}
  /* sent confirmation toast */
  .ar-toast{position:fixed;left:50%;bottom:30px;transform:translate(-50%,20px);display:flex;align-items:center;gap:9px;background:var(--dark);color:#fff;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;padding:12px 18px;border-radius:10px;box-shadow:0 10px 30px rgba(18,21,103,.32);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:1000;}
  .ar-toast.show{opacity:1;transform:translate(-50%,0);}
  .ar-toast svg{flex:0 0 auto;color:#25D366;}
  /* source badge (Retail / Project) */
  .ar-src{display:inline-block;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;border-radius:4px;color:#fff;margin-right:7px;vertical-align:1px;}
  .ar-src.retail{background:#1CA7EC;}
  .ar-src.project{background:#121567;}
  .v-ex-right{flex:1;min-width:0;}
  .li-row{display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);}
  .li-main{flex:1;min-width:0;}
  .li-name{font-weight:600;font-size:14px;color:var(--text);}
  .li-unit{font-weight:400;font-size:12px;color:var(--muted);margin-top:2px;}
  .li-qty{font-weight:400;font-size:13px;color:var(--muted);min-width:30px;text-align:center;}
  .li-total{font-weight:600;font-size:14px;color:var(--text);min-width:110px;text-align:right;}
  .li-totalrow{display:flex;align-items:center;justify-content:space-between;margin-top:8px;}
  .li-totalrow .tl{font-weight:700;font-size:15px;color:var(--text);}
  .li-totalrow .tv{font-weight:800;font-size:15px;color:var(--dark);}
  .v-ex-desc{margin-top:16px;font-weight:400;font-size:13px;color:var(--muted);line-height:1.7;text-align:right;}
  /* collection assignee + note (under description) */
  .vc-block{margin-top:16px;padding-top:16px;border-top:1px solid var(--border);text-align:left;}
  .vc-head{display:flex;align-items:center;gap:11px;margin-bottom:11px;}
  .vc-avatar{flex:0 0 34px;width:34px;height:34px;border-radius:50%;background:var(--grad);color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;}
  .vc-meta{display:flex;flex-direction:column;gap:1px;}
  .vc-label{font-weight:600;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;}
  .vc-name{font-weight:700;font-size:14px;color:var(--dark);}
  .vc-note{position:relative;background:#F8FBFF;border:1px solid var(--border);border-radius:10px;padding:12px 14px 26px;font-size:13px;line-height:1.6;color:var(--text);}
  .vc-notemark{font-family:Georgia,serif;font-size:22px;font-weight:700;color:var(--blue);margin-right:4px;line-height:0;vertical-align:-4px;}
  .vc-notedate{position:absolute;right:14px;bottom:9px;font-size:11px;font-weight:600;color:var(--muted);}
  .vc-note.empty{color:var(--muted);font-style:italic;padding:12px 14px;}

  .pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:20px;flex-wrap:wrap;}
  .pg-info{font-weight:400;font-size:13px;color:var(--muted);margin-right:8px;}
  .pg-btn{height:30px;padding:0 14px;border:1px solid var(--border);background:#fff;border-radius:6px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:500;font-size:13px;color:var(--muted);transition:.2s;}
  .pg-btn:hover:not(.active){border-color:var(--blue);color:var(--blue);}
  .pg-btn.active{background:var(--grad);border-color:transparent;color:#fff;}
</style>

<style>
  /* ====================== SCAFFOLD UTILITIES (shared across pages) ====================== */
  .welcome h1{margin:0;font-weight:800;font-size:24px;color:var(--dark);}
  .sub-actions{display:flex;align-items:center;gap:10px;}
  /* toolbar */
  .toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
  .toolbar .spacer{margin-left:auto;}
  .search{display:flex;align-items:center;gap:8px;height:38px;padding:0 14px;background:#fff;border:1px solid var(--border);border-radius:9px;min-width:240px;color:var(--muted);}
  .search input{border:none;outline:none;font-family:'Montserrat',sans-serif;font-size:13px;color:var(--text);width:100%;background:transparent;}
  .search svg{flex:0 0 auto;}
  /* buttons */
  .btn{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 18px;border:none;border-radius:9px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;color:#fff;background:var(--grad);transition:.18s;white-space:nowrap;}
  .btn:hover{filter:brightness(1.07);transform:translateY(-1px);}
  .btn.green{background:#27AE60;}
  .btn.ghost{background:#fff;border:1px solid var(--border);color:var(--text);}
  .btn.ghost:hover{border-color:var(--blue);color:var(--blue);transform:none;filter:none;}
  .btn.sm{height:32px;padding:0 13px;font-size:12px;border-radius:8px;}
  .btn svg{flex:0 0 auto;}
  /* segmented tabs */
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
  .tab{height:34px;padding:0 18px;border:none;border-radius:100px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;background:var(--bg);color:var(--muted);transition:.2s;}
  .tab.active{background:var(--grad);color:#fff;}
  .tab .ct{margin-left:7px;font-weight:700;opacity:.85;}
  /* generic data table */
  .dtable{width:100%;border-collapse:collapse;}
  .dtable thead th{text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);padding:0 14px 12px;border-bottom:1px solid var(--border);white-space:nowrap;}
  .dtable tbody td{padding:14px;border-bottom:1px solid #F1F4F8;font-size:13px;color:var(--text);vertical-align:middle;}
  .dtable tbody tr{transition:background .15s ease;}
  .dtable tbody tr:hover{background:#F8FBFF;}
  .dtable .t-id{font-weight:700;color:var(--dark);white-space:nowrap;}
  .dtable .t-strong{font-weight:600;color:var(--text);}
  .dtable .t-mut{color:var(--muted);}
  .dtable .t-right{text-align:right;}
  .dtable .t-center{text-align:center;}
  .row-actions{display:flex;gap:8px;align-items:center;}
  .iconbtn{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:#fff;color:var(--muted);cursor:pointer;transition:.18s;}
  .iconbtn:hover{border-color:var(--blue);color:var(--blue);}
  /* status chips */
  .chip{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:11px;padding:4px 11px;border-radius:100px;white-space:nowrap;}
  .chip .cdot{width:6px;height:6px;border-radius:50%;background:currentColor;}
  .chip.green{background:#E7F7EE;color:#1F8A4D;}
  .chip.amber{background:#FEF3E0;color:#C77E12;}
  .chip.blue{background:#E6F4FC;color:#1573A8;}
  .chip.red{background:#FDECEA;color:#D93A2F;}
  .chip.grey{background:#EEF1F5;color:#697789;}
  .chip.violet{background:#F0E9FA;color:#7B4FB5;}
  /* small tags */
  .tag{display:inline-block;font-weight:600;font-size:11px;padding:3px 9px;border-radius:6px;background:#EEF1F5;color:#5A6675;margin:2px 4px 2px 0;}
  .tag.brand{background:#E6F4FC;color:#1573A8;}
  /* KPI cards */
  .kgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:20px;}
  .kcard{background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px;box-shadow:0 2px 8px rgba(0,0,0,.04);}
  .kcard .kk{font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-bottom:8px;}
  .kcard .kv{font-weight:800;font-size:26px;color:var(--dark);line-height:1;}
  .kcard .kv.grad{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
  .kcard .kc{font-weight:600;font-size:12px;margin-top:7px;color:var(--muted);}
  /* forms */
  .fgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 22px;}
  .field{display:flex;flex-direction:column;gap:7px;min-width:0;}
  .field.full{grid-column:1 / -1;}
  .field label{font-weight:600;font-size:12px;color:var(--dark);}
  .field .hint{font-weight:400;font-size:11px;color:var(--muted);}
  .input,.textarea,.selectbox{font-family:'Montserrat',sans-serif;font-size:13px;color:var(--text);border:1px solid var(--border);border-radius:9px;padding:10px 13px;background:#fff;outline:none;transition:border-color .18s;width:100%;}
  .input:focus,.textarea:focus,.selectbox:focus{border-color:var(--blue);}
  .textarea{resize:vertical;min-height:96px;line-height:1.6;}
  /* uploader / dropzone */
  .dropzone{border:1.5px dashed #C9D3DF;border-radius:11px;background:#F8FBFF;padding:26px;text-align:center;color:var(--muted);cursor:pointer;transition:.18s;}
  .dropzone:hover{border-color:var(--blue);color:var(--blue);}
  .dropzone svg{margin-bottom:8px;}
  /* section blocks inside card */
  .block-title{font-weight:700;font-size:15px;color:var(--dark);margin:0 0 14px;}
  .block + .block{margin-top:26px;padding-top:24px;border-top:1px solid var(--border);}
  /* empty state */
  .empty{text-align:center;color:var(--muted);padding:48px 20px;}
  .empty svg{opacity:.5;margin-bottom:12px;}
  .empty .et{font-weight:700;font-size:15px;color:var(--text);margin-bottom:4px;}
  .pill-note{display:inline-block;font-size:12px;color:var(--muted);background:var(--bg);border-radius:100px;padding:5px 12px;}
</style>
<style>
/* ===== page-specific ===== */
.welcome .sub-actions{margin-left:auto;}

  .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;}
  .pcard{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#fff;transition:.18s;}
  .pcard:hover{box-shadow:0 8px 22px rgba(0,0,0,.08);transform:translateY(-2px);}
  .pcover{height:140px;background:linear-gradient(135deg,#E8F1F9,#D6E6F2);display:flex;align-items:center;justify-content:center;color:#9FB4C8;position:relative;}
  .pcover .pc-badge{position:absolute;top:10px;left:10px;}
  .pcard-body{padding:15px 16px;}
  .pcard-cat{font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--blue);margin-bottom:6px;}
  .pcard-title{font-weight:700;font-size:15px;color:var(--dark);line-height:1.35;margin-bottom:6px;}
  .pcard-sub{font-weight:400;font-size:12.5px;color:var(--muted);line-height:1.5;margin-bottom:12px;}
  .pcard-foot{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted);}

</style>

<script>
window.ACTIVE_KEY = 'website';
window.SELECTED_IDX = 1;
</script>
<script src="shell.js"></script>
<script>
/* ====================== PAGE SCRIPT ====================== */

const NEWS=[
 {t:'DKI Hadir di Pameran Konstruksi Indonesia 2026',sub:'Kunjungi booth kami di hall B3',cat:'Event',d:'08 Jun 2026',st:'pub'},
 {t:'Peluncuran Lini Produk PU Panel Generasi Baru',sub:'Performa insulasi lebih tinggi',cat:'Produk',d:'05 Jun 2026',st:'pub'},
 {t:'DKI Raih Sertifikasi ISO 9001:2015',sub:'Komitmen terhadap mutu',cat:'Korporat',d:'02 Jun 2026',st:'pub'},
 {t:'Tips Pemasangan Rockwool yang Benar',sub:'Panduan dari tim teknis',cat:'Edukasi',d:'28 Mei 2026',st:'draft'}
];
function renderNews(){
  $('newsGrid').innerHTML=NEWS.map(n=>'<div class="pcard"><div class="pcover">'+(n.st==='draft'?'<span class="pc-badge chip grey">Draft</span>':'<span class="pc-badge chip green"><span class="cdot"></span>Published</span>')+'</div>'
   +'<div class="pcard-body"><div class="pcard-cat">'+n.cat+'</div><div class="pcard-title">'+n.t+'</div><div class="pcard-sub">'+n.sub+'</div>'
   +'<div class="pcard-foot"><span>'+n.d+'</span><button class="btn ghost sm">Edit</button></div></div></div>').join('');
}
function showNewsEd(on){$('newsEditor').style.display=on?'block':'none';$('newsListCard').style.display=on?'none':'block';}
$('newNewsBtn').addEventListener('click',()=>showNewsEd(true));
$('cancelNews').addEventListener('click',()=>showNewsEd(false));
renderNews();


/* entrance handled by CSS */
</script>
</body>
</html>
