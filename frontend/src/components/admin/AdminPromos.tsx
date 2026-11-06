import { useEffect, useState, type FormEvent } from 'react'
import { adminApi, type Promo } from '../../lib/api'

const emptyForm = {
  code: '',
  name: '',
  type: 'Discount' as Promo['type'],
  discountPercent: '20',
  grantRole: 'Premium' as 'Premium' | 'Vip',
  grantDays: '30',
  maxRedemptions: '',
  expiresOn: '',
}

function describeAction(p: Promo): string {
  if (p.type === 'Discount') return `Знижка ${p.discountPercent}%`
  const role = p.grantRole === 'Vip' ? 'VIP' : 'Premium'
  return p.grantDays ? `${role} на ${p.grantDays} дн.` : `${role} назавжди`
}

function describeState(p: Promo): string {
  if (!p.isActive) return 'вимкнено'
  if (p.expiresAt && new Date(p.expiresAt) <= new Date()) return 'термін минув'
  if (p.maxRedemptions !== null && p.redemptionsCount >= p.maxRedemptions) return 'активації вичерпано'
  return 'діє'
}

/** Промокоди: створення, увімкнення/вимкнення, видалення ще не використаних. */
export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const fail = (e: unknown) => setStatus({ kind: 'err', text: (e as Error).message })

  useEffect(() => {
    adminApi.promos().then(setPromos).catch(fail)
  }, [])

  async function create(e: FormEvent) {
    e.preventDefault()
    setStatus(null)
    setSaving(true)
    try {
      const isDiscount = form.type === 'Discount'
      const created = await adminApi.createPromo({
        code: form.code,
        name: form.name,
        type: form.type,
        discountPercent: isDiscount ? Number(form.discountPercent) : null,
        grantRole: isDiscount ? null : form.grantRole,
        grantDays: isDiscount || !form.grantDays ? null : Number(form.grantDays),
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        // Код діє до кінця обраного дня за місцевим часом.
        expiresAt: form.expiresOn ? new Date(`${form.expiresOn}T23:59:59`).toISOString() : null,
      })
      setPromos(prev => [created, ...prev])
      setForm(emptyForm)
      setStatus({ kind: 'ok', text: `Код ${created.code} створено` })
    } catch (err) {
      fail(err)
    } finally {
      setSaving(false)
    }
  }

  async function toggle(p: Promo) {
    try {
      await adminApi.setPromoActive(p.id, !p.isActive)
      setPromos(prev => prev.map(x => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)))
    } catch (err) {
      fail(err)
    }
  }

  async function remove(p: Promo) {
    try {
      await adminApi.deletePromo(p.id)
      setPromos(prev => prev.filter(x => x.id !== p.id))
    } catch (err) {
      fail(err)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Промо<span className="accent">коди</span></h1>
          <div className="sub">Знижки та подарункові підписки</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <h2>Новий код</h2>
          <div className="panel-sub">Людина вводить його на сторінці «Пакети»</div>

          <form onSubmit={create}>
            <div className="row-2">
              <div className="field">
                <label htmlFor="promo-code">Код</label>
                <input
                  id="promo-code"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="LUNA20"
                  maxLength={32}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="promo-name">Назва <span className="hint">бачите лише ви</span></label>
                <input
                  id="promo-name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Розіграш у TikTok"
                  maxLength={80}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Дія</label>
              <div className="ud-row">
                <button type="button" className={`ud-chip ${form.type === 'Discount' ? 'on' : ''}`}
                        onClick={() => setForm({ ...form, type: 'Discount' })}>Знижка</button>
                <button type="button" className={`ud-chip ${form.type === 'Subscription' ? 'on' : ''}`}
                        onClick={() => setForm({ ...form, type: 'Subscription' })}>Підписка</button>
              </div>
            </div>

            {form.type === 'Discount' ? (
              <div className="field">
                <label htmlFor="promo-percent">Знижка, %</label>
                <input
                  id="promo-percent"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountPercent}
                  onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                  required
                />
                <div className="panel-sub promo-hint">
                  Людина бачить знижені ціни, а ви — знижку в її профілі. Онлайн-оплати ще немає, тож
                  врахуйте знижку, коли домовлятиметесь про тариф.
                </div>
              </div>
            ) : (
              <div className="row-2">
                <div className="field">
                  <label htmlFor="promo-role">Тариф</label>
                  <select
                    id="promo-role"
                    value={form.grantRole}
                    onChange={e => setForm({ ...form, grantRole: e.target.value as 'Premium' | 'Vip' })}
                  >
                    <option value="Premium">Premium</option>
                    <option value="Vip">VIP</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="promo-days">Днів <span className="hint">порожньо — назавжди</span></label>
                  <input
                    id="promo-days"
                    type="number"
                    min={1}
                    max={3650}
                    value={form.grantDays}
                    onChange={e => setForm({ ...form, grantDays: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="row-2">
              <div className="field">
                <label htmlFor="promo-max">Активацій <span className="hint">порожньо — без ліміту</span></label>
                <input
                  id="promo-max"
                  type="number"
                  min={1}
                  value={form.maxRedemptions}
                  onChange={e => setForm({ ...form, maxRedemptions: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="promo-until">Діє до <span className="hint">порожньо — безстроково</span></label>
                <input
                  id="promo-until"
                  type="date"
                  value={form.expiresOn}
                  onChange={e => setForm({ ...form, expiresOn: e.target.value })}
                />
              </div>
            </div>

            <div className="panel-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Зачекайте…' : 'Створити код →'}
              </button>
              {status && <span className={`admin-status ${status.kind}`}>{status.text}</span>}
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>
            Усі коди{' '}
            <span style={{ color: 'var(--gold-soft)', fontStyle: 'italic' }}>({promos.length})</span>
          </h2>
          <div className="panel-sub">Використаний код можна лише вимкнути</div>

          <div className="card-list">
            {promos.length === 0 ? (
              <div className="empty-state">
                <div className="glyph">✦</div>
                <div className="t">Кодів ще немає</div>
                <div className="s">Створіть перший у формі поруч.</div>
              </div>
            ) : promos.map(p => (
              <div key={p.id} className={`promo-row ${describeState(p) === 'діє' ? '' : 'off'}`}>
                <div className="promo-row-main">
                  <div className="promo-row-code">{p.code}</div>
                  <div className="promo-row-name">{p.name}</div>
                  <div className="promo-row-meta">
                    {describeAction(p)} · активацій {p.redemptionsCount}{p.maxRedemptions !== null && ` / ${p.maxRedemptions}`}
                    {p.expiresAt && ` · до ${new Date(p.expiresAt).toLocaleDateString('uk-UA')}`} · {describeState(p)}
                  </div>
                </div>
                <div className="cr-actions">
                  <button type="button" className="ud-chip" onClick={() => toggle(p)}>
                    {p.isActive ? 'Вимкнути' : 'Увімкнути'}
                  </button>
                  {p.redemptionsCount === 0 && (
                    <button type="button" className="cr-btn del" title="Видалити" aria-label={`Видалити ${p.code}`} onClick={() => remove(p)}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
