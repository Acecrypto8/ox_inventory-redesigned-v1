import React, { useState, useEffect } from 'react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import { RgbaColorPicker } from 'react-colorful';

interface Props {
  infoVisible: boolean;
  setInfoVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const VAR_DEFINITIONS = [
  { label: 'Main Color', var: '--mainColor', type: 'color', default: 'rgba(19, 87, 77, 0.48)' },
  { label: 'Secondary Color', var: '--secondaryColor', type: 'color', default: 'rgba(82, 255, 231, 0.28)' },
  { label: 'Tertiary Color', var: '--tertiaryColor', type: 'color', default: 'rgba(19, 87, 77, 0.94)' },
  { label: 'Text Color', var: '--textColor', type: 'color', default: 'rgba(255,255, 255, 0.84)' },
  { label: 'Item Labels', var: '--ItemNamesHidden', type: 'toggle', default: 'visible' },
  { label: 'Item Weight', var: '--SlotWeight', type: 'toggle', default: 'visible' },
];

function parseColor(input: string | undefined) {
  if (typeof input !== 'string') return { r: 0, g: 0, b: 0, a: 1 };

  if (input.startsWith('rgba')) {
    const parts = input.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (parts) {
      return {
        r: Number(parts[1]),
        g: Number(parts[2]),
        b: Number(parts[3]),
        a: Number(parts[4]),
      };
    }
  } else if (input.startsWith('#')) {
    const r = parseInt(input.slice(1, 3), 16);
    const g = parseInt(input.slice(3, 5), 16);
    const b = parseInt(input.slice(5, 7), 16);
    return { r, g, b, a: 1 };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}


function rgbaToCss({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
  if (a === 1) {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase();
    return `#${hex}`;
  }
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

const AceUiControls: React.FC<Props> = ({ infoVisible, setInfoVisible }) => {
  const { refs, context } = useFloating({ open: infoVisible, onOpenChange: setInfoVisible });
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const { isMounted, styles } = useTransitionStyles(context);
  const { getFloatingProps } = useInteractions([dismiss]);

const [vars, setVars] = useState<Record<string, string>>(() => {
  try {
    const saved = localStorage.getItem('inventoryUiSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse saved UI settings:', e);
  }

  const obj: Record<string, string> = {};
  VAR_DEFINITIONS.forEach((v) => {
    obj[v.var] = v.default;
  });
  return obj;
});


useEffect(() => {
  Object.entries(vars).forEach(([key, val]) => {
    document.documentElement.style.setProperty(key, val);
  });

  localStorage.setItem('inventoryUiSettings', JSON.stringify(vars));
}, [vars]);


  const handleChange = (variable: string, value: string) => {
    setVars((prev) => ({ ...prev, [variable]: value }));
  };

  const onReset = () => {
    const resetVars: Record<string, string> = {};
    VAR_DEFINITIONS.forEach((v) => {
      resetVars[v.var] = v.default;
    });
    setVars(resetVars);
  };

  return isMounted ? (
    <FloatingPortal>
      <FloatingOverlay lockScroll className="useful-controls-dialog-overlay" data-open={infoVisible} style={styles}>
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            className="useful-controls-dialog"
            style={{
              ...styles,
              padding: '24px 20px',
              borderRadius: 16,
              color: '#eee',
              width: '100%',
              maxWidth: 460,
              maxHeight: '85vh',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontSize: 15,
              userSelect: 'none',
              overflow: 'hidden',
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22, letterSpacing: '0.03em' }}>Edit UI Theme - Made By AceCrypto</h2>
              <button
                onClick={() => setInfoVisible(false)}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  fontSize: 26,
                  cursor: 'pointer',
                  lineHeight: 1,
                  transition: 'color 0.2s ease',
                  padding: '4px 8px',
                  borderRadius: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ccc')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888')}
              >
                &times;
              </button>
            </header>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                paddingRight: 8,
              }}
            >
              {VAR_DEFINITIONS.map((def) => (
                <div key={def.var}>
                  <label
                    htmlFor={def.var}
                    style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#ccc', fontSize: 16 }}
                  >
                    {def.label}
                  </label>

                  {def.type === 'color' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <RgbaColorPicker
                        color={parseColor(vars[def.var])}
                        onChange={(color) => handleChange(def.var, rgbaToCss(color))}
                        style={{ flexShrink: 0, width: 140, height: 140, borderRadius: 12 }}
                      />
                      <input
                        id={def.var}
                        type="text"
                        value={vars[def.var]}
                        onChange={(e) => handleChange(def.var, e.target.value)}
                        style={{
                          flex: '1 1 150px',
                          minWidth: 120,
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #444',
                          backgroundColor: '#1f1f2e',
                          color: '#eee',
                          fontSize: 15,
                          fontFamily: 'monospace',
                          userSelect: 'text',
                          boxShadow: 'inset 0 0 6px #000',
                          transition: 'border-color 0.3s ease',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#4a90e2')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#444')}
                      />
                    </div>
                  )}

                  {(def.type === 'font' || def.type === 'toggle') && (
                    <select
                      id={def.var}
                      value={vars[def.var]}
                      onChange={(e) => handleChange(def.var, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #444',
                        backgroundColor: '#1f1f2e',
                        color: '#eee',
                        fontSize: 15,
                        fontFamily: 'Segoe UI, sans-serif',
                        cursor: 'pointer',
                        transition: 'border-color 0.3s ease',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#4a90e2')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#444')}
                    >
                      {def.type === 'font' ? (
                        <>
                          <option value="Roboto">Roboto</option>
                          <option value="Anton">Anton</option>
                          <option value="Arial">Arial</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Tahoma">Tahoma</option>
                        </>
                      ) : (
                        <>
                          <option value="hidden">Hidden</option>
                          <option value="visible">Visible</option>
                        </>
                      )}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
              <button
                onClick={onReset}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: '1.5px solid #555',
                  backgroundColor: '#33354d',
                  color: '#aaa',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.25s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#44465e')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#33354d')}
              >
                Reset
              </button>
              <button
                onClick={() => setInfoVisible(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: '#4a90e2',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgb(74 144 226 / 0.5)',
                  transition: 'background-color 0.25s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3a78c2')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4a90e2')}
              >
                Close
              </button>
            </footer>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  ) : null;
};

export default AceUiControls;
