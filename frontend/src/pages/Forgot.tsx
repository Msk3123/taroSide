import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { TIKTOK_URL } from '../lib/links'

/**
 * Forgot — відновлення пароля.
 *
 * Бекенд email-флоу (токен + лист) ще не реалізовано: IEmailSender зареєстрований, але
 * ендпоінта POST /api/auth/forgot-password немає. Тому замість фальшивого «лист надіслано»
 * чесно пояснюємо, як відновити доступ зараз. Коли endpoint з’явиться — повернути сюди форму.
 */
export default function Forgot() {
  return (
    <>
      <Nav />
      <main className="auth-main">
        <div className="auth-card fade-up d2">
          <div className="auth-pin tl" /><div className="auth-pin tr" />
          <div className="auth-pin bl" /><div className="auth-pin br" />

          <div className="auth-eyebrow">☾ Відновлення ключа</div>
          <h1>Забули <span className="accent">пароль?</span></h1>
          <p className="auth-sub">
            Автоматичне відновлення через пошту ще в розробці. Поки що допоможемо вручну:
            напишіть розробнику в TikTok — вкажіть ім’я акаунта та пошту, з якою реєструвались,
            і ми відновимо доступ.
          </p>

          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="btn btn-primary auth-submit">
            Написати в TikTok ↗
          </a>

          <div className="auth-aux">
            Згадали? <Link to="/login">Повернутися до входу</Link>
          </div>
        </div>
      </main>
    </>
  )
}
