/* @ds-bundle: {"format":4,"namespace":"HengselDesignSystem_5a9d09","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Brand","sourcePath":"components/brand/Brand.jsx"},{"name":"CustomerLogo","sourcePath":"components/brand/Brand.jsx"},{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"PhoneFrame","sourcePath":"components/devices/PhoneFrame.jsx"},{"name":"TabletFrame","sourcePath":"components/devices/TabletFrame.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Stepper","sourcePath":"components/forms/Stepper.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Card","sourcePath":"components/layout/Card.jsx"},{"name":"ListRow","sourcePath":"components/layout/ListRow.jsx"},{"name":"Stat","sourcePath":"components/layout/Stat.jsx"},{"name":"PageHeader","sourcePath":"components/navigation/PageHeader.jsx"},{"name":"SegmentedTabs","sourcePath":"components/navigation/SegmentedTabs.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Topbar","sourcePath":"components/navigation/Topbar.jsx"},{"name":"Alert","sourcePath":"components/status/Alert.jsx"},{"name":"Pill","sourcePath":"components/status/Pill.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"05b8c145bc7d","components/actions/IconButton.jsx":"e31415486f1b","components/brand/Brand.jsx":"d936a8efaf93","components/brand/Icon.jsx":"6f3332fe63a8","components/devices/PhoneFrame.jsx":"e7628a19f632","components/devices/TabletFrame.jsx":"a93c38a1834b","components/forms/Field.jsx":"bb3bf6a7edca","components/forms/Stepper.jsx":"7e9e41e9cff0","components/forms/Switch.jsx":"2578854e39c4","components/layout/Card.jsx":"730ba0ce8028","components/layout/ListRow.jsx":"a49351669481","components/layout/Stat.jsx":"379f820072f1","components/navigation/PageHeader.jsx":"6aff516ccdf3","components/navigation/SegmentedTabs.jsx":"d69e86501aeb","components/navigation/Sidebar.jsx":"3c10531dc651","components/navigation/Topbar.jsx":"a89848b8909a","components/status/Alert.jsx":"1f919e9e2125","components/status/Pill.jsx":"0252f1035460","ui_kits/_shared/signature-pad.jsx":"eb7d00bbb82f","ui_kits/crm/app.jsx":"a07613265869","ui_kits/crm/data.jsx":"8c59570cf0d5","ui_kits/crm/min-dag.jsx":"02e15b7b7080","ui_kits/crm/ordre.jsx":"57daf04ccd03","ui_kits/crm/shell.jsx":"a943677d5d8c","ui_kits/kundeportal/app.jsx":"446271b097c8","ui_kits/kundeportal/portal.jsx":"62356e9386bd","ui_kits/montorapp/app.jsx":"9a9e839dd7b1","ui_kits/montorapp/data.jsx":"6dce05c2571e","ui_kits/montorapp/i-dag.jsx":"6c8163762838","ui_kits/montorapp/jobb.jsx":"a68c91feded0","ui_kits/montorapp/skjema.jsx":"b54bad250b06","ui_kits/nettside/app.jsx":"730f0bb9428a","ui_kits/nettside/sections.jsx":"cacf4cf68263"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HengselDesignSystem_5a9d09 = window.HengselDesignSystem_5a9d09 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Brand.jsx
try { (() => {
const h = React.createElement;

/** H-merket etter assets/logo/hengsel-merke-*.svg: vater · overskap, benkeplate, komfyr og underskap · høyskap. */
function Mark() {
  return h('svg', {
    viewBox: '0 0 74 72',
    'aria-hidden': true,
    className: 'h-brand-mark'
  }, h('rect', {
    x: 0,
    y: 0,
    width: 10,
    height: 72,
    rx: 1,
    fill: "var(--mark-level)"
  }), h('rect', {
    x: 0,
    y: 0,
    width: 10,
    height: 4.2,
    rx: 1,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 0,
    y: 2.8,
    width: 10,
    height: 1.4,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 0,
    y: 67.8,
    width: 10,
    height: 4.2,
    rx: 1,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 0,
    y: 67.8,
    width: 10,
    height: 1.4,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 1.8,
    y: 6.7,
    width: 6.4,
    height: 4.6,
    rx: 2.3,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 2.5,
    y: 7.1,
    width: 0.6,
    height: 3.8,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 6.9,
    y: 7.1,
    width: 0.6,
    height: 3.8,
    fill: "var(--mark-grip)"
  }), h('ellipse', {
    cx: 5,
    cy: 9,
    rx: 1.4,
    ry: 1,
    fill: "var(--mark-level)"
  }), h('rect', {
    x: 2.6,
    y: 28,
    width: 4.8,
    height: 16,
    rx: 2.4,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 3,
    y: 33.5,
    width: 4,
    height: 0.6,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 3,
    y: 38.5,
    width: 4,
    height: 0.6,
    fill: "var(--mark-grip)"
  }), h('ellipse', {
    cx: 5,
    cy: 36,
    rx: 1,
    ry: 1.5,
    fill: "var(--mark-level)"
  }), h('rect', {
    x: 3.5,
    y: 51,
    width: 3,
    height: 13.5,
    rx: 1.5,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 35.1,
    y: 0,
    width: 14,
    height: 27.6,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 12.5,
    y: 0,
    width: 22,
    height: 23.8,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 12.5,
    y: 25.3,
    width: 22,
    height: 2.3,
    fill: "var(--mark-level)"
  }), h('rect', {
    x: 12.5,
    y: 39,
    width: 39.1,
    height: 6,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 35.1,
    y: 46.5,
    width: 14,
    height: 25.5,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 37.8,
    y: 49.4,
    width: 2.5,
    height: 6.1,
    rx: 1.25,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 12.5,
    y: 46.5,
    width: 22,
    height: 25.5,
    fill: "var(--mark-cab)"
  }), h('circle', {
    cx: 18,
    cy: 49.6,
    r: 1.5,
    fill: "var(--mark-grip)"
  }), h('circle', {
    cx: 23.5,
    cy: 49.6,
    r: 1.5,
    fill: "var(--mark-grip)"
  }), h('circle', {
    cx: 28.9,
    cy: 49.6,
    r: 1.5,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 15,
    y: 52.6,
    width: 17,
    height: 2.3,
    rx: 1.15,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 15.4,
    y: 56.6,
    width: 16.2,
    height: 13,
    rx: 0.4,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 51,
    y: 0,
    width: 0.6,
    height: 39,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 51,
    y: 45,
    width: 0.6,
    height: 27,
    fill: "var(--mark-grip)"
  }), h('rect', {
    x: 51.6,
    y: 0,
    width: 22,
    height: 72,
    fill: "var(--mark-cab)"
  }), h('rect', {
    x: 54.3,
    y: 36.5,
    width: 2.5,
    height: 6.1,
    rx: 1.25,
    fill: "var(--mark-grip)"
  }));
}

/** Hengsel-logoen: H-merket + «engsel» i Lausanne 350, produktnavn («CRM» eller «UTE») under med hake over. Size = px på «engsel». */
function Brand({
  size = 20,
  product = 'CRM',
  crm,
  markOnly,
  wordmark = true,
  href,
  style
}) {
  const only = markOnly || wordmark === false;
  const prod = crm === false ? null : product;
  const Tag = href ? 'a' : 'span';
  if (only) return h(Tag, {
    className: 'h-brand only',
    href,
    style: {
      fontSize: size,
      ...style
    },
    role: 'img',
    'aria-label': 'Hengsel'
  }, h(Mark));
  return h(Tag, {
    className: 'h-brand' + (prod ? ' has-product' : ''),
    href,
    style: {
      fontSize: size,
      ...style
    },
    'aria-label': prod ? 'Hengsel ' + prod : 'Hengsel'
  }, h(Mark), h('span', {
    className: 'h-brand-word',
    'aria-hidden': true
  }, 'engsel'), prod && h('svg', {
    viewBox: '0 0 30 26',
    className: 'h-brand-check',
    'aria-hidden': true
  }, h('path', {
    d: 'M3 14l8 8l16 -18',
    fill: 'none',
    stroke: 'var(--mark-check)',
    strokeWidth: 4.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  })), prod && h('span', {
    className: 'h-brand-product',
    'aria-hidden': true
  }, prod));
}

/** Kundens logo (lys og mørk versjon), vist i original farge og proporsjon. Uten fil vises navnet som plassholder. */
function CustomerLogo({
  src,
  srcDark,
  name,
  height = 30,
  maxWidth = 180,
  style
}) {
  const st = {
    height,
    maxWidth,
    width: 'auto',
    objectFit: 'contain',
    objectPosition: 'left center'
  };
  if (!src) return h('span', {
    className: 'h-clogo-name',
    style: {
      fontSize: height * 0.8,
      maxWidth,
      ...style
    }
  }, name);
  return h('span', {
    className: 'h-clogo',
    style
  }, h('img', {
    src,
    alt: name || '',
    className: srcDark ? 'h-clogo-l' : null,
    style: st
  }), srcDark && h('img', {
    src: srcDark,
    alt: name || '',
    className: 'h-clogo-d',
    style: st
  }));
}
Object.assign(__ds_scope, { Brand, CustomerLogo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Brand.jsx", error: String((e && e.message) || e) }); }

// components/brand/Icon.jsx
try { (() => {
const LUCIDE_SRC = 'https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js';
let loading = null;
function loadLucide() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.lucide && window.lucide.icons) return Promise.resolve(window.lucide);
  if (!loading) loading = new Promise(res => {
    const s = document.createElement('script');
    s.src = LUCIDE_SRC;
    s.onload = () => res(window.lucide);
    s.onerror = () => res(null);
    document.head.appendChild(s);
  });
  return loading;
}
const pascal = n => n.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

/** Linjeikon fra Lucide med 1,5 px strek i currentColor. */
function Icon({
  name,
  size = 20,
  strokeWidth = 1.5,
  style,
  label
}) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (!(window.lucide && window.lucide.icons)) loadLucide().then(() => force(n => n + 1));
  }, []);
  const lib = typeof window !== 'undefined' && window.lucide && window.lucide.icons;
  let node = lib ? lib[pascal(name)] : null;
  if (node && node[0] === 'svg') node = node[2];
  const kids = (node || []).map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  }));
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: strokeWidth * 24 / size,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    role: label ? 'img' : undefined,
    'aria-label': label,
    'aria-hidden': label ? undefined : true,
    style: {
      flex: 'none',
      display: 'block',
      ...style
    }
  }, kids);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
/** Pilleformet knapp, minst 44 px høy. */
function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  iconRight,
  href,
  type = 'button',
  disabled,
  onClick,
  children,
  style
}) {
  const cls = ['btn', variant === 'secondary' ? '' : variant, size === 'lg' ? 'lg' : '', block ? 'block' : ''].filter(Boolean).join(' ');
  const isz = size === 'lg' ? 22 : 18;
  const kids = [icon && React.createElement(__ds_scope.Icon, {
    key: 'i',
    name: icon,
    size: isz
  }), children, iconRight && React.createElement(__ds_scope.Icon, {
    key: 'r',
    name: iconRight,
    size: isz
  })];
  if (href) return React.createElement('a', {
    className: cls,
    href,
    onClick,
    style
  }, kids);
  return React.createElement('button', {
    className: cls,
    type,
    disabled,
    onClick,
    style
  }, kids);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
/** Rund ikonknapp, 44 × 44. */
function IconButton({
  icon,
  label,
  variant = 'secondary',
  onClick,
  disabled,
  style
}) {
  const cls = ['btn', 'icon', variant === 'soft' ? 'soft' : variant === 'secondary' ? '' : variant].filter(Boolean).join(' ');
  return React.createElement('button', {
    className: cls,
    type: 'button',
    'aria-label': label,
    title: label,
    onClick,
    disabled,
    style
  }, React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/devices/PhoneFrame.jsx
try { (() => {
/** Telefonoppsett (390 × 844) for montørappen: statuslinje, innhold, handlingsfelt og fanelinje. */
function PhoneFrame({
  children,
  actions,
  tabs,
  currentTab,
  onTab,
  time = '08.12',
  bare,
  bodyStyle,
  style
}) {
  return React.createElement('div', {
    className: 'h-phone' + (bare ? ' bare' : ''),
    style
  }, React.createElement('div', {
    className: 'h-phone-screen'
  }, React.createElement('div', {
    className: 'h-statusbar'
  }, React.createElement('span', null, time), React.createElement('span', {
    style: {
      letterSpacing: 2
    }
  }, '••• ▮')), React.createElement('div', {
    className: 'h-phone-body',
    style: bodyStyle
  }, children), actions && React.createElement('div', {
    className: 'h-phone-actions'
  }, actions), tabs && React.createElement('nav', {
    className: 'h-tabbar'
  }, tabs.map(t => React.createElement('button', {
    key: t,
    type: 'button',
    'aria-current': currentTab === t ? 'page' : undefined,
    onClick: () => onTab && onTab(t)
  }, t)))));
}
Object.assign(__ds_scope, { PhoneFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/devices/PhoneFrame.jsx", error: String((e && e.message) || e) }); }

// components/devices/TabletFrame.jsx
try { (() => {
/** iPad-oppsett liggende (1180 × 820) – CRM med sidemeny eller montørappen i to kolonner. */
function TabletFrame({
  children,
  bare,
  style
}) {
  return React.createElement('div', {
    className: 'h-ipad' + (bare ? ' bare' : ''),
    style
  }, React.createElement('div', {
    className: 'h-ipad-screen'
  }, children));
}
Object.assign(__ds_scope, { TabletFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/devices/TabletFrame.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
let uid = 0;
/** Skjemafelt: etikett, 44 px felt med radius 10, hjelpetekst eller feil. */
function Field({
  label,
  hint,
  error,
  as = 'input',
  options,
  id,
  rows,
  ...rest
}) {
  const [fid] = React.useState(() => id || 'hf-' + ++uid);
  const ctl = as === 'textarea' ? React.createElement('textarea', {
    id: fid,
    className: 'input',
    rows: rows || 3,
    'aria-invalid': !!error,
    ...rest
  }) : as === 'select' ? React.createElement('select', {
    id: fid,
    className: 'input',
    'aria-invalid': !!error,
    ...rest
  }, (options || []).map(o => {
    const v = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return React.createElement('option', {
      key: v.value,
      value: v.value
    }, v.label);
  })) : React.createElement('input', {
    id: fid,
    className: 'input',
    'aria-invalid': !!error,
    ...rest
  });
  return React.createElement('div', {
    className: 'field' + (error ? ' invalid' : '')
  }, label && React.createElement('label', {
    htmlFor: fid
  }, label), ctl, error ? React.createElement('span', {
    className: 'h-field-error'
  }, error) : hint ? React.createElement('span', {
    className: 'h-field-hint'
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Stepper.jsx
try { (() => {
/** Antallsvelger med minus og pluss. */
function Stepper({
  value = 1,
  onChange,
  min = 0,
  max = 999,
  label
}) {
  const set = v => onChange && onChange(Math.max(min, Math.min(max, v)));
  return React.createElement('div', {
    className: 'h-stepper',
    role: 'group',
    'aria-label': label
  }, React.createElement('button', {
    type: 'button',
    'aria-label': 'Færre',
    onClick: () => set(value - 1),
    disabled: value <= min
  }, React.createElement(__ds_scope.Icon, {
    name: 'minus',
    size: 22
  })), React.createElement('span', null, value), React.createElement('button', {
    type: 'button',
    'aria-label': 'Flere',
    onClick: () => set(value + 1),
    disabled: value >= max
  }, React.createElement(__ds_scope.Icon, {
    name: 'plus',
    size: 22
  })));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Av/på-bryter. */
function Switch({
  checked,
  onChange,
  label,
  disabled
}) {
  const btn = React.createElement('button', {
    type: 'button',
    role: 'switch',
    className: 'h-switch',
    'aria-checked': !!checked,
    'aria-label': label,
    disabled,
    onClick: () => onChange && onChange(!checked)
  });
  if (!label) return btn;
  return React.createElement('label', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      minHeight: 44,
      fontWeight: 'var(--w-strong)'
    }
  }, label, btn);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/layout/Card.jsx
try { (() => {
/** Kort i Off White på Beige 3 – 1 px Beige 2-ramme, radius 14. */
function Card({
  raised,
  tone = 'default',
  padding,
  as = 'article',
  children,
  style,
  onClick
}) {
  const bg = tone === 'highlight' ? {
    background: 'var(--surface-highlight-strong)',
    borderColor: 'transparent'
  } : tone === 'soft' ? {
    background: 'var(--surface-soft)'
  } : null;
  return React.createElement(as, {
    className: 'card' + (raised ? ' raised' : ''),
    onClick,
    style: {
      ...bg,
      ...(padding != null ? {
        padding
      } : null),
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Card.jsx", error: String((e && e.message) || e) }); }

// components/layout/ListRow.jsx
try { (() => {
/** Listerad. Valgt rad får Deep Blue-strek til venstre og svak blå bakgrunn. */
function ListRow({
  lead,
  title,
  meta,
  trail,
  selected,
  checkable,
  checked,
  onCheck,
  chevron,
  onClick,
  style
}) {
  return React.createElement('div', {
    className: 'h-row',
    'aria-selected': selected ? 'true' : undefined,
    role: onClick ? 'button' : undefined,
    onClick,
    style
  }, checkable && React.createElement('button', {
    className: 'h-check',
    role: 'checkbox',
    'aria-checked': !!checked,
    'aria-label': 'Ferdig',
    onClick: e => {
      e.stopPropagation();
      onCheck && onCheck(!checked);
    }
  }, checked ? React.createElement(__ds_scope.Icon, {
    name: 'check',
    size: 14,
    strokeWidth: 2
  }) : null), lead != null && React.createElement('span', {
    className: 'h-row-lead'
  }, lead), React.createElement('div', {
    className: 'h-row-body'
  }, React.createElement('span', {
    className: 'h-row-title',
    style: checked ? {
      textDecoration: 'line-through',
      color: 'var(--muted)'
    } : null
  }, title), meta && React.createElement('span', {
    className: 'h-row-meta'
  }, meta)), (trail || chevron) && React.createElement('span', {
    className: 'h-row-trail'
  }, trail, chevron && React.createElement(__ds_scope.Icon, {
    name: 'chevron-right',
    size: 18
  })));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/layout/Stat.jsx
try { (() => {
/** Nøkkeltall: stort tall i serif med tabular-nums og en dempet forklaring. */
function Stat({
  value,
  label,
  eyebrow,
  card = true,
  style
}) {
  const inner = [eyebrow && React.createElement('span', {
    key: 'e',
    className: 'eyebrow'
  }, eyebrow), React.createElement('span', {
    key: 'v',
    className: 'stat'
  }, value), label && React.createElement('p', {
    key: 'l'
  }, label)];
  return React.createElement('div', {
    className: 'h-stat' + (card ? ' card' : ''),
    style
  }, inner);
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Stat.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageHeader.jsx
try { (() => {
/** Sidehode i CRM: metalinje eller brødsmuler, serif-tittel og handlinger til høyre. */
function PageHeader({
  meta,
  crumbs,
  title,
  sub,
  actions,
  style
}) {
  return React.createElement('div', {
    className: 'h-pagehead',
    style
  }, React.createElement('div', {
    className: 'h-pagehead-main'
  }, crumbs && React.createElement('div', {
    className: 'h-crumbs'
  }, crumbs), meta && React.createElement('div', {
    className: 'h-pagehead-meta'
  }, meta), React.createElement('h1', null, title), sub && React.createElement('div', {
    className: 'h-pagehead-meta'
  }, sub)), actions && React.createElement('div', {
    className: 'h-pagehead-actions'
  }, actions));
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedTabs.jsx
try { (() => {
/** Pilleformede faner. segment = fasit (valgt i Warm Black), chips = filtre, soft = seksjonsfaner på ordre. */
function SegmentedTabs({
  items,
  value,
  onChange,
  variant = 'segment',
  block,
  label,
  style
}) {
  const cls = variant === 'chips' ? 'h-chips' : variant === 'soft' ? 'h-softtabs' : 'tabs' + (block ? ' block' : '');
  return React.createElement('div', {
    className: cls,
    role: 'tablist',
    'aria-label': label,
    style
  }, items.map(it => {
    const o = typeof it === 'string' ? {
      id: it,
      label: it
    } : it;
    return React.createElement('button', {
      key: o.id,
      role: 'tab',
      type: 'button',
      'aria-selected': value === o.id ? 'true' : 'false',
      onClick: () => onChange && onChange(o.id)
    }, o.label, o.count != null && React.createElement('small', null, o.count));
  }));
}
Object.assign(__ds_scope, { SegmentedTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedTabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
/** Sidemeny for CRM på PC og iPad: kundens logo + Hengsel-logoen, menypunkter med tall, søk og bruker nederst. */
function Sidebar({
  customer,
  items,
  current,
  onNavigate,
  user,
  search = true,
  feedback = true,
  width,
  style
}) {
  const item = (it, sub) => React.createElement('button', {
    key: it.id,
    type: 'button',
    className: 'h-nav-item' + (it.muted ? ' muted' : ''),
    'aria-current': current === it.id ? 'page' : undefined,
    onClick: () => onNavigate && onNavigate(it.id)
  }, it.label, it.count != null && React.createElement('small', null, it.count));
  return React.createElement('nav', {
    className: 'h-sidebar',
    style: {
      ...(width ? {
        width
      } : null),
      ...style
    },
    'aria-label': 'Hovedmeny'
  }, React.createElement('div', {
    className: 'h-sidebar-brand'
  }, customer ? [React.createElement(__ds_scope.CustomerLogo, {
    key: 'c',
    ...customer,
    height: 30,
    maxWidth: 180
  }), React.createElement(__ds_scope.Brand, {
    key: 'h',
    size: 20
  })] : React.createElement(__ds_scope.Brand, {
    size: 28
  })), items.map(it => it.children ? React.createElement(React.Fragment, {
    key: it.id
  }, item(it), React.createElement('div', {
    className: 'h-nav-sub'
  }, it.children.map(c => item(c, true)))) : item(it)), React.createElement('div', {
    className: 'h-sidebar-foot'
  }, search && React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'var(--ink)'
    }
  }, 'Søk', React.createElement('span', {
    className: 'h-kbd'
  }, '⌘K')), user && React.createElement('div', {
    className: 'h-user'
  }, React.createElement('b', null, user.name), React.createElement('span', null, user.role)), feedback && React.createElement('a', {
    href: '#',
    style: {
      color: 'var(--muted)',
      textDecoration: 'underline',
      textUnderlineOffset: 3,
      fontSize: '.95rem'
    }
  }, 'Gi tilbakemelding')));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Topbar.jsx
try { (() => {
/** Toppfelt: kundens logo (kundeportal, telefon) eller Hengsel-logoen (hengsel.no), kontekst og høyreside. */
function Topbar({
  customer,
  customerHeight = 30,
  context,
  right,
  plain,
  brandSize = 30,
  style
}) {
  return React.createElement('header', {
    className: 'h-topbar' + (plain ? ' plain' : ''),
    style
  }, customer ? React.createElement(__ds_scope.CustomerLogo, {
    ...customer,
    height: customerHeight
  }) : React.createElement(__ds_scope.Brand, {
    size: brandSize
  }), context && React.createElement('span', {
    className: 'h-topbar-ctx'
  }, context), right && React.createElement('div', {
    className: 'h-topbar-right'
  }, right));
}
Object.assign(__ds_scope, { Topbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Topbar.jsx", error: String((e && e.message) || e) }); }

// components/status/Alert.jsx
try { (() => {
const ICONS = {
  info: 'sparkles',
  ok: 'circle-check',
  warn: 'clock',
  bad: 'triangle-alert'
};

/** Varsel med statusfarge – fet innledning, kort forklaring og eventuelt én handling. */
function Alert({
  tone = 'warn',
  title,
  icon,
  children,
  action,
  style
}) {
  const ic = icon === false ? null : icon || (tone === 'info' ? ICONS.info : null);
  return React.createElement('div', {
    className: 'h-alert ' + tone,
    role: tone === 'bad' ? 'alert' : 'status',
    style
  }, ic && React.createElement(__ds_scope.Icon, {
    name: ic,
    size: 20,
    style: {
      marginTop: 2
    }
  }), React.createElement('p', {
    className: 'h-alert-text'
  }, title && React.createElement('b', null, title, ' '), children), action && React.createElement('div', {
    style: {
      flex: 'none'
    }
  }, action));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/Alert.jsx", error: String((e && e.message) || e) }); }

// components/status/Pill.jsx
try { (() => {
/** Liten pille med prikk i statusfargen og svak bakgrunn. */
function Pill({
  tone = 'neutral',
  dot = true,
  children,
  style
}) {
  const cls = ['pill', tone === 'neutral' ? '' : tone, dot ? '' : 'nodot'].filter(Boolean).join(' ');
  return React.createElement('span', {
    className: cls,
    style
  }, children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/Pill.jsx", error: String((e && e.message) || e) }); }

// ui_kits/_shared/signature-pad.jsx
try { (() => {
function SignaturePad({
  onChange,
  height = 180
}) {
  const ref = React.useRef(null);
  const drawing = React.useRef(false);
  const [has, setHas] = React.useState(false);
  const ctx = () => {
    const c = ref.current;
    const g = c.getContext('2d');
    g.lineWidth = 2.2;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = getComputedStyle(c).color;
    return g;
  };
  React.useEffect(() => {
    const c = ref.current;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2;
    c.height = r.height * 2;
    c.getContext('2d').scale(2, 2);
  }, []);
  const pos = e => {
    const r = ref.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return [p.clientX - r.left, p.clientY - r.top];
  };
  const down = e => {
    drawing.current = true;
    const g = ctx();
    g.beginPath();
    g.moveTo(...pos(e));
  };
  const move = e => {
    if (!drawing.current) return;
    e.preventDefault();
    const g = ctx();
    g.lineTo(...pos(e));
    g.stroke();
    if (!has) {
      setHas(true);
      onChange && onChange(true);
    }
  };
  const up = () => {
    drawing.current = false;
  };
  const clear = () => {
    const c = ref.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setHas(false);
    onChange && onChange(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      border: '1px solid var(--line)',
      borderRadius: 14,
      background: 'var(--surface)',
      height
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref,
    style: {
      width: '100%',
      height: '100%',
      display: 'block',
      touchAction: 'none',
      color: 'var(--ink)',
      cursor: 'crosshair'
    },
    onMouseDown: down,
    onMouseMove: move,
    onMouseUp: up,
    onMouseLeave: up,
    onTouchStart: down,
    onTouchMove: move,
    onTouchEnd: up
  }), !has && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 18,
      bottom: 16,
      right: 18,
      borderTop: '1px solid var(--line)',
      paddingTop: 6,
      color: 'var(--soft)',
      fontSize: '.85rem',
      pointerEvents: 'none'
    }
  }, "Signer her med fingeren")), has && /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      clear();
    },
    style: {
      fontSize: '.9rem',
      justifySelf: 'start'
    }
  }, "T\xF8m signaturen"));
}
Object.assign(window, {
  SignaturePad
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/_shared/signature-pad.jsx", error: String((e && e.message) || e) }); }

// ui_kits/crm/app.jsx
try { (() => {
function App() {
  const [page, setPage] = React.useState(() => localStorage.getItem('hengsel-crm-page') || 'min-dag');
  const [device, setDevice] = React.useState(() => localStorage.getItem('hengsel-crm-device') || 'pc');
  const [theme, setTheme] = React.useState(() => localStorage.getItem('hengsel-crm-theme') || 'light');
  React.useEffect(() => {
    localStorage.setItem('hengsel-crm-page', page);
    localStorage.setItem('hengsel-crm-device', device);
    localStorage.setItem('hengsel-crm-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [page, device, theme]);
  const label = (CRM_NAV.find(n => n.id === page) || {}).label || '';
  const screen = page === 'min-dag' ? /*#__PURE__*/React.createElement(MinDag, {
    device: device,
    onNavigate: setPage
  }) : page === 'ordre' ? /*#__PURE__*/React.createElement(Ordre, {
    device: device,
    onNavigate: setPage
  }) : /*#__PURE__*/React.createElement(CrmBlank, {
    title: label
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CrmShell, {
    device: device,
    current: page,
    onNavigate: setPage,
    user: {
      name: 'Kristine B.',
      role: 'Selger · Hamar'
    }
  }, screen), /*#__PURE__*/React.createElement("div", {
    className: "demo-ctl"
  }, /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'pc',
      label: 'PC'
    }, {
      id: 'ipad',
      label: 'iPad'
    }],
    value: device,
    onChange: setDevice
  }), /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'light',
      label: 'Lys'
    }, {
      id: 'dark',
      label: 'Mørk'
    }],
    value: theme,
    onChange: setTheme
  })), /*#__PURE__*/React.createElement("span", {
    className: "demo-note"
  }, "Demo \u2013 ingen ekte kunder"));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/crm/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/crm/data.jsx
try { (() => {
Object.assign(window, window.HengselDesignSystem_5a9d09);
const CRM_NAV = [{
  id: 'min-dag',
  label: 'Min dag',
  count: 7
}, {
  id: 'samtaler',
  label: 'Samtaler',
  count: 3
}, {
  id: 'salgstavle',
  label: 'Salgstavle'
}, {
  id: 'kunder',
  label: 'Kunder'
}, {
  id: 'tilbud',
  label: 'Tilbud'
}, {
  id: 'ordre',
  label: 'Ordre'
}, {
  id: 'saker',
  label: 'Saker',
  count: 1
}, {
  id: 'resultater',
  label: 'Resultater'
}, {
  id: 'mer',
  label: 'Mer',
  count: '…',
  muted: true
}];
const CRM_TASKS = [{
  id: 1,
  kind: 'melding',
  title: 'Kari skrev i kundeportalen',
  meta: 'Tilbud v3 · «Kan oppvaskmaskinen flyttes nærmere vasken?» · 07.42',
  pill: ['info', 'Melding'],
  head: 'Kari skrev i kundeportalen',
  sub: 'Tilbud v3 · «Kan oppvaskmaskinen flyttes nærmere vasken?» · 07.42',
  tiles: [['Kunde', 'Kari Nordmann'], ['Telefon', '900 00 000'], ['Tilbud', 'HA-T-2231 · v3'], ['Dager i fasen', '6']],
  quote: ['Kari · kundeportalen · 07.42', 'Kan oppvaskmaskinen flyttes nærmere vasken? Og jeg tror vi vil ha 30 mm benkeplate likevel.'],
  reply: true
}, {
  id: 2,
  kind: 'avvik',
  title: 'Kontroller OB – avvik på benkeplate',
  meta: 'Ordre O-2417 · benkeplate 20 mm i stedet for 30 mm',
  pill: ['bad', 'Avvik'],
  head: 'Kontroller OB – avvik på benkeplate',
  sub: 'Ordre O-2417 · ordrebekreftelsen fra benkeplateleverandøren',
  tiles: [['Bestilt', '30 mm'], ['I ordrebekreftelsen', '20 mm'], ['Kunde', 'Kari Nordmann'], ['Endringsfrist', 'fredag 9. okt']],
  action: 'Åpne ordren',
  goto: 'ordre'
}, {
  id: 3,
  kind: 'sjekk',
  title: 'Hvitevare må sjekkes – oppvaskmaskin',
  meta: 'Ordre O-2417 · montøren leste en annen modell enn bestilt',
  pill: ['warn', 'Sjekk'],
  head: 'Hvitevare må sjekkes – oppvaskmaskin',
  sub: 'Ordre O-2417 · registrert av Tor i montørappen',
  tiles: [['Bestilt', 'OPV-60-01E'], ['Montøren leste', 'OPV-60-00E'], ['Kunde', 'Kari Nordmann'], ['Ordre', 'O-2417']],
  quote: ['Hvorfor «Sjekk»', 'Montert en annen modell enn bestilt · OPV-60-00E'],
  action: 'Se varen'
}, {
  id: 4,
  kind: 'oppfolging',
  title: 'Ring Kari – tilbudet åpnet 3 ganger',
  meta: 'Tilbud HA-T-2231 v3 · 257 700 kr · 6 dager i fasen',
  pill: ['warn', 'Oppfølging'],
  head: 'Ring Kari',
  sub: 'Tilbudet er åpnet 3 ganger siden fredag.',
  tiles: [['Telefon', '900 00 000'], ['Tilbud', '257 700 kr']],
  action: 'Ring nå'
}, {
  id: 5,
  kind: 'mote',
  title: 'Møte kl. 14.00 · befaring hos Ola',
  meta: 'Eksempelveien 4, Brumunddal · kjøkken',
  pill: ['neutral', 'Møte'],
  head: 'Befaring hos Ola Nordmann',
  sub: 'Kl. 14.00 · Eksempelveien 4, Brumunddal · 25 min kjøring',
  tiles: [['Kunde', 'Ola Nordmann'], ['Rom', 'Kjøkken']],
  action: 'Vis veien'
}, {
  id: 6,
  kind: 'frist',
  title: 'Bekreft endringsfrist',
  meta: 'Ordre O-2417 · fredag 9. oktober',
  pill: ['warn', 'Frist'],
  head: 'Bekreft endringsfrist',
  sub: 'Ordre O-2417 · fredag 9. oktober',
  tiles: [['Ordre', 'O-2417'], ['Frist', 'fredag 9. okt']],
  action: 'Bekreft'
}, {
  id: 7,
  kind: 'sak',
  title: 'Sak R-2026-0163 venter på svar fra leverandør',
  meta: 'Nina Berg · servicenummer mangler · 3 dager',
  pill: ['info', 'Sak'],
  head: 'Sak R-2026-0163',
  sub: 'Venter på svar fra leverandør · 3 dager',
  tiles: [['Kunde', 'Nina Berg'], ['Mangler', 'Servicenummer']],
  action: 'Åpne saken'
}];
const CRM_FILTERS = {
  alt: () => true,
  haster: t => ['avvik', 'sjekk'].includes(t.kind),
  frister: t => t.kind === 'frist',
  oppfolging: t => t.kind === 'oppfolging'
};
Object.assign(window, {
  CRM_NAV,
  CRM_TASKS,
  CRM_FILTERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/crm/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/crm/min-dag.jsx
try { (() => {
function Tile({
  k,
  v
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "h-tile"
  }, /*#__PURE__*/React.createElement("span", null, k), /*#__PURE__*/React.createElement("b", null, v));
}
function KomIGang({
  onHide
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 16,
      padding: '24px 26px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--t-h3)'
    }
  }, "Kom i gang \xB7 0 av 5"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, "Fem steg f\xF8r Hengsel gj\xF8r jobben sin."), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onHide();
    },
    style: {
      marginLeft: 'auto',
      fontSize: '.95rem'
    }
  }, "Skjul")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10
    }
  }, ['Legg inn første kunde', 'Lag et tilbud', 'Koble kundeportalen', 'Legg inn prisliste', 'Last opp plantegning'].map(s => /*#__PURE__*/React.createElement(Button, {
    key: s,
    variant: "secondary"
  }, s))));
}
function Detail({
  task,
  onDone,
  onNavigate
}) {
  const [msg, setMsg] = React.useState('');
  const [sent, setSent] = React.useState([]);
  React.useEffect(() => {
    setMsg('');
    setSent([]);
  }, [task.id]);
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 14,
      alignContent: 'start',
      padding: '24px 26px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h2)'
    }
  }, task.head), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, task.sub)), /*#__PURE__*/React.createElement(Pill, {
    tone: task.pill[0]
  }, task.pill[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, task.tiles.map(([k, v]) => /*#__PURE__*/React.createElement(Tile, {
    key: k,
    k: k,
    v: v
  }))), task.quote && /*#__PURE__*/React.createElement("div", {
    className: "h-tile",
    style: {
      padding: '14px 18px',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, task.quote[0]), /*#__PURE__*/React.createElement("b", null, task.quote[1])), sent.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "h-tile",
    style: {
      background: 'var(--accent-soft)',
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Du \xB7 sendt til kundeportalen"), /*#__PURE__*/React.createElement("b", null, s))), task.reply && /*#__PURE__*/React.createElement(Field, {
    as: "textarea",
    placeholder: "Svar Kari \u2026 sendes til kundeportalen",
    value: msg,
    onChange: e => setMsg(e.target.value),
    rows: 3
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, task.reply ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      if (msg.trim()) {
        setSent([...sent, msg.trim()]);
        setMsg('');
      }
    }
  }, "Svar"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Utsett")) : /*#__PURE__*/React.createElement(Button, {
    onClick: () => task.goto && onNavigate(task.goto)
  }, task.action), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onDone(task.id);
    },
    style: {
      marginLeft: 'auto'
    }
  }, "Ferdig \u2013 neste")));
}
function MinDag({
  device,
  onNavigate
}) {
  const [filter, setFilter] = React.useState('alt');
  const [done, setDone] = React.useState({});
  const [sel, setSel] = React.useState(1);
  const [intro, setIntro] = React.useState(true);
  const list = CRM_TASKS.filter(CRM_FILTERS[filter]);
  const left = CRM_TASKS.filter(t => !done[t.id]).length;
  const task = CRM_TASKS.find(t => t.id === sel) || CRM_TASKS[0];
  const finish = id => {
    setDone({
      ...done,
      [id]: true
    });
    const nx = CRM_TASKS.find(t => !done[t.id] && t.id !== id);
    if (nx) setSel(nx.id);
  };
  const ipad = device === 'ipad';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    meta: 'mandag 5. oktober · uke 41 · Kjøkkenstudio Hamar · ' + left + ' ting venter på deg',
    title: "God morgen, Kristine.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Ny aktivitet")
  }), intro && /*#__PURE__*/React.createElement(KomIGang, {
    onHide: () => setIntro(false)
  }), ipad && /*#__PURE__*/React.createElement(Alert, {
    tone: "info"
  }, "Mens du var borte: Tor registrerte 1 hvitevare hos Kari Nordmann \u2013 1 m\xE5 sjekkes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: ipad ? '1fr 1fr' : 'minmax(0,1.55fr) minmax(0,1fr)',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '20px 24px 14px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)',
      fontSize: '1.1rem'
    }
  }, "I dag"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, left, " igjen"), /*#__PURE__*/React.createElement(SegmentedTabs, {
    variant: "chips",
    style: {
      marginLeft: 'auto'
    },
    value: filter,
    onChange: setFilter,
    items: [{
      id: 'alt',
      label: 'Alt'
    }, {
      id: 'haster',
      label: 'Haster',
      count: 2
    }, {
      id: 'frister',
      label: 'Frister'
    }, {
      id: 'oppfolging',
      label: 'Oppfølging'
    }]
  })), list.map(t => /*#__PURE__*/React.createElement(ListRow, {
    key: t.id,
    checkable: true,
    checked: !!done[t.id],
    onCheck: v => setDone({
      ...done,
      [t.id]: v
    }),
    selected: sel === t.id,
    onClick: () => setSel(t.id),
    title: t.title,
    meta: t.meta,
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: t.pill[0]
    }, t.pill[1])
  }))), !ipad && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "1,31 mill",
    label: "av 1,40 mill i oktober \xB7 94 %"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "35 %",
    label: "dekningsgrad \xB7 m\xE5l 34 %"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "42 %",
    label: "tilbud til ordre \xB7 butikken 38 %"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "14",
    label: "\xE5pne tilbud \xB7 2,1 mill \xB7 3 over 14 dager"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Detail, {
    task: task,
    onDone: finish,
    onNavigate: onNavigate
  }), !ipad && /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      gap: 18,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 130,
      height: 92,
      borderRadius: 10,
      background: 'var(--beige-1)',
      flex: 'none',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--warm-black)',
      fontSize: '.75rem'
    }
  }, "Bilde"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, "Kl. 14.00 \xB7 befaring \xB7 ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Vis m\xE5neden")), /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)'
    }
  }, "Ola Nordmann, Brumunddal"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, "Kj\xF8kken \xB7 25 min kj\xF8ring"))), !ipad && /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)',
      flex: 1
    }
  }, "Prisvarsler p\xE5 \xE5pne tilbud"), /*#__PURE__*/React.createElement(Pill, {
    tone: "warn"
  }, "2 varsler")))));
}
Object.assign(window, {
  MinDag,
  Tile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/crm/min-dag.jsx", error: String((e && e.message) || e) }); }

// ui_kits/crm/ordre.jsx
try { (() => {
const STEPS = [['Signert', '29. sep', 'done'], ['Bestilt', '29. sep', 'done'], ['OB kontrollert', '3 av 4', 'bad'], ['Kontrollmål', '6. okt', 'now'], ['Endringsfrist', '9. okt'], ['Levering', 'uke 44'], ['Montering', '28.–30. okt'], ['Faktura', ''], ['Etterkalkyle', '']];
function Timeline() {
  const dot = s => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    boxSizing: 'border-box',
    background: s === 'done' ? 'var(--ink)' : s === 'bad' ? 'var(--bad)' : s === 'now' ? 'var(--accent)' : 'var(--surface)',
    border: s ? 0 : '1.5px solid var(--soft)',
    position: 'relative',
    zIndex: 1
  });
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '22px 26px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + STEPS.length + ',1fr)'
    }
  }, STEPS.map(([l, d, s], i) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'grid',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: dot(s)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: i < 3 ? 'var(--ink)' : 'var(--line)',
      visibility: i === STEPS.length - 1 ? 'hidden' : 'visible'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: s === 'bad' || s === 'now' ? 'var(--w-strong)' : 'var(--w-body)'
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: '.88rem'
    }
  }, d))))));
}
const CHAIN = ['Kladd', 'Sendt', 'OB mottatt', 'OB avvik', 'OB godkjent', 'Delvis levert', 'Levert', 'Fakturert'];
function Chain({
  at,
  bad
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4
    }
  }, CHAIN.map((c, i) => {
    const cur = i === at;
    const past = i < at && c !== 'OB avvik';
    const st = cur ? {
      background: bad ? 'var(--bad)' : 'var(--ink)',
      color: 'var(--bg)',
      fontWeight: 'var(--w-strong)'
    } : past ? {
      background: 'var(--surface-highlight-strong)',
      color: 'var(--ink)'
    } : {
      color: 'var(--muted)'
    };
    return /*#__PURE__*/React.createElement("span", {
      key: c,
      style: {
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: '.8rem',
        ...st
      }
    }, c);
  }));
}
const SUPPLIERS = [{
  n: 'Fabrikk',
  via: 'CET',
  sum: '168 400 kr',
  at: 4
}, {
  n: 'Hvitevarer',
  via: 'E-post',
  sum: '46 900 kr',
  at: 4
}, {
  n: 'Benkeplater',
  via: 'E-post',
  sum: '31 800 kr',
  at: 3,
  bad: true
}, {
  n: 'Armatur',
  via: 'E-post',
  sum: '10 600 kr',
  at: 1
}];
function Ordre({
  onNavigate,
  device
}) {
  const [tab, setTab] = React.useState('Oversikt');
  const [ob, setOb] = React.useState('open');
  const [msgs, setMsgs] = React.useState([['Kari', '10.02', 'Bilde av vanntaket ligger under Filer.']]);
  const [m, setM] = React.useState('');
  const ipad = device === 'ipad';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    crumbs: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => e.preventDefault()
    }, "Ordre"), /*#__PURE__*/React.createElement("span", null, "\u203A"), /*#__PURE__*/React.createElement("b", null, "O-2417"), /*#__PURE__*/React.createElement(Pill, {
      tone: "info"
    }, "Bestilt"), ob === 'open' && /*#__PURE__*/React.createElement(Pill, {
      tone: "bad"
    }, "OB avvik")),
    title: "Levering uke 44, montering 28.\u201330. oktober",
    sub: "Ordre O-2417 \xB7 HA-10412 \xB7 Kari Nordmann \xB7 kj\xF8kken 23 skap \xB7 4 dager i fasen Ordrebekreftelser \xB7 hovedfase 2 av 5",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Kundekort"), /*#__PURE__*/React.createElement(IconButton, {
      icon: "ellipsis",
      label: "Flere valg"
    }), !ipad && /*#__PURE__*/React.createElement(Button, null, "Opprett faktura"))
  }), /*#__PURE__*/React.createElement(SegmentedTabs, {
    variant: "soft",
    value: tab,
    onChange: setTab,
    items: ['Oversikt', 'Bestillinger', 'Kontrollmål', 'Montasje', {
      id: 'Dokumenter',
      label: 'Dokumenter',
      count: 5
    }, 'Filer', 'Økonomi']
  }), ob === 'open' && /*#__PURE__*/React.createElement(Alert, {
    tone: "bad",
    title: "Avvik i ordrebekreftelsen for benkeplate.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Meld avvik")
  }, "Benkeplate 20 mm i stedet for 30 mm. M\xE5 lukkes f\xF8r endringsfristen fredag 9. oktober."), ob === 'ok' && /*#__PURE__*/React.createElement(Alert, {
    tone: "ok",
    title: "OB godkjent."
  }, "Ny ordrebekreftelse bestilt fra leverand\xF8ren."), /*#__PURE__*/React.createElement(Timeline, null), tab !== 'Oversikt' ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Fanen \xAB", tab, "\xBB er ikke tegnet i UI-kitet enn\xE5.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: ipad ? '1fr' : 'minmax(0,1.7fr) minmax(0,1fr)',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 6,
      padding: '24px 26px'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)',
      fontSize: '1.1rem'
    }
  }, "Bestillinger per leverand\xF8r"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem',
      marginBottom: 8
    }
  }, "Statusrekka per leverand\xF8r: Kladd \u2192 Sendt \u2192 OB mottatt \u2192 OB avvik \u2192 OB godkjent \u2192 Delvis levert \u2192 Levert \u2192 Fakturert"), SUPPLIERS.map(s => {
    const bad = s.bad && ob === 'open';
    return /*#__PURE__*/React.createElement("div", {
      key: s.n,
      style: {
        display: 'grid',
        gap: 10,
        padding: '16px 18px',
        borderRadius: 12,
        background: bad ? 'var(--bad-soft)' : 'transparent',
        boxShadow: bad ? 'inset 3px 0 0 var(--bad)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 120px 120px',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontWeight: 'var(--w-strong)'
      }
    }, s.n), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, s.via), /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        textAlign: 'right'
      }
    }, s.sum)), /*#__PURE__*/React.createElement(Chain, {
      at: s.bad && ob === 'ok' ? 4 : s.at,
      bad: bad
    }), bad && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'var(--surface-soft)',
        borderRadius: 10,
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        flex: 1,
        fontSize: '.95rem'
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontWeight: 'var(--w-strong)'
      }
    }, "Varelinje 3 \xB7 Benkeplate:"), " OB sier 20 mm, bestilt 30 mm. Pris uendret."), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setOb('ok')
    }, "Godta OB"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setOb('ok')
    }, "Be om ny OB")));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontWeight: 'var(--w-strong)',
      fontSize: '1.1rem',
      padding: '22px 24px 10px'
    }
  }, "Trenger handling \xB7 ", ob === 'open' ? 3 : 2), ob === 'open' && /*#__PURE__*/React.createElement(ListRow, {
    title: "Kontroller OB for benkeplate",
    meta: "Del 1 \xB7 f\xF8r endringsfristen",
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: "bad"
    }, "Avvik")
  }), /*#__PURE__*/React.createElement(ListRow, {
    title: "Sjekk oppvaskmaskin",
    meta: "Del 2 \xB7 mont\xF8ren leste annen modell",
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: "warn"
    }, "Sjekk")
  }), /*#__PURE__*/React.createElement(ListRow, {
    title: "Bekreft endringsfrist",
    meta: "fredag 9. oktober",
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: "warn"
    }, "Frist")
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 12,
      padding: '22px 24px'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)',
      fontSize: '1.1rem'
    }
  }, "Samtale om ordren"), msgs.map(([w, t, x], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "h-tile",
    style: {
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("b", null, w, " \xB7 ", t, ": ", x))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    placeholder: "Skriv til Kari \u2026",
    value: m,
    onChange: e => setM(e.target.value)
  })), /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      if (m.trim()) {
        setMsgs([...msgs, ['Du', 'nå', m.trim()]]);
        setM('');
      }
    }
  }, "Send")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Se hele samtalen og loggen \u203A")))));
}
Object.assign(window, {
  Ordre
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/crm/ordre.jsx", error: String((e && e.message) || e) }); }

// ui_kits/crm/shell.jsx
try { (() => {
function CrmShell({
  device,
  current,
  onNavigate,
  user,
  children
}) {
  const side = /*#__PURE__*/React.createElement(Sidebar, {
    customer: {
      name: 'Kjøkkenstudio Hamar'
    },
    items: CRM_NAV,
    current: current,
    onNavigate: onNavigate,
    user: user,
    width: device === 'ipad' ? 220 : 256
  });
  const main = /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'auto',
      padding: device === 'ipad' ? '34px 32px 48px' : '40px 56px 64px'
    }
  }, children);
  if (device === 'ipad') return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(TabletFrame, null, side, main));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh'
    }
  }, side, main);
}
function CrmBlank({
  title
}) {
  const {
    PageHeader,
    Card
  } = window.HengselDesignSystem_5a9d09;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    meta: "mandag 5. oktober \xB7 uke 41 \xB7 Kj\xF8kkenstudio Hamar",
    title: title
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      maxWidth: '62ch'
    }
  }, "Denne skjermen er ikke tegnet i UI-kitet enn\xE5. Det finnes ingen referanse for ", title.toLowerCase(), " i pakken \u2013 se README.")));
}
Object.assign(window, {
  CrmShell,
  CrmBlank
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/crm/shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kundeportal/app.jsx
try { (() => {
function Portal({
  phone
}) {
  const [view, setView] = React.useState(() => localStorage.getItem('hengsel-portal-view') || 'Tilbudet');
  const [sign, setSign] = React.useState(false);
  const [signed, setSigned] = React.useState(false);
  const [opts, setOpts] = React.useState({
    matt: true,
    lys: true
  });
  const [til, setTil] = React.useState({});
  React.useEffect(() => localStorage.setItem('hengsel-portal-view', view), [view]);
  const pending = ['t1', 't2'].filter(k => !til[k]).length;
  const content = view === 'Tilbudet' ? sign ? /*#__PURE__*/React.createElement(Signering, {
    phone: phone,
    onBack: () => setSign(false),
    onDone: () => {
      setSigned(true);
      setSign(false);
    }
  }) : /*#__PURE__*/React.createElement(Tilbud, {
    phone: phone,
    opts: opts,
    setOpts: setOpts,
    signed: signed,
    onSign: () => setSign(true)
  }) : view === 'Tillegg' ? /*#__PURE__*/React.createElement(Tillegg, {
    phone: phone,
    state: til,
    setState: setTil
  }) : /*#__PURE__*/React.createElement(Reisen, {
    signed: signed
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: phone ? 'auto' : '100vh',
      background: 'var(--surface-app)'
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    customer: {
      name: 'Kjøkkenstudio Hamar'
    },
    customerHeight: phone ? 22 : 30,
    context: phone ? null : 'Min side',
    right: phone ? /*#__PURE__*/React.createElement("a", {
      href: "#"
    }, "Logg ut") : /*#__PURE__*/React.createElement("span", null, "Kari Nordmann \xB7 ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        color: 'var(--muted)'
      }
    }, "Logg ut")),
    style: phone ? {
      padding: '10px 20px'
    } : null
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--wrap)',
      margin: '0 auto',
      padding: phone ? '20px 16px 32px' : '48px 40px 80px',
      display: 'grid',
      gap: phone ? 16 : 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: phone ? '2.1rem' : 'var(--t-h1)',
      lineHeight: 1.08
    }
  }, "Hei Kari, her er kj\xF8kkenet ditt."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Tilbud v3 gjelder til 15. okt. \xB7 Kristine svarer vanligvis innen en time.")), /*#__PURE__*/React.createElement(SegmentedTabs, {
    variant: "soft",
    value: view,
    onChange: v => {
      setView(v);
      setSign(false);
    },
    items: ['Tilbudet', {
      id: 'Tillegg',
      label: 'Tillegg',
      count: pending || null
    }, 'Reisen']
  }), content), /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--line)',
      padding: phone ? '18px 16px 24px' : '24px 40px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      color: 'var(--muted)',
      fontSize: '.88rem'
    }
  }, "Levert med ", /*#__PURE__*/React.createElement(Brand, {
    size: 16
  })));
}
function App() {
  const [device, setDevice] = React.useState(() => localStorage.getItem('hengsel-portal-device') || 'pc');
  const [theme, setTheme] = React.useState(() => localStorage.getItem('hengsel-portal-theme') || 'light');
  React.useEffect(() => {
    localStorage.setItem('hengsel-portal-device', device);
    localStorage.setItem('hengsel-portal-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [device, theme]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, device === 'pc' ? /*#__PURE__*/React.createElement(Portal, null) : /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(PhoneFrame, {
    bodyStyle: {
      padding: 0,
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(Portal, {
    phone: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "demo-ctl"
  }, /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'pc',
      label: 'PC'
    }, {
      id: 'phone',
      label: 'Telefon'
    }],
    value: device,
    onChange: setDevice
  }), /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'light',
      label: 'Lys'
    }, {
      id: 'dark',
      label: 'Mørk'
    }],
    value: theme,
    onChange: setTheme
  })), /*#__PURE__*/React.createElement("span", {
    className: "demo-note"
  }, "Demo \u2013 ingen ekte kunder"));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kundeportal/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kundeportal/portal.jsx
try { (() => {
Object.assign(window, window.HengselDesignSystem_5a9d09);
const P_BASE = 257700 - 12400 - 6800;
const P_OPTS = [{
  id: 'matt',
  label: 'Matte fronter',
  price: 12400
}, {
  id: 'lys',
  label: 'Belysning under overskap',
  price: 6800
}, {
  id: 'avfall',
  label: 'Avfallssystem',
  price: 3900
}];
const kr = n => n.toLocaleString('nb-NO').replace(/\u00a0|,/g, ' ') + ' kr';
function OptRow({
  o,
  on,
  toggle
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: toggle,
    role: "checkbox",
    "aria-checked": on,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%',
      minHeight: 52,
      padding: '0 16px',
      border: 0,
      borderRadius: 10,
      background: 'var(--surface-soft)',
      color: 'var(--ink)',
      font: 'var(--w-body) 1.0625rem var(--f-body)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      flex: 'none',
      boxSizing: 'border-box',
      background: on ? 'var(--accent)' : 'transparent',
      border: on ? 0 : '1.5px solid var(--soft)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, o.label), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      color: 'var(--muted)'
    }
  }, "+ ", kr(o.price)));
}
function KitchenImage({
  h
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--beige-1)',
      minHeight: h,
      height: '100%',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--warm-black)',
      fontSize: '.9rem'
    }
  }, "Bilde av kj\xF8kkenet fra tegningen");
}
function Tilbud({
  opts,
  setOpts,
  onSign,
  phone,
  signed
}) {
  const total = P_BASE + P_OPTS.filter(o => opts[o.id]).reduce((a, o) => a + o.price, 0);
  const body = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16,
      padding: phone ? '20px 20px 24px' : '40px 40px',
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '.92rem',
      color: 'var(--muted)'
    }
  }, "Tilbud HA-T-2231 \xB7 versjon 3", signed ? /*#__PURE__*/React.createElement(Pill, {
    tone: "ok"
  }, "Signert") : /*#__PURE__*/React.createElement(Pill, {
    tone: "info"
  }, "Venter p\xE5 deg")), /*#__PURE__*/React.createElement("span", {
    className: "stat",
    style: {
      fontSize: '2.6rem'
    }
  }, kr(total)), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Blek bl\xE5 fronter \xB7 M\xF8rk stein 30 mm \xB7 23 skap. Inkludert montering og frakt."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, P_OPTS.map(o => /*#__PURE__*/React.createElement(OptRow, {
    key: o.id,
    o: o,
    on: !!opts[o.id],
    toggle: () => !signed && setOpts({
      ...opts,
      [o.id]: !opts[o.id]
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12,
      flexWrap: 'wrap'
    }
  }, signed ? /*#__PURE__*/React.createElement(Alert, {
    tone: "ok",
    title: "Takk, Kari."
  }, "Avtalen er signert og lagret p\xE5 ordren.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    size: phone ? 'lg' : 'md',
    block: phone,
    onClick: onSign
  }, "Godkjenn og signer"), /*#__PURE__*/React.createElement(Button, {
    size: phone ? 'lg' : 'md',
    block: phone,
    variant: "secondary"
  }, "Still et sp\xF8rsm\xE5l"))));
  if (phone) return /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 200
    }
  }, /*#__PURE__*/React.createElement(KitchenImage, {
    h: 200
  })), body);
  return /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      minHeight: 560
    }
  }, /*#__PURE__*/React.createElement(KitchenImage, {
    h: 560
  }), body);
}
function Signering({
  onDone,
  onBack,
  phone
}) {
  const [ok, setOk] = React.useState(false);
  const [sig, setSig] = React.useState(false);
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 18,
      maxWidth: phone ? 'none' : 640,
      padding: phone ? '22px 20px' : '32px 36px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h2)'
    }
  }, "Signer kj\xF8psavtalen"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Tilbud HA-T-2231 v3 med tilvalgene du har valgt. Den signerte PDF-en lagres p\xE5 ordren, og du f\xE5r en kopi p\xE5 e-post."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-tile"
  }, /*#__PURE__*/React.createElement("span", null, "Levering"), /*#__PURE__*/React.createElement("b", null, "uke 44")), /*#__PURE__*/React.createElement("div", {
    className: "h-tile"
  }, /*#__PURE__*/React.createElement("span", null, "Montering"), /*#__PURE__*/React.createElement("b", null, "28.\u201330. oktober"))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      cursor: 'pointer',
      minHeight: 44
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: ok,
    onChange: e => setOk(e.target.checked),
    style: {
      width: 22,
      height: 22,
      accentColor: 'var(--accent)',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, "Jeg har lest ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "vilk\xE5rene"), " og godtar kj\xF8psavtalen.")), /*#__PURE__*/React.createElement(SignaturePad, {
    onChange: setSig,
    height: phone ? 160 : 180
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Navn",
    defaultValue: "Kari Nordmann"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexDirection: phone ? 'column' : 'row'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: phone ? 'lg' : 'md',
    disabled: !ok || !sig,
    onClick: onDone
  }, "Signer"), /*#__PURE__*/React.createElement(Button, {
    size: phone ? 'lg' : 'md',
    variant: "ghost",
    onClick: onBack
  }, "Tilbake til tilbudet")));
}
function Tillegg({
  phone,
  state,
  setState
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16,
      maxWidth: phone ? 'none' : 720
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Mont\xF8ren har funnet arbeid utover bestillingen. Ingenting gj\xF8res f\xF8r du har godkjent."), [{
    id: 't1',
    t: 'Ekstra stikkontakt bak kjøleskapet',
    m: 'Registrert av Tor · i dag 10.14',
    p: 1450
  }, {
    id: 't2',
    t: 'Tilpasse sokkel ved skjev vegg',
    m: 'Registrert av Tor · i dag 11.02',
    p: 900
  }].map(x => {
    const st = state[x.id];
    return /*#__PURE__*/React.createElement(Card, {
      key: x.id,
      style: {
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontWeight: 'var(--w-strong)'
      }
    }, x.t), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--muted)',
        fontSize: '.92rem'
      }
    }, x.m)), /*#__PURE__*/React.createElement("span", {
      className: "stat",
      style: {
        fontSize: '1.6rem'
      }
    }, kr(x.p))), st ? /*#__PURE__*/React.createElement(Pill, {
      tone: st === 'ok' ? 'ok' : 'neutral'
    }, st === 'ok' ? 'Godkjent' : 'Avslått') : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      onClick: () => setState({
        ...state,
        [x.id]: 'ok'
      })
    }, "Godkjenn"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setState({
        ...state,
        [x.id]: 'nei'
      })
    }, "Avsl\xE5")));
  }));
}
const REISE = [['Tilbud', 'v3 · 2. okt', 'done'], ['Signert', '', 'now'], ['Bestilt', ''], ['Levering', 'uke 44'], ['Montering', '28.–30. okt'], ['Ferdig', '']];
function Reisen({
  signed
}) {
  return /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden',
      maxWidth: 720
    }
  }, REISE.map(([l, d, s], i) => {
    const st = signed && i === 1 ? 'done' : signed && i === 2 ? 'now' : s;
    return /*#__PURE__*/React.createElement(ListRow, {
      key: l,
      lead: /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          width: 12,
          height: 12,
          borderRadius: '50%',
          boxSizing: 'border-box',
          background: st === 'done' ? 'var(--ink)' : st === 'now' ? 'var(--accent)' : 'transparent',
          border: st ? 0 : '1.5px solid var(--soft)'
        }
      }),
      title: l,
      meta: d || (st === 'now' ? 'Neste steg' : ' '),
      trail: st === 'done' ? /*#__PURE__*/React.createElement(Pill, {
        tone: "ok"
      }, "Ferdig") : st === 'now' ? /*#__PURE__*/React.createElement(Pill, {
        tone: "info"
      }, "N\xE5") : null
    });
  }));
}
Object.assign(window, {
  Tilbud,
  Signering,
  Tillegg,
  Reisen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kundeportal/portal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/montorapp/app.jsx
try { (() => {
const TABS = ['I dag', 'Uke', 'Kommende', 'Ferdige', 'Meg'];
function useMontor() {
  const [stack, setStack] = React.useState(() => JSON.parse(localStorage.getItem('hengsel-montor-stack') || '[["idag"]]'));
  const [tab, setTab] = React.useState('Info');
  const [ks, setKs] = React.useState({
    0: true,
    1: true,
    2: true,
    3: true
  });
  const [enRoute, setEnRoute] = React.useState(false);
  const [av, setAv] = React.useState({
    reason: 'Skadet ved montering',
    n: 1,
    ny: true,
    photo: false
  });
  const [notice, setNotice] = React.useState(false);
  const [signed, setSigned] = React.useState(false);
  const [done, setDone] = React.useState(false);
  React.useEffect(() => localStorage.setItem('hengsel-montor-stack', JSON.stringify(stack)), [stack]);
  const top = stack[stack.length - 1];
  const go = (s, arg) => setStack([...stack, [s, arg]]);
  const back = () => setStack(stack.length > 1 ? stack.slice(0, -1) : stack);
  const home = () => {
    setStack([['idag']]);
    setDone(false);
  };
  const openJob = () => setStack([['idag'], ['jobb']]);
  const setStackTo = setStack;
  return {
    stack,
    top,
    go,
    back,
    home,
    openJob,
    setStackTo,
    tab,
    setTab,
    ks,
    setKs,
    enRoute,
    setEnRoute,
    av,
    setAv: p => setAv({
      ...av,
      ...p
    }),
    notice,
    setNotice,
    signed,
    setSigned,
    done,
    setDone
  };
}
function Screen({
  s,
  compact
}) {
  const [name, arg] = s.top;
  if (name === 'idag') return /*#__PURE__*/React.createElement(IDag, {
    compact: compact,
    onOpen: () => s.go('jobb'),
    enRoute: s.enRoute,
    setEnRoute: s.setEnRoute
  });
  if (name === 'jobb') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SubHeader, {
    title: "Kari Nordmann",
    onBack: s.back
  }), /*#__PURE__*/React.createElement(Jobb, {
    ks: s.ks,
    go: s.go,
    tab: s.tab,
    setTab: s.setTab,
    notice: s.notice
  }));
  if (name === 'ks') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SubHeader, {
    title: "Kari Nordmann",
    onBack: s.back
  }), /*#__PURE__*/React.createElement(KS, {
    ks: s.ks,
    setKs: s.setKs
  }));
  if (name === 'avvik') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SubHeader, {
    title: "Meld avvik",
    onBack: s.back
  }), /*#__PURE__*/React.createElement(Avvik, {
    itemId: arg,
    state: s.av,
    set: s.setAv
  }));
  if (name === 'ferdig') return /*#__PURE__*/React.createElement(React.Fragment, null, !s.done && /*#__PURE__*/React.createElement(SubHeader, {
    title: "Kari Nordmann",
    onBack: s.back
  }), /*#__PURE__*/React.createElement(Ferdig, {
    ks: s.ks,
    signed: s.signed,
    setSigned: s.setSigned,
    done: s.done
  }));
}
function Actions({
  s
}) {
  const [name] = s.top;
  if (name === 'jobb' || name === 'ks') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    icon: "triangle-alert",
    style: {
      flex: 1
    },
    onClick: () => s.go('avvik')
  }, "Meld avvik"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "circle-check",
    style: {
      flex: 1.3
    },
    onClick: () => s.go('ferdig')
  }, "Ferdig montert"));
  if (name === 'avvik') return /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    block: true,
    onClick: () => {
      s.setNotice(true);
      s.back();
    }
  }, "Send avvik");
  if (name === 'ferdig') return s.done ? /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    block: true,
    variant: "secondary",
    onClick: s.home
  }, "Tilbake til I dag") : /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    block: true,
    disabled: !s.signed,
    onClick: () => s.setDone(true)
  }, "Bekreft ferdig montert");
  return null;
}
function App() {
  const s = useMontor();
  const [device, setDevice] = React.useState(() => localStorage.getItem('hengsel-montor-device') || 'phone');
  const [theme, setTheme] = React.useState(() => localStorage.getItem('hengsel-montor-theme') || 'light');
  React.useEffect(() => {
    localStorage.setItem('hengsel-montor-device', device);
    localStorage.setItem('hengsel-montor-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [device, theme]);
  const act = /*#__PURE__*/React.createElement(Actions, {
    s: s
  });
  const hasAct = s.top[0] !== 'idag';
  let view;
  if (device === 'phone') view = /*#__PURE__*/React.createElement(PhoneFrame, {
    actions: hasAct ? act : null,
    tabs: hasAct ? null : TABS,
    currentTab: "I dag"
  }, /*#__PURE__*/React.createElement(Screen, {
    s: s
  }));else {
    const right = s.top[0] === 'idag' ? ['jobb'] : s.top;
    const rs = {
      ...s,
      top: right,
      back: s.top[0] === 'idag' ? () => {} : s.back,
      go: s.top[0] === 'idag' ? (n, x) => s.setStackTo([['idag'], ['jobb'], [n, x]]) : s.go
    };
    view = /*#__PURE__*/React.createElement(TabletFrame, null, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 400,
        flex: 'none',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        padding: '30px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(IDag, {
      compact: true,
      onOpen: s.openJob,
      enRoute: s.enRoute,
      setEnRoute: s.setEnRoute
    })), /*#__PURE__*/React.createElement("nav", {
      className: "h-tabbar",
      style: {
        paddingBottom: 14
      }
    }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
      key: t,
      "aria-current": t === 'I dag' ? 'page' : undefined
    }, t)))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        padding: '26px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Screen, {
      s: rs
    })), /*#__PURE__*/React.createElement("div", {
      className: "h-phone-actions",
      style: {
        padding: '14px 32px'
      }
    }, /*#__PURE__*/React.createElement(Actions, {
      s: rs
    }))));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      boxSizing: 'border-box'
    }
  }, view), /*#__PURE__*/React.createElement("div", {
    className: "demo-ctl"
  }, /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'phone',
      label: 'Telefon'
    }, {
      id: 'ipad',
      label: 'iPad'
    }],
    value: device,
    onChange: setDevice
  }), /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'light',
      label: 'Lys'
    }, {
      id: 'dark',
      label: 'Mørk'
    }],
    value: theme,
    onChange: setTheme
  })), /*#__PURE__*/React.createElement("span", {
    className: "demo-note"
  }, "Demo \u2013 ingen ekte kunder"));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/montorapp/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/montorapp/data.jsx
try { (() => {
Object.assign(window, window.HengselDesignSystem_5a9d09);
const M_JOBS = [{
  id: 'j1',
  time: '08.00',
  title: 'Kari Nordmann · Kjøkken',
  place: 'Ottestad · dag 2 av 3 · Pavel K. og deg',
  next: true,
  missing: 'Kjøleskap kommer uke 46 · benkeplate ikke bekreftet.'
}, {
  id: 'j2',
  time: '13.00',
  title: 'Kontrollmål · Ola Nordmann',
  place: 'Eksempelveien 4, Brumunddal',
  pill: ['info', 'Kl. 13']
}, {
  id: 'j3',
  time: '15.30',
  title: 'Nina Berg · Bad',
  place: 'Hamar · restpunkt: silikon',
  pill: ['warn', 'Restpunkt']
}];
const M_ITEMS = [{
  id: 'v1',
  name: 'Underskap 60 med skuffer',
  code: 'US60 · OB 231200-004812',
  status: ['ok', 'Levert']
}, {
  id: 'v2',
  name: 'Høyskap 60 for kjøleskap',
  code: 'HS60 · OB 231200-004812',
  status: ['ok', 'Levert']
}, {
  id: 'v3',
  name: 'Kjøleskap integrert',
  code: 'KJ-180 · uke 46',
  status: ['warn', 'Mangler']
}, {
  id: 'v4',
  name: 'Benkeplate 30 mm',
  code: 'BP-30 · ikke bekreftet',
  status: ['warn', 'Mangler']
}, {
  id: 'v5',
  name: 'Oppvaskmaskin',
  code: 'OPV-60-01E',
  status: ['ok', 'Levert']
}];
const M_KS = ['Skrog i lodd og vater', 'Skap skrudd sammen og til vegg', 'Fronter justert', 'Skuffer justert', 'Sokkel montert', 'Benkeplate festet', 'Utsparinger for vask og topp', 'Silikon ved vask', 'Hvitevarer montert', 'Lister og dekksider', 'Håndtak montert', 'Funksjonstest skuffer og dører', 'Ryddet og støvsugd', 'Kunden har fått gjennomgang'];
const M_REASONS = ['Skadet ved montering', 'Skadet ved levering', 'Feil vare', 'Mangler', 'Feil mål / produksjonsfeil'];
Object.assign(window, {
  M_JOBS,
  M_ITEMS,
  M_KS,
  M_REASONS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/montorapp/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/montorapp/i-dag.jsx
try { (() => {
function NextJobCard({
  job,
  onOpen,
  enRoute,
  setEnRoute
}) {
  return /*#__PURE__*/React.createElement(Card, {
    tone: "highlight",
    style: {
      display: 'grid',
      gap: 14,
      padding: '22px 22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Neste \xB7 ", job.time), enRoute && /*#__PURE__*/React.createElement(Pill, {
    tone: "info"
  }, "P\xE5 vei")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h2)'
    }
  }, job.title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, job.place), /*#__PURE__*/React.createElement(Alert, {
    tone: "warn",
    title: "Mangler noe."
  }, job.missing), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, enRoute ? /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    style: {
      flex: 1
    },
    onClick: onOpen
  }, "Start jobben") : /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "dark",
    style: {
      flex: 1
    },
    onClick: () => setEnRoute(true)
  }, "P\xE5 vei"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    style: {
      flex: 1
    },
    onClick: onOpen
  }, "\xC5pne jobben")));
}
function LaterJob({
  job,
  onOpen
}) {
  return /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ListRow, {
    lead: job.time,
    title: job.title,
    meta: job.place,
    trail: job.pill && /*#__PURE__*/React.createElement(Pill, {
      tone: job.pill[0]
    }, job.pill[1]),
    onClick: onOpen
  }));
}
function IDag({
  onOpen,
  enRoute,
  setEnRoute,
  compact
}) {
  const [next, ...later] = M_JOBS;
  return /*#__PURE__*/React.createElement(React.Fragment, null, !compact && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement(CustomerLogo, {
    name: "Kj\xF8kkenstudio Hamar",
    height: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 4,
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, "mandag 5. oktober \xB7 oppdatert n\xE5 nettopp"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: compact ? '2.3rem' : '2.5rem',
      lineHeight: 1.08
    }
  }, "God morgen, Tor."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "3 jobber i dag.")), /*#__PURE__*/React.createElement(NextJobCard, {
    job: next,
    onOpen: () => onOpen(next.id),
    enRoute: enRoute,
    setEnRoute: setEnRoute
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem',
      marginTop: 4
    }
  }, "Senere i dag"), later.map(j => /*#__PURE__*/React.createElement(LaterJob, {
    key: j.id,
    job: j,
    onOpen: () => onOpen(j.id)
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem'
    }
  }, "I morgen \xB7 Kari Nordmann \xB7 dag 3 av 3"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Vis lista \u203A"));
}
Object.assign(window, {
  IDag
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/montorapp/i-dag.jsx", error: String((e && e.message) || e) }); }

// ui_kits/montorapp/jobb.jsx
try { (() => {
function SubHeader({
  title,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '0 -6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Tilbake",
    style: {
      border: 0,
      background: 'transparent',
      color: 'var(--ink)',
      width: 44,
      height: 44,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 24
  })), /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)',
      fontSize: '1.2rem'
    }
  }, title));
}
function ActionCard({
  icon,
  title,
  sub,
  onClick,
  children
}) {
  return /*#__PURE__*/React.createElement(Card, {
    onClick: onClick,
    style: {
      display: 'grid',
      gap: 14,
      cursor: onClick ? 'pointer' : 'default',
      padding: '18px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: 'var(--accent-soft)',
      color: 'var(--accent)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '.95rem',
      lineHeight: 1.4
    }
  }, sub)), onClick && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--soft)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 20
  }))), children);
}
function Progress({
  v,
  max
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 99,
      background: 'var(--surface-highlight-strong)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: v / max * 100 + '%',
      height: '100%',
      borderRadius: 99,
      background: 'var(--accent)',
      transition: 'width .3s'
    }
  }));
}
function JobbInfo({
  ks,
  go
}) {
  const n = Object.values(ks).filter(Boolean).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "KS under montering"), /*#__PURE__*/React.createElement(ActionCard, {
    icon: "clipboard-list",
    title: "KS Kj\xF8kken",
    sub: n + ' av ' + M_KS.length + ' punkter',
    onClick: () => go('ks')
  }, /*#__PURE__*/React.createElement(Progress, {
    v: n,
    max: M_KS.length
  })), /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "Tilleggsarbeid"), /*#__PURE__*/React.createElement(ActionCard, {
    icon: "circle-plus",
    title: "Legg til tilleggsarbeid",
    sub: "Arbeid utover bestillingen. Du kan gj\xF8re det f\xF8r det er godkjent.",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "Restpunkter"), /*#__PURE__*/React.createElement(ActionCard, {
    icon: "map-pin",
    title: "Ny n\xE5l",
    sub: "Sett en n\xE5l p\xE5 tegningen der noe gjenst\xE5r",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "Kunde"), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 18px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-body)',
      display: 'block'
    }
  }, "Kari Nordmann"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, "900 00 000")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "message-circle",
    label: "Send melding",
    variant: "soft"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "phone",
    label: "Ring",
    variant: "soft"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "navigation",
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, "Eksempelveien 12, 2312 Ottestad", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '.92rem'
    }
  }, "N\xF8kkel hos naboen")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--soft)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 20
  })))));
}
function JobbVarer({
  go
}) {
  return /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, M_ITEMS.map(v => /*#__PURE__*/React.createElement(ListRow, {
    key: v.id,
    title: v.name,
    meta: v.code,
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: v.status[0]
    }, v.status[1]),
    chevron: true,
    onClick: () => go('avvik', v.id)
  })));
}
function JobbDok() {
  return /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, [['Tegning kjøkken v3', 'PDF · 2 sider'], ['Monteringsanvisning skuffer', 'PDF · 8 sider'], ['Ordrebekreftelse fabrikk', 'PDF · 4 sider'], ['Kontrollmål', 'Notat · 6. okt']].map(([t, m]) => /*#__PURE__*/React.createElement(ListRow, {
    key: t,
    lead: /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 22
    }),
    title: t,
    meta: m,
    chevron: true
  })));
}
function JobbBilder() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8
    }
  }, ['Før', 'Vanntak', 'Dag 1', 'Dag 1', 'Dag 2'].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: '1',
      borderRadius: 10,
      background: i % 2 ? 'var(--beige-2)' : 'var(--beige-1)',
      display: 'grid',
      placeItems: 'end start',
      padding: 8,
      fontSize: '.75rem',
      color: 'var(--warm-black)',
      boxSizing: 'border-box'
    }
  }, t)), /*#__PURE__*/React.createElement("button", {
    style: {
      aspectRatio: '1',
      borderRadius: 10,
      border: '1.5px dashed var(--soft)',
      background: 'transparent',
      color: 'var(--muted)',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 26
  }))));
}
function Jobb({
  ks,
  go,
  tab,
  setTab,
  notice
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Pill, {
    tone: "info"
  }, "P\xE5g\xE5r"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, "Kj\xF8kken Nordmann")), notice && /*#__PURE__*/React.createElement(Alert, {
    tone: "ok",
    title: "Avvik sendt."
  }, "Butikken har f\xE5tt beskjed og bestiller ny vare."), /*#__PURE__*/React.createElement(SegmentedTabs, {
    block: true,
    items: ['Info', 'Varer', 'Dokumenter', 'Bilder'],
    value: tab,
    onChange: setTab
  }), tab === 'Info' && /*#__PURE__*/React.createElement(JobbInfo, {
    ks: ks,
    go: go
  }), tab === 'Varer' && /*#__PURE__*/React.createElement(JobbVarer, {
    go: go
  }), tab === 'Dokumenter' && /*#__PURE__*/React.createElement(JobbDok, null), tab === 'Bilder' && /*#__PURE__*/React.createElement(JobbBilder, null));
}
Object.assign(window, {
  SubHeader,
  Jobb,
  Progress
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/montorapp/jobb.jsx", error: String((e && e.message) || e) }); }

// ui_kits/montorapp/skjema.jsx
try { (() => {
function KS({
  ks,
  setKs
}) {
  const n = Object.values(ks).filter(Boolean).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '2.2rem',
      lineHeight: 1.08
    }
  }, "KS Kj\xF8kken"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, n, " av ", M_KS.length, " punkter"), /*#__PURE__*/React.createElement(Progress, {
    v: n,
    max: M_KS.length
  })), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, M_KS.map((p, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: p,
    checkable: true,
    checked: !!ks[i],
    onCheck: v => setKs({
      ...ks,
      [i]: v
    }),
    onClick: () => setKs({
      ...ks,
      [i]: !ks[i]
    }),
    title: p
  }))));
}
function Avvik({
  itemId,
  state,
  set
}) {
  const item = M_ITEMS.find(v => v.id === itemId) || M_ITEMS[0];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '2.4rem',
      lineHeight: 1.08
    }
  }, "Avvik p\xE5 varen"), /*#__PURE__*/React.createElement(Card, {
    tone: "soft",
    style: {
      display: 'grid',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 'var(--w-strong)',
      fontSize: '1.1rem'
    }
  }, item.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, item.code)), /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "Hva har skjedd?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, M_REASONS.map((r, i) => {
    const on = state.reason === r;
    return /*#__PURE__*/React.createElement("button", {
      key: r,
      onClick: () => set({
        reason: r
      }),
      style: {
        gridColumn: i === 4 ? '1 / -1' : 'auto',
        textAlign: 'left',
        minHeight: 56,
        padding: '10px 16px',
        borderRadius: 14,
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line)'),
        background: on ? 'var(--accent-soft)' : 'var(--surface)',
        color: on ? 'var(--accent)' : 'var(--ink)',
        font: 'var(--w-body) 1rem/1.3 var(--f-body)',
        cursor: 'pointer',
        boxShadow: on ? 'inset 0 0 0 1px var(--accent)' : 'none'
      }
    }, r);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 'var(--w-strong)'
    }
  }, "Antall", /*#__PURE__*/React.createElement(Stepper, {
    label: "Antall",
    value: state.n,
    min: 1,
    onChange: n => set({
      n
    })
  })), /*#__PURE__*/React.createElement(Switch, {
    label: "Trengs ny vare?",
    checked: state.ny,
    onChange: ny => set({
      ny
    })
  }), /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "Bilde"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, state.photo && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 88,
      height: 88,
      borderRadius: 12,
      background: 'var(--beige-1)',
      display: 'grid',
      placeItems: 'end start',
      padding: 8,
      boxSizing: 'border-box',
      fontSize: '.75rem',
      color: 'var(--warm-black)'
    }
  }, "IMG_0412"), /*#__PURE__*/React.createElement("button", {
    onClick: () => set({
      photo: true
    }),
    "aria-label": "Ta bilde",
    style: {
      width: 88,
      height: 88,
      borderRadius: 12,
      border: '1.5px dashed var(--beige-1)',
      background: 'transparent',
      color: 'var(--muted)',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 26
  }))), /*#__PURE__*/React.createElement(Field, {
    as: "textarea",
    label: "Kommentar (valgfritt)",
    placeholder: "Hva skjedde, og hvor p\xE5 varen?",
    rows: 3
  }));
}
function Ferdig({
  ks,
  signed,
  setSigned,
  done
}) {
  const n = Object.values(ks).filter(Boolean).length;
  if (done) return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16,
      paddingTop: 40
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ok)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 48
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '2.5rem',
      lineHeight: 1.08
    }
  }, "Ferdig montert."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Kari f\xE5r kopi i kundeportalen. Butikken kan sende sluttfaktura."));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '2.4rem',
      lineHeight: 1.08
    }
  }, "Ferdig montert"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "G\xE5 gjennom kj\xF8kkenet med Kari f\xF8r hun signerer."), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ListRow, {
    title: "KS Kj\xF8kken",
    meta: n + ' av ' + M_KS.length + ' punkter',
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: n === M_KS.length ? 'ok' : 'warn'
    }, n === M_KS.length ? 'Komplett' : 'Ikke komplett')
  }), /*#__PURE__*/React.createElement(ListRow, {
    title: "Restpunkter",
    meta: "Silikon ved vask",
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: "warn"
    }, "1 \xE5pent")
  }), /*#__PURE__*/React.createElement(ListRow, {
    title: "Avvik",
    meta: "Kj\xF8leskap kommer uke 46",
    trail: /*#__PURE__*/React.createElement(Pill, {
      tone: "info"
    }, "Meldt")
  })), /*#__PURE__*/React.createElement("p", {
    className: "h-section-label"
  }, "Kundens signatur"), /*#__PURE__*/React.createElement(SignaturePad, {
    onChange: setSigned
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Navn",
    defaultValue: "Kari Nordmann"
  }));
}
Object.assign(window, {
  KS,
  Avvik,
  Ferdig
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/montorapp/skjema.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nettside/app.jsx
try { (() => {
function App() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('hengsel-site-theme') || 'light');
  React.useEffect(() => {
    localStorage.setItem('hengsel-site-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement(SiteHeader, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Hvorfor, null), /*#__PURE__*/React.createElement(Losningen, null), /*#__PURE__*/React.createElement(Prinsipper, null), /*#__PURE__*/React.createElement(KomIGang, null), /*#__PURE__*/React.createElement(Sporsmal, null), /*#__PURE__*/React.createElement(Kontakt, null), /*#__PURE__*/React.createElement(SiteFooter, null), /*#__PURE__*/React.createElement("div", {
    className: "demo-ctl"
  }, /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: [{
      id: 'light',
      label: 'Lys'
    }, {
      id: 'dark',
      label: 'Mørk'
    }],
    value: theme,
    onChange: setTheme
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nettside/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nettside/sections.jsx
try { (() => {
Object.assign(window, window.HengselDesignSystem_5a9d09);
const wrap = {
  maxWidth: 'var(--wrap)',
  margin: '0 auto',
  padding: '0 clamp(16px,4vw,40px)'
};
function SiteHeader() {
  const links = [['#hvorfor', 'Hvorfor'], ['#reisen', 'Kundereisen'], ['#losningen', 'Se løsningen'], ['#hengsel', 'Montørappen'], ['#integrasjoner', 'Integrasjoner'], ['#sporsmal', 'Spørsmål']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      height: 72
    }
  }, /*#__PURE__*/React.createElement(Brand, {
    size: 28,
    href: "#hjem"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 22,
      marginLeft: 'auto',
      fontSize: '.95rem'
    }
  }, links.map(([h, l]) => /*#__PURE__*/React.createElement("a", {
    key: h,
    href: h,
    style: {
      color: 'var(--ink)'
    }
  }, l))), /*#__PURE__*/React.createElement(Button, {
    href: "#kontakt"
  }, "Be om demo")));
}
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, children);
}
function Hero() {
  const [dev, setDev] = React.useState('PC');
  const img = {
    PC: 'min-dag.webp',
    iPad: 'ipad-min-dag.webp',
    Telefon: 'kundeportalen.webp',
    Montør: 'hengsel-i-dag-a.webp'
  }[dev];
  return /*#__PURE__*/React.createElement("section", {
    id: "hjem",
    style: {
      ...wrap,
      padding: '88px clamp(16px,4vw,40px) 64px',
      display: 'grid',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "For kj\xF8kken- og interi\xF8rbutikker"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--t-hero)',
      lineHeight: 1.02,
      maxWidth: '16ch'
    }
  }, "Fra f\xF8rste henvendelse til ferdig montert kj\xF8kken."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Hengsel er butikkens system for salg, tilbud, bestilling, montasje og kundeportal, med egen app for mont\xF8rene. Alt havner p\xE5 samme ordre og samme kundekort, s\xE5 ingen m\xE5 sp\xF8rre hverandre om hvor ting st\xE5r."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "#kontakt"
  }, "Book en gjennomgang"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "#losningen"
  }, "Se skjermbildene")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      flexWrap: 'wrap',
      color: 'var(--muted)',
      fontSize: '.92rem'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Bygget i en kj\xF8kkenbutikk med tre avdelinger"), /*#__PURE__*/React.createElement("span", null, "PC, iPad og telefon"), /*#__PURE__*/React.createElement("span", null, "Tegninger fra CET leses rett inn")), /*#__PURE__*/React.createElement("div", {
    className: "app",
    style: {
      marginTop: 24,
      borderRadius: 'var(--r-lg)',
      padding: '24px 24px 0',
      display: 'grid',
      gap: 20,
      justifyItems: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SegmentedTabs, {
    items: ['PC', 'iPad', 'Telefon', 'Montør'],
    value: dev,
    onChange: setDev
  }), /*#__PURE__*/React.createElement("img", {
    src: '../../assets/referanser/' + img,
    alt: 'Skjermbilde ' + dev,
    style: {
      display: 'block',
      width: dev === 'Montør' ? 320 : '100%',
      maxHeight: 640,
      objectFit: 'cover',
      objectPosition: 'top',
      borderRadius: '14px 14px 0 0',
      boxShadow: 'var(--shadow)'
    }
  })));
}
function Hvorfor() {
  const items = [['OB sammenlignes linje for linje', 'Ordrebekreftelsen kobles til ordren og sammenlignes med bestillingen. Avvik havner øverst med knappene Godta OB og Be om ny OB.'], ['Kalkylen bygges fra tegningen', 'Linjene fra CET grupperes til kalkylerader med regler. Faktorenheter, reelle timer, pris til montør og pris til kunde står side om side, med dekningsgrad.'], ['Kunden ser reisen selv', 'Kundeportalen viser tilbudet, tilvalgene, tegningen og hvor ordren står. Meldinger går rett til selgeren og havner på kundekortet.'], ['Typeskiltet leses ved montering', 'Montøren tar bilde av typeskiltet før varen bygges inn. Modell, produktnummer og serienummer ligger klart når kunden trenger service.']];
  return /*#__PURE__*/React.createElement("section", {
    id: "hvorfor",
    className: "app",
    style: {
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'grid',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Hvorfor"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 1.08,
      maxWidth: '22ch'
    }
  }, "Et kj\xF8kken g\xE5r gjennom mange hender. Informasjonen skal ikke falle mellom dem."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Selgeren, bestilleren, montasjelederen, mont\xF8ren og kunden trenger det samme kj\xF8kkenet beskrevet likt. N\xE5r det ligger i e-post, regneark, lapper og hver sin app, blir det feil som koster tid og margin.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
      gap: 16
    }
  }, items.map(([t, d]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    style: {
      display: 'grid',
      gap: 10,
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement(Pill, {
    tone: "info"
  }, "Med Hengsel"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--t-h3)'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, d))))));
}
function Losningen() {
  const cols = [['For butikken', 'Hengsel for butikken', ['Salg, tilbud og ordre', 'Bestilling til leverandør og OB-kontroll', 'Montasjeplan, kalkyle og etterkalkyle', 'Saker, prosjekter og resultater'], 'PC, iPad og telefon'], ['For montørene', 'Hengsel for montøren', ['Dagens jobber og hva som mangler', 'Varer, dokumenter og tegning', 'KS med hvitevarer og typeskilt', 'Restpunkter og Ferdig montert'], 'Telefon først, iPad på kontoret'], ['For kunden', 'Kundeportalen', ['Tilbudet med bilde og pris', 'Tilvalg med prisen som endrer seg', 'Signering og godkjenning', 'Reisen til kjøkkenet er montert'], 'Telefon og PC, uten app']];
  return /*#__PURE__*/React.createElement("section", {
    id: "losningen",
    style: {
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'grid',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "L\xF8sningen"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 1.08
    }
  }, "Tre flater, \xE9n database."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Det mont\xF8ren registrerer, st\xE5r rett p\xE5 ordren. Det kunden velger i portalen, st\xE5r rett p\xE5 tilbudet. Ingen dobbel f\xF8ring.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
      gap: 16
    }
  }, cols.map(([e, t, l, f]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    style: {
      display: 'grid',
      gap: 14,
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, e), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--t-h3)'
    }
  }, t), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 8
    }
  }, l.map(x => /*#__PURE__*/React.createElement("li", {
    key: x,
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18
  })), x))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      fontSize: 'var(--t-small)',
      borderTop: '1px solid var(--line)',
      paddingTop: 12
    }
  }, f))))));
}
function Prinsipper() {
  const p = [['Én arbeidsliste', 'Det som må gjøres, står i én liste sortert etter når det må skje. Faner og tall blir filtre i lista.'], ['Handling der du står', 'Valgt rad åpnes i et panel til høyre. Svar, ring, godkjenn eller send uten å bytte side.'], ['Kort meny per rolle', 'Hver rolle ser det den bruker daglig. Resten ligger under «Mer», og moduler kan slås av.'], ['Data én gang', 'Tegningsfila, ordrebekreftelsen og typeskiltet leses inn én gang og brukes videre i kalkyle, bestilling og garanti.']];
  return /*#__PURE__*/React.createElement("section", {
    className: "app",
    style: {
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'grid',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Prinsippene"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 1.08
    }
  }, "Fire grep som g\xE5r igjen p\xE5 alle skjermene.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
      gap: 32
    }
  }, p.map(([t, d], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'grid',
      gap: 10,
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat",
    style: {
      color: 'var(--accent)'
    }
  }, i + 1), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--t-h3)'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, d))))));
}
function KomIGang() {
  const steps = [['Legg inn første kunde', 'Salgstavla'], ['Lag et tilbud', 'Fra CET'], ['Koble kundeportalen', 'Kunden'], ['Legg inn prisliste', 'Prisvarsler'], ['Last opp plantegning', 'Prosjekt']];
  const [d, setD] = React.useState({});
  const n = Object.values(d).filter(Boolean).length;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
      gap: 48,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Kom i gang"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 1.08
    }
  }, "Fem steg f\xF8r systemet gj\xF8r jobben sin."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Dette er den samme lista hver ny bruker ser p\xE5 Min dag. Vi g\xE5r gjennom stegene sammen med dere, med deres egne kunder og prislister.")), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 18px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat",
    style: {
      fontSize: '1.6rem'
    }
  }, n, " av 5")), steps.map(([t, m], i) => /*#__PURE__*/React.createElement(ListRow, {
    key: t,
    checkable: true,
    checked: !!d[i],
    onCheck: v => setD({
      ...d,
      [i]: v
    }),
    onClick: () => setD({
      ...d,
      [i]: !d[i]
    }),
    title: t,
    trail: /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)',
        fontSize: '.9rem'
      }
    }, m)
  })))));
}
function Sporsmal() {
  const q = [['Hvem passer løsningen for?', 'Kjøkken- og interiørbutikker som selger, bestiller og monterer selv eller med montørfirma. Den er bygget for butikker med flere selgere, en eller flere avdelinger og prosjektsalg til entreprenører.'], ['Hvem ser hva?', 'Hver bruker har en rolle, og tilgangen styres i databasen, ikke bare i menyen. Montørfirma ser bare egne jobber, og kunden ser bare sitt eget kjøkken i kundeportalen.'], ['Hvor lagres dataene?', 'I EU. Databasen ligger i Stockholm, og vi inngår databehandleravtale med hver butikk. Dere eier dataene deres og kan få dem ut når dere vil.'], ['Må kunden laste ned noe?', 'Nei. Kundeportalen åpnes fra en lenke på telefon eller PC. Kunden ser tilbudet, velger tilvalg, signerer og følger reisen til kjøkkenet er montert.'], ['Kan vi skru av det vi ikke bruker?', 'Ja. Leder og admin bestemmer hva hver rolle ser, med én bryter per modul og rolle. Det som er av, forsvinner fra menyen. Unntak kan settes per bruker.']];
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement("section", {
    id: "sporsmal",
    className: "app",
    style: {
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'grid',
      gap: 32,
      maxWidth: 860
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Sp\xF8rsm\xE5l"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 1.08
    }
  }, "Det folk lurer p\xE5.")), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      overflow: 'hidden'
    }
  }, q.map(([t, a], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      borderBottom: i < q.length - 1 ? '1px solid var(--line)' : 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(open === i ? -1 : i),
    "aria-expanded": open === i,
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      gap: 12,
      padding: '18px 22px',
      border: 0,
      background: 'transparent',
      color: 'var(--ink)',
      font: 'var(--w-strong) 1.05rem var(--f-body)',
      textAlign: 'left',
      cursor: 'pointer',
      minHeight: 44
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, t), /*#__PURE__*/React.createElement(Icon, {
    name: open === i ? 'minus' : 'plus',
    size: 20
  })), open === i && /*#__PURE__*/React.createElement("p", {
    style: {
      padding: '0 22px 20px',
      color: 'var(--muted)',
      maxWidth: '62ch'
    }
  }, a))))));
}
function Kontakt() {
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    id: "kontakt",
    style: {
      padding: '96px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
      gap: 48,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Kontakt"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 1.08
    }
  }, "Se den med deres egne kj\xF8kken."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Vi viser l\xF8sningen p\xE5 en ordre som ligner deres, fra lead til etterkalkyle. Det tar rundt en time, p\xE5 Teams eller i butikken."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)'
    }
  }, "Eller send en e-post: ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:drift@sngroup.no"
  }, "drift@sngroup.no"))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 14,
      padding: '28px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Navn",
    placeholder: "Kari Nordmann"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Butikk eller firma",
    placeholder: "Kj\xF8kkenstudio Hamar"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "E-post",
    type: "email"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Telefon",
    type: "tel"
  })), /*#__PURE__*/React.createElement(Field, {
    as: "select",
    label: "Antall selgere",
    options: ['1–3', '4–10', '11–25', 'Flere enn 25']
  }), /*#__PURE__*/React.createElement(Field, {
    as: "textarea",
    label: "Noe vi b\xF8r vite?",
    rows: 3
  }), sent ? /*#__PURE__*/React.createElement(Alert, {
    tone: "ok",
    title: "Takk."
  }, "E-posten er klar i e-postprogrammet ditt.") : /*#__PURE__*/React.createElement(Button, {
    onClick: () => setSent(true)
  }, "Be om demo"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--soft)',
      fontSize: '.85rem'
    }
  }, "Skjemaet \xE5pner en ferdig utfylt e-post i e-postprogrammet ditt. Ingenting lagres p\xE5 nettsiden."))));
}
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--line)',
      padding: '28px 0 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 16,
      alignItems: 'center',
      color: 'var(--muted)',
      fontSize: '.9rem'
    }
  }, /*#__PURE__*/React.createElement(Brand, {
    size: 22
  }), /*#__PURE__*/React.createElement("span", null, "Skjermbildene viser demodata. Navn og tall er ikke ekte."), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Personvern"), /*#__PURE__*/React.createElement("a", {
    href: "#hjem"
  }, "Til toppen"))));
}
Object.assign(window, {
  SiteHeader,
  Hero,
  Hvorfor,
  Losningen,
  Prinsipper,
  KomIGang,
  Sporsmal,
  Kontakt,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nettside/sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Brand = __ds_scope.Brand;

__ds_ns.CustomerLogo = __ds_scope.CustomerLogo;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.PhoneFrame = __ds_scope.PhoneFrame;

__ds_ns.TabletFrame = __ds_scope.TabletFrame;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.SegmentedTabs = __ds_scope.SegmentedTabs;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.Topbar = __ds_scope.Topbar;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Pill = __ds_scope.Pill;

})();
