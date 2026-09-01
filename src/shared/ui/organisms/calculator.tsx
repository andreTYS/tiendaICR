'use client';
import { useEffect, useMemo, useState } from 'react';
import SplitHeading from '@/shared/ui/atoms/split-heading';
import Icon from '@/shared/ui/organisms/icon';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';

interface Props {
  dict: Pick<Dictionary, 'calc'>;
}

const RATES = [0.55, 0.48, 0.42]; // soles/kWh by segment
const BILL_MAX = [2000, 20000, 200000];
const BILL_STEP = [10, 100, 1000];
const BILL_MIN = [150, 500, 5000];
const BILL_DEFAULT = [450, 4500, 45000];
const COST_PER_KWP = [4200, 3600, 3000];

export default function Calculator({ dict }: Props) {
  const { calc } = dict;
  const [bill, setBill] = useState(450);
  const [coverage, setCoverage] = useState(100);
  const [type, setType] = useState(0);

  // Reset bill when type changes (match design behaviour)
  useEffect(() => {
    setBill(BILL_DEFAULT[type]);
  }, [type]);

  const results = useMemo(() => {
    const rate = RATES[type];
    const monthlyKwh = bill / rate;
    const prodPerKwp = 150; // kWh/month per kWp in Arequipa
    const cov = coverage / 100;
    const sizeNeeded = (monthlyKwh * cov) / prodPerKwp;
    const generation = sizeNeeded * prodPerKwp;
    const monthlySavings = bill * cov * 0.92;
    const annualSavings = monthlySavings * 12;
    const invest = sizeNeeded * COST_PER_KWP[type];
    const payback = annualSavings > 0 ? invest / annualSavings : 0;
    const co2 = generation * 12 * 0.00055;

    return {
      size: sizeNeeded.toFixed(1),
      savings: Math.round(monthlySavings),
      annual: Math.round(annualSavings),
      invest: Math.round(invest),
      payback: payback.toFixed(1),
      co2: co2.toFixed(1),
    };
  }, [bill, coverage, type]);

  const ICON_NAMES = ['home', 'building', 'factory'] as const;

  return (
    <section id="calculadora" className="calc theme-light" data-screen-label="04 Calculadora">
      <div className="container">
        <div style={{ marginBottom: 60 }}>
          <div className="eyebrow reveal">{calc.eyebrow}</div>
          <SplitHeading
            as="h2"
            className="display reveal"
            data-delay="1"
            style={{ marginTop: 20, maxWidth: '18ch' }}
          >
            {calc.title}
          </SplitHeading>
          <p className="lead reveal" data-delay="2" style={{ marginTop: 20 }}>
            {calc.lead}
          </p>
        </div>

        <div className="calc-grid">
          {/* Controls */}
          <div className="calc-controls reveal">
            <h3>{calc.controlsTitle}</h3>
            <div className="calc-sub">{calc.controlsSub}</div>

            {/* Type selector */}
            <div className="calc-field">
              <div className="calc-label">
                <span>{calc.fields.type}</span>
              </div>
              <div className="calc-type">
                {calc.types.map((label, i) => (
                  <button
                    key={i}
                    className={`calc-type-btn ${type === i ? 'active' : ''}`}
                    onClick={() => setType(i)}
                    type="button"
                  >
                    <Icon name={ICON_NAMES[i]} size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill slider */}
            <div className="calc-field">
              <div className="calc-label">
                <span>{calc.fields.bill}</span>
                <span className="calc-value">S/ {bill.toLocaleString()}</span>
              </div>
              <input
                type="range"
                className="calc-slider"
                min={BILL_MIN[type]}
                max={BILL_MAX[type]}
                step={BILL_STEP[type]}
                value={bill}
                onChange={(e) => setBill(+e.target.value)}
              />
            </div>

            {/* Coverage slider */}
            <div className="calc-field">
              <div className="calc-label">
                <span>{calc.fields.coverage}</span>
                <span className="calc-value">{coverage}%</span>
              </div>
              <input
                type="range"
                className="calc-slider"
                min={30}
                max={100}
                step={5}
                value={coverage}
                onChange={(e) => setCoverage(+e.target.value)}
              />
              <div className="calc-hint">{calc.coverageHint}</div>
            </div>
          </div>

          {/* Results */}
          <div className="calc-results reveal" data-delay="2">
            <div className="calc-savings">
              <div className="calc-savings-label">{calc.savings}</div>
              <div className="calc-savings-amount">
                <span className="currency">S/</span>
                <span className="tabular">{results.savings.toLocaleString()}</span>
                <span className="period"> /mes</span>
              </div>
              <div className="calc-savings-annual">
                {calc.annual}:{' '}
                <strong>S/ {results.annual.toLocaleString()}</strong>
              </div>
            </div>
            <div className="calc-meta">
              <div className="calc-meta-item">
                <div className="calc-meta-label">{calc.meta.size}</div>
                <div className="calc-meta-value">{results.size} kWp</div>
              </div>
              <div className="calc-meta-item">
                <div className="calc-meta-label">{calc.meta.invest}</div>
                <div className="calc-meta-value">S/ {results.invest.toLocaleString()}</div>
              </div>
              <div className="calc-meta-item">
                <div className="calc-meta-label">{calc.meta.payback}</div>
                <div className="calc-meta-value">{results.payback} años</div>
              </div>
              <div className="calc-meta-item">
                <div className="calc-meta-label">{calc.meta.co2}</div>
                <div className="calc-meta-value">{results.co2} t</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
