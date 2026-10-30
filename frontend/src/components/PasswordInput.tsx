import {useState, type InputHTMLAttributes} from 'react'

/**
 * Поле пароля з кнопкою «показати / сховати». Приймає ті самі пропси, що й <input>,
 * крім type — його перемикає кнопка-око.
 */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="password-input">
            <input {...props} type={visible ? 'text' : 'password'}/>
            <button
                type="button"
                className="password-toggle"
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
                aria-pressed={visible}
                title={visible ? 'Сховати пароль' : 'Показати пароль'}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                    {visible && <path d="M3 3l18 18"/>}
                </svg>
            </button>
        </div>
    )
}
