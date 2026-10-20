import {useNavigate} from 'react-router-dom'

/**
 * «← Назад»: крок назад в історії SPA, а якщо людина зайшла прямо за посиланням
 * (історії в межах сайту немає, history.state.idx === 0) — на головну.
 */
export default function BackLink({className = ''}: { className?: string }) {
    const navigate = useNavigate()

    function goBack() {
        const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
        if (idx > 0) navigate(-1)
        else navigate('/')
    }

    return (
        <div className={`back-row ${className}`.trim()}>
            <button type="button" className="back-link" onClick={goBack}>← Назад</button>
        </div>
    )
}
