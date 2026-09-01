// RSC — Seguridad / Smart security section
// 1:1 port from sections2.jsx#Seguridad

import SplitHeading from '@/shared/ui/atoms/split-heading';
import Icon from '@/shared/ui/organisms/icon';
import SecurityVisual from '@/shared/ui/organisms/security-visual';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';

interface Props {
  dict: Pick<Dictionary, 'seguridad'>;
}

const ICON_NAMES = ['camera', 'lock', 'monitor', 'bolt'] as const;

export default function Seguridad({ dict }: Props) {
  const { seguridad } = dict;
  return (
    <section id="seguridad" className="seguridad theme-light" data-screen-label="07 Seguridad">
      <div className="container">
        <div className="seguridad-grid">
          <div className="seguridad-visual reveal">
            <SecurityVisual />
          </div>
          <div className="seguridad-text">
            <div className="eyebrow reveal">{seguridad.eyebrow}</div>
            <SplitHeading as="h2" className="display reveal" data-delay="1">
              {seguridad.title}
            </SplitHeading>
            <p className="lead reveal" data-delay="2">
              {seguridad.lead}
            </p>
            <div className="seg-features reveal" data-delay="3">
              {seguridad.features.map((f, i) => (
                <div className="seg-feat" key={i}>
                  <div className="seg-feat-icon">
                    <Icon name={ICON_NAMES[i % ICON_NAMES.length]} size={22} />
                  </div>
                  <div>
                    <div className="seg-feat-title">{f.t}</div>
                    <div className="seg-feat-desc">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
