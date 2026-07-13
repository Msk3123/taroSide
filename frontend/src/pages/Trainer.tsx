import {Link} from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Лендінг VIP-фічі «AI Mental Trainer» (ментальний аудит).
 * Статична маркетингова сторінка за дизайн-шаблоном trainer.html.
 * Логіки бекенду тут немає — CTA ведуть на робочі сторінки (чат / тарифи).
 * Інтерактивна сесія (trainer-session) — окремий наступний крок.
 */

/** Дозволяє писати CSS-кастом-властивість --w в inline-стилі без помилки типів. */
const bar = (w: string) => ({['--w']: w} as React.CSSProperties)

export default function Trainer() {
    return (
        <>
            <Nav/>

            <section className="t-hero">
                <div className="fade-up d1">
                    <div className="t-eyebrow">AI Mental Coach · Lunaris</div>
                    <h1>Не ворожіння.<br/><em>Ментальний</em> аудит.</h1>
                    <p className="t-lede">
                        Lunaris-Trainer — це AI-наставник, який вчить вас читати власні стани через
                        мову карт. Ви ставите питання, тлумачите першим, тренер дзеркалить вашу
                        інтуїцію. Це психологічний інструмент, а не передбачення майбутнього.
                    </p>
                    <div className="t-cta-row">
                        <Link to="/trainer-session" className="btn btn-primary">Почати ментальний аудит →</Link>
                        <a href="#how" className="btn btn-ghost">Як це працює</a>
                    </div>
                    <div className="t-pills">
                        <span className="t-pill">Без езотерики</span>
                        <span className="t-pill">Юнгова школа</span>
                        <span className="t-pill">Архетипи</span>
                        <span className="t-pill">VIP · Матриця Долі</span>
                    </div>
                </div>
                <div className="t-visual fade-up d2">
                    <div className="t-vis-bg"></div>
                    <div className="t-vis-inner"></div>
                    <div className="t-glyph">⌖</div>
                    <div className="t-orbit-card c1"><div className="n">· II ·</div><div className="s">☾</div><div className="n">Inner</div></div>
                    <div className="t-orbit-card c2"><div className="n">· XI ·</div><div className="s">⚖</div><div className="n">Truth</div></div>
                    <div className="t-orbit-card c3"><div className="n">· VII ·</div><div className="s">⚔</div><div className="n">Will</div></div>
                </div>
            </section>

            <section className="t-sec" id="how">
                <div className="sec-eyebrow">Як це працює</div>
                <h2 className="sec-title">Три кроки <em>самоаналізу</em></h2>
                <p className="sec-lede">
                    Тренер не дає готових відповідей. Він допомагає вам сформулювати свою,
                    спираючись на класичні значення карт та тренди ваших попередніх сесій.
                </p>

                <div className="steps">
                    <div className="step fade-up d3">
                        <div className="step-num">· I ·</div>
                        <h3>Запит</h3>
                        <p>Сформулюйте ситуацію, яку хочете розібрати. Не «що мене чекає», а «чому я
                            застряг» чи «що мені робити з конфліктом на роботі».</p>
                    </div>
                    <div className="step fade-up d4">
                        <div className="step-num">· II ·</div>
                        <h3>Ваше тлумачення</h3>
                        <p>Витягніть карти — випадково або обираючи свідомо. Перш ніж прочитати
                            тлумачення тренера, опишіть, що ви самі бачите в цих картах.</p>
                    </div>
                    <div className="step fade-up d5">
                        <div className="step-num">· III ·</div>
                        <h3>Дзеркало</h3>
                        <p>Тренер показує своє читання поруч з вашим. Ви бачите збіги, сліпі плями,
                            нові кути. Так ваша інтуїція тренується тиждень за тижнем.</p>
                    </div>
                </div>
            </section>

            <section className="t-sec">
                <div className="sec-eyebrow">У чому різниця</div>
                <h2 className="sec-title">Звичайний розклад <em>vs</em> ментальний тренажер</h2>
                <div className="vs-grid">
                    <div className="vs-card">
                        <div className="vs-tag">Класичний розклад</div>
                        <h3>Карти дають <em>відповідь</em></h3>
                        <ul>
                            <li>Ви запитуєте — отримуєте інтерпретацію готовою</li>
                            <li>Пасивне споживання символу</li>
                            <li>Швидкий «ритуал» рефлексії</li>
                            <li>Підходить для щоденного контексту</li>
                        </ul>
                    </div>
                    <div className="vs-card gold">
                        <div className="vs-tag">Ментальний тренажер</div>
                        <h3>Ви тренуєте <em>власну</em> інтуїцію</h3>
                        <ul>
                            <li>Спочатку ваше тлумачення — потім тренера</li>
                            <li>Активна робота з власною психікою</li>
                            <li>Тижневі тренди та звіти прогресу</li>
                            <li>Для тих, хто хоче розуміти карти, а не використовувати</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="t-sec">
                <div className="sec-eyebrow">Що всередині</div>
                <h2 className="sec-title">Інструменти <em>аудиту</em></h2>

                <div className="feat-grid">
                    <div className="feat">
                        <div className="feat-glyph">⌬</div>
                        <h3>Свідомий витяг карт</h3>
                        <p>Тягнете випадково або обираєте з 78 карт — для медитативного занурення в
                            конкретний символ.</p>
                    </div>
                    <div className="feat">
                        <div className="feat-glyph">⚖</div>
                        <h3>Подвійне читання</h3>
                        <p>Ваша інтерпретація і тренера — поруч. Бачите, де ви бачите точно, а де
                            відмовляєтесь визнати.</p>
                    </div>
                    <div className="feat">
                        <div className="feat-glyph">∿</div>
                        <h3>Тижневі тренди</h3>
                        <p>«Цього тижня випадало 3 Мечі — професійне виснаження. Стратегія на 3 дні:
                            …»</p>
                    </div>
                    <div className="feat">
                        <div className="feat-glyph">⌖</div>
                        <h3>Матриця Долі <span className="vip">VIP</span></h3>
                        <p>Психологічний профіль, кармічні задачі та фінансовий потенціал на базі дати
                            народження + карти-сигніфікатори.</p>
                    </div>
                    <div className="feat">
                        <div className="feat-glyph">⊙</div>
                        <h3>Аудит конфлікту</h3>
                        <p>Спеціальний розклад: «розбір ситуації з людиною» — без догадок, тільки
                            структура.</p>
                    </div>
                    <div className="feat">
                        <div className="feat-glyph">↟</div>
                        <h3>Прогрес інтуїції</h3>
                        <p>Скільки ваших тлумачень збіглись з тренером цього місяця. Метрика, а не
                            магія.</p>
                    </div>
                </div>
            </section>

            <section className="t-sec">
                <div className="sec-eyebrow">VIP · Аналіз тижня</div>
                <h2 className="sec-title">Тренди як <em>звіт</em></h2>
                <p className="sec-lede">
                    Раз на тиждень тренер дає вам стратегічний summary за всіма сесіями. Не «що буде»,
                    а «що повторюється і що з цим робити».
                </p>

                <div className="trends">
                    <div className="trends-head">
                        <h3>Тиждень 15 — 21 квітня</h3>
                        <span className="week">VIP · Insight report</span>
                    </div>
                    <div className="trends-grid">
                        <div className="tr-block">
                            <div className="lab">Часті карти цього тижня</div>
                            <div className="tr-bar"><span className="s">⚔</span><span className="n">Мечі (3 шт.)</span><div className="b" style={bar('90%')}></div><span className="v">38%</span></div>
                            <div className="tr-bar"><span className="s">☾</span><span className="n">Місяць · XVIII</span><div className="b" style={bar('60%')}></div><span className="v">25%</span></div>
                            <div className="tr-bar"><span className="s">XVI</span><span className="n">Вежа</span><div className="b" style={bar('30%')}></div><span className="v">12%</span></div>
                        </div>
                        <div className="tr-block">
                            <div className="lab">Точність тлумачень</div>
                            <div className="tr-bar"><span className="s">◐</span><span className="n">Збіг із тренером</span><div className="b" style={bar('74%')}></div><span className="v">74%</span></div>
                            <div className="tr-bar"><span className="s">↑</span><span className="n">Прогрес від мин. тижня</span><div className="b" style={bar('55%')}></div><span className="v">+12%</span></div>
                            <div className="tr-bar"><span className="s">⚐</span><span className="n">Сліпі плями</span><div className="b" style={bar('26%')}></div><span className="v">2</span></div>
                        </div>
                    </div>
                    <div className="tr-insight">
                        <strong>Висновок тренера</strong>
                        Тричі цього тижня випадали Мечі — стресовий тиск у комунікації. Двічі ви
                        недооцінили карту Башта, повторно інтерпретуючи її як «зміна». Спостерігайте за
                        тригерами в розмовах з керівником. Стратегія на 3 дні: повільний темп
                        відповідей у листуванні, фіксуйте емоції перед реакцією.
                    </div>
                </div>
            </section>

            <section className="t-sec">
                <div className="t-cta">
                    <h2>Готові <em>розпочати</em> ментальний аудит?</h2>
                    <p>Перша сесія — безкоштовна. Без реєстрації, без обіцянок «дізнатися майбутнє».
                        Просто чесна робота з вашими станами.</p>
                    <div className="row">
                        <Link to="/trainer-session" className="btn btn-primary">Почати сесію →</Link>
                        <Link to="/pricing" className="btn btn-ghost">Тарифи Premium / VIP</Link>
                    </div>
                </div>
            </section>
        </>
    )
}
