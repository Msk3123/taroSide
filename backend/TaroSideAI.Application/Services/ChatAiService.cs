using System.ComponentModel;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class ChatAiService : IChatAiService
{
    private readonly IChatClient _chatClient;
    private readonly ICardService _cardService;
    private readonly ISpreadService _spreadService;
    private readonly IMatrixCalculationService _matrixCalc;

    private const string SystemPrompt =
        "# РОЛЬ ТА ІДЕНТИЧНІСТЬ\nТи — Lunaris, езотеричний провідник, стародавній мудрець та майстер Таро. " +
        "Ти існуєш у просторі між зірками та тінню, а твоє кредо — \"Шепіт карт у темряві ночі\". " +
        "Твоя мета — допомагати подорожнім розібратися в собі, своїх почуттях, стосунках та майбутньому через " +
        "призму архетипів і символів.\n\n# ТОН ТА СТИЛЬ СПІЛКУВАННЯ\n1. Твій тон: таємничий, заспокійливий, " +
        "емпатичний, але чесний. Ти не лякаєш, але й не даєш порожніх надій. Ти спілкуєшся з повагою до " +
        "вільного вибору людини.\n2. Твоя мова: літературна, глибока, з використанням метафор " +
        "(зоряні шляхи, тіні, нитки долі, шепіт вітру), але без надмірної театральності. " +
        "Пиши структуровано та зрозуміло.\n3. ЗАБОРОНЕНО: Ніколи не використовуй фрази на кшталт \"" +
        "Як штучний інтелект...\", \"Я віртуальний помічник\", \"Чим я можу допомогти?\". " +
        "Ти — повноцінна містична сутність.\n\n# МЕХАНІКА ВЗАЄМОДІЇ (РОБОТА З ІНСТРУМЕНТАМИ)\n" +
        "Ти працюєш у двох площинах і маєш чітко розрізняти наміри користувача:\n\n- " +
        "РЕЖИМ ДІАЛОГУ: Якщо користувач просто вітається, ділиться емоціями, запитує щось загальне або " +
        "просить пояснити минулий розклад — підтримуй бесіду звичайним текстом. Вислухай і дай пораду.\n- " +
        "РЕЖИМ ВОРОЖІННЯ: Якщо користувач чітко просить зробити розклад, витягнути карти, \"поворожити\", " +
        "подивитися майбутнє чи проаналізувати конкретну ситуацію — ТИ ЗОБОВ'ЯЗАНИЙ викликати доступний тобі " +
        "інструмент (DrawTarotCards). \nВАЖЛИВО: Ніколи не вигадуй карти самостійно! Завжди викликай функці" +
        "ю і чекай, поки система передасть тобі реальні витягнуті карти.\n\n" +
        "# ТИША ПІД ЧАС ВИКЛИКУ ІНСТРУМЕНТА (КРИТИЧНО — ЕКОНОМІЯ ТОКЕНІВ)\n" +
        "Коли вирішуєш викликати DrawTarotCards — викликай функцію МОВЧКИ, без жодного тексту перед викликом. " +
        "СУВОРО ЗАБОРОНЕНО писати фрази-наповнювачі: «Зачекай, поки витягну карти», «Дай мені момент», " +
        "«Я звернуся до глибин Таро», «Витягнуті карти створюють картину…». Не описуй процес витягування. " +
        "Твоя перша й єдина текстова відповідь має початися ВІДРАЗУ з інтерпретації — лише після того, " +
        "як система поверне реальні карти.\n\n# ПРАВИЛА ІНТЕРПРЕТАЦІЇ КАРТ (ПІСЛЯ" +
        " ВИКЛИКУ ФУНКЦІЇ)\nКоли система повернула тобі список витягнутих карт:\n1. Синтез, а не словник: Не " +
        "читай суху лекцію про класичне значення кожної карти окремо. Одразу вплітай їхні енергії у контек" +
        "ст запитання користувача. Аналізуй карти як єдину історію, шукай зв'язки між ними.\n2. Екологічн" +
        "ість: Якщо випадають \"важкі\" Аркани (Смерть, Вежа, Диявол, 10 Мечів), інтерпретуй їх через тр" +
        "ансформацію, необхідне руйнування старого, кармічні уроки або вихід із тіні. Уникай фаталізму.\n3. " +
        "Структура відповіді: Почни з короткого вступу, розкрий суть розкладу, " +
        "і обов'язково заверши конструктивною порадою або відкритим запитанням для роздумів," +
        " залишаючи користувачу простір для дій.\n\n# СУВОРІ ОБМЕЖЕННЯ (GUARDRAILS)\n- " +
        "Медицина та фінанси: Ти категорично не ставиш діагнозів, не даєш порад щодо лікування, " +
        "вагітності, юридичних справ чи точних фінансових інвестицій. " +
        "Якщо питають про це — м'яко нагадай, що Таро підсвічує енергії, але не замінює фахівців.\n- " +
        "Фаталізм: Ти не передбачаєш дату смерті, трагічні невідворотні події чи глобальні катастрофи. " +
        "Майбутнє завжди багатоваріантне.\n\n" +
        "# УТОЧНЕННЯ (НЕОБОВ'ЯЗКОВІ ДЛЯ КОРИСТУВАЧА)\n" +
        "Якщо питання про іншу людину («він», «вона», «колишній»), а в розмові ще не сказано, хто це, — " +
        "ПЕРЕД розкладом один раз коротко спитай: як звати цю людину і ким вона тобі доводиться; для Матриці — дату народження. " +
        "Карти в цьому повідомленні не тягни. Якщо питання про себе й бракує сфери (стосунки, робота, гроші) — теж можна одне уточнення.\n" +
        "Відповідь завжди необов'язкова: якщо людина відповіла не на все, не хоче відповідати або знову просить розклад — " +
        "роби розклад з тим, що є, і більше не перепитуй. Не більше одного уточнення за розмову.\n" +
        "Ніколи не проси фото, прізвище, адресу чи контакти — ні користувача, ні інших людей.\n" +
        "Стать користувача невідома, доки він сам її не покаже (напр. «я народилась», «я пішов»): до того пиши без родових " +
        "закінчень (не «ти боявся/боялась», а «тобі було страшно»).";

    // Спільні правила читання Матриці — і для сторінки /matrix, і для інструмента в чаті.
    // Тримаємо окремо від SystemPrompt: у звичайному чаті без матриці вони не потрібні (економія токенів).
    private const string MatrixReadingRules =
        "# ЯК ЧИТАТИ МАТРИЦЮ ДОЛІ\n" +
        "Аркани вже обчислені з дати — не перераховуй, не змінюй і не вигадуй інших чисел.\n" +
        "Порядок: 1) Зона комфорту — ядро, почни з неї. 2) Особистість, таланти, матеріальна сфера — як ядро проявляється. " +
        "3) Кармічний хвіст (вхід → урок → вихід) — це ОДНА історія, а не три окремі карти. " +
        "4) Канали грошей і любові. 5) Призначення (особисте → соціальне → духовне) — на завершення. " +
        "Рід батька й матері згадуй коротко, лише якщо є яскравий зв'язок або питають про родину.\n" +
        "Якщо є питання — фокусуйся на потрібних точках (гроші → матеріальна сфера й канал грошей; стосунки → " +
        "канал любові, хвіст, зона комфорту), решту згадуй мимохідь.\n" +
        "Синтез: якщо той самий аркан стоїть у кількох точках — це підсилена тема, обов'язково назви її. " +
        "Шукай напругу між точками (напр. легкий аркан у комфорті й важкий у хвості) і пояснюй, як її поєднати.\n" +
        "Чесність: матриця описує схильності й уроки, а не вирок. Не кажи «точно», «100%», «назавжди». " +
        "Важкі аркани (Смерть, Вежа, Диявол) — через трансформацію. Не став діагнозів і не давай фінансових порад.";

    private const string CompatibilityRules =
        "# ЯК ЧИТАТИ МАТРИЦЮ СУМІСНОСТІ\n" +
        "Тобі дано точки ПАРИ (енергія союзу, а не однієї людини) і ключові особисті точки обох. " +
        "Порядок: енергія пари → любов у парі й особисті канали любові обох (чи збігається те, що кожен шукає) → " +
        "карма пари (вхід → урок → вихід) → гроші й побут → для чого ви одне одному і пара у світі.\n" +
        "ЧЕСНІСТЬ (КРИТИЧНО): матриця НЕ відповідає «будуть разом чи ні» і не дає відсотків. " +
        "Ніколи не називай відсоток сумісності й не обіцяй, що пара буде або не буде разом. " +
        "Якщо питають «чи будемо разом» — прямо скажи, що матриця показує сильні сторони союзу й точки напруги, " +
        "а вибір за людьми, і далі дай саме це. Про почуття іншої людини не говори як про факт " +
        "(«він тебе не любить») — описуй енергії й динаміку.";

    private const string Format =
        "# ФОРМАТ\nЗвертайся на «ти». Виділяй назви арканів зірочками: *ось так*. " + NoMarkdown +
        " Короткі абзаци по 2–3 речення, між ними порожній рядок. Заверши конкретною порадою або запитанням для роздумів.";

    // Застосунок вміє лише *курсив* і абзаци — решта markdown показується «сирими» символами.
    private const string NoMarkdown =
        "НЕ використовуй інший markdown: жодних **жирних**, # заголовків, списків з «-» чи «1.». Тільки абзаци.";

    // Сторінка /matrix: окремий короткий промпт без інструментів Таро — менше вхідних токенів.
    private const string MatrixPrompt =
        "Ти — Lunaris, езотеричний провідник і знавець Матриці Долі (метод 22 арканів, октаграма). " +
        "Тон: таємничий, теплий, чесний, без фаталізму.\n\n" + MatrixReadingRules + "\n\n" + Format +
        " Обсяг — 300–450 слів.";

    private const string CompatibilityPrompt =
        "Ти — Lunaris, езотеричний провідник і знавець Матриці Долі. Тон: теплий, чесний, без фаталізму й без обіцянок.\n\n" +
        CompatibilityRules + "\n\n" + Format + " Обсяг — 300–450 слів.";

    // Скільки разів за одну відповідь модель може рахувати матрицю (захист від зациклення інструмента).
    private const int MaxMatrixToolCalls = 3;

    private readonly ILogger<ChatAiService> _logger;

    public ChatAiService(IChatClient chatClient, ICardService cardService, ISpreadService spreadService,
        IMatrixCalculationService matrixCalc, ILogger<ChatAiService> logger)
    {
        _matrixCalc = matrixCalc;
        _spreadService = spreadService;
        _chatClient = chatClient;
        _cardService = cardService;
        _logger = logger;
    }

    public async Task<ChatResultDto> ChatAsync(string userMessage, int currentSpreadId, List<ChatMessage> history,
        MessageAllowance allowance, DestinyMatrixDto? matrix, CancellationToken ct)
    {
        // Сюди інструмент складатиме реально витягнуті карти. Змінна живе лише
        // в межах ОДНОГО запиту (замикання), тож спільного стану між
        // користувачами немає — на відміну від поля класу.
        var drawnCards = new List<DrawnCardDto>();

        // Локальна функція-інструмент. Робить дві речі: (1) запамʼятовує карти
        // у drawnCards для фронту, (2) повертає LLM текстовий опис для інтерпретації.
        // Розклад НЕ приходить від моделі — береться з того, що обрав користувач (currentSpreadId),
        // тож LLM не може «вибрати» інший, дорожчий розклад.
        async Task<string> DrawTarotCardsAsync(
            [Description("Лише для вільного розкладу: скільки карт витягнути. Для інших розкладів не передавай.")]
            int? cardCount = null)
        {
            // Модель іноді викликає інструмент двічі за відповідь — другий раз карти не тягнемо.
            if (drawnCards.Count > 0)
                return "Карти для цього запиту вже витягнуто вище. Інтерпретуй саме їх.";

            var spread = await _spreadService.GetSpreadByIdAsync(currentSpreadId);
            if (spread == null)
                return $"СИСТЕМНА ПОМИЛКА: Розклад з ID {currentSpreadId} не знайдено. Попроси користувача обрати розклад.";

            // Захист тарифу: розклад, вищий за роль користувача, тягнути не можна
            // (інакше Free-юзер міг би обрати великий розклад в обхід тарифу).
            if (allowance.Role < spread.RequiredRole || (spread.IsFreeMode && !allowance.FreeMode))
            {
                return $"СИСТЕМНА ВІДМОВА: Розклад \"{spread.Name}\" недоступний на тарифі користувача. " +
                       "НЕ роби цей розклад і НЕ вигадуй карти. М'яко поясни, що він відкривається на вищому тарифі, " +
                       "і запропонуй обрати менший розклад.";
            }

            // Вільний розклад має CardCount = 0: кількість задає модель за запитом користувача.
            var count = spread.IsFreeMode
                ? Math.Clamp(cardCount ?? 3, 1, Math.Min(allowance.MaxCards, 12))
                : spread.CardCount;

            if (count > allowance.MaxCards)
            {
                return $"СИСТЕМНА ВІДМОВА: Розклад \"{spread.Name}\" складається з {count} карт, " +
                       $"але тариф користувача дозволяє максимум {allowance.MaxCards}. НЕ роби цей розклад і НЕ вигадуй карти.";
            }

            var descriptionSpread = $"Розклад: \"{spread.Name}\" ({count} карт). Опис: {spread.Description}";

            var drawn = await _cardService.DrawRandomCardsAsync(count);

            // Запамʼятовуємо карти у форматі, який чекає фронт (міні-картки).
            foreach (var rc in drawn)
            {
                drawnCards.Add(new DrawnCardDto
                {
                    Position = rc.Position,
                    Name = rc.Card.NameUkr,
                    Symbol = rc.Card.Symbol,
                    IsReversed = rc.IsReversed
                });
            }

            var lines = drawn.Select(rc =>
            {
                var orient = rc.IsReversed ? "перевернута" : "пряма";
                var meaning = rc.IsReversed ? rc.Card.ReversedMeaning : rc.Card.UprightMeaning;
                return $"- Позиція {rc.Position}: {rc.Card.NameUkr} ({orient}). Класичне значення: {meaning}";
            });

            var matrixNote = matrix is null
                ? string.Empty
                : "\nПов'яжи карти з Матрицею Долі користувача (вона в системному повідомленні): покажи, як розклад резонує з його арканами.";

            // LLM отримує тільки факти (карти + опис розкладу), без готового тексту.
            return $"{descriptionSpread}\n\nВитягнуті карти:\n{string.Join("\n", lines)}\n\n" +
                   $"Твоя задача: Інтерпретуй ці карти як єдину історію у контексті проблеми користувача.{matrixNote}";
        }

        var drawCardsTool = AIFunctionFactory.Create(
            DrawTarotCardsAsync,
            name: "DrawTarotCards",
            description: "Витягує карти Таро для обраного користувачем розкладу. ОБОВ'ЯЗКОВО викликай цю функцію, коли користувач просить ворожіння або розклад. " +
                         "ВИНЯТОК: питання про іншу людину («він», «вона»), а в розмові ще не сказано, хто це, і ти ще не уточнював — " +
                         "тоді НЕ викликай, а спершу одним коротким питанням спитай ім'я і ким ця людина доводиться.");

        // Якщо денний ліміт розкладів вичерпано — взагалі не підключаємо інструмент,
        // тож модель фізично не може витягнути карти (ліміт неможливо обійти промптом).
        // ---- Інструменти Матриці Долі (VIP): модель сама рахує матрицю будь-якої дати,
        // яку назвав користувач (своя, партнера, дитини), і сумісність двох дат.
        // Це чиста математика на нашому боці — модель не може «вигадати» аркани.
        var matrixCalls = 0;
        var matrixUsed = false;

        async Task<string> CalculateDestinyMatrixAsync(
            [Description("Дата народження у форматі YYYY-MM-DD")] string birthDate,
            [Description("Ім'я людини, якщо користувач його назвав (необов'язково)")] string? name = null)
        {
            if (++matrixCalls > MaxMatrixToolCalls)
                return "Ліміт розрахунків матриці на одну відповідь вичерпано. Інтерпретуй уже отримані дані.";
            if (!TryParseDate(birthDate, out var date))
                return "СИСТЕМНА ПОМИЛКА: незрозуміла дата. Попроси користувача назвати дату народження (день, місяць, рік).";
            try
            {
                var m = await _matrixCalc.CalculateAsync(date);
                matrixUsed = true;
                var who = string.IsNullOrWhiteSpace(name) ? "" : $"Людина: {name.Trim()}\n";
                return $"{who}Матриця Долі:\n{m.ToPromptText()}\n{MatrixReadingRules}";
            }
            catch (Exceptions.ValidationException e)
            {
                return $"СИСТЕМНА ПОМИЛКА: {e.Message}. Попроси уточнити дату.";
            }
        }

        async Task<string> CalculateCompatibilityAsync(
            [Description("Дата народження першої людини, YYYY-MM-DD")] string firstBirthDate,
            [Description("Дата народження другої людини, YYYY-MM-DD")] string secondBirthDate,
            [Description("Ім'я першої людини (необов'язково)")] string? firstName = null,
            [Description("Ім'я другої людини (необов'язково)")] string? secondName = null)
        {
            if (++matrixCalls > MaxMatrixToolCalls)
                return "Ліміт розрахунків матриці на одну відповідь вичерпано. Інтерпретуй уже отримані дані.";
            if (!TryParseDate(firstBirthDate, out var d1) || !TryParseDate(secondBirthDate, out var d2))
                return "СИСТЕМНА ПОМИЛКА: незрозуміла дата. Попроси назвати обидві дати народження.";
            try
            {
                var c = await _matrixCalc.CompatibilityAsync(d1, d2);
                matrixUsed = true;
                return $"Матриця сумісності:\n{c.ToPromptText(firstName, secondName)}\n{CompatibilityRules}";
            }
            catch (Exceptions.ValidationException e)
            {
                return $"СИСТЕМНА ПОМИЛКА: {e.Message}. Попроси уточнити дату.";
            }
        }

        var matrixToolsOn = allowance.DestinyMatrix && allowance.CanDraw;
        var tools = new List<AITool>();
        if (allowance.CanDraw) tools.Add(drawCardsTool);
        if (matrixToolsOn)
        {
            tools.Add(AIFunctionFactory.Create(CalculateDestinyMatrixAsync, name: "CalculateDestinyMatrix",
                description: "Обчислює Матрицю Долі за датою народження (користувача або іншої людини). " +
                             "Викликай, коли просять прочитати матрицю, призначення, карму, гроші чи стосунки ЗА МАТРИЦЕЮ і відома дата. " +
                             "Не вигадуй аркани без виклику. Якщо матриця користувача вже є в системному повідомленні — для нього не викликай."));
            tools.Add(AIFunctionFactory.Create(CalculateCompatibilityAsync, name: "CalculateCompatibility",
                description: "Матриця сумісності двох людей за датами народження. Викликай, коли питають про пару, " +
                             "сумісність, «чи підходимо ми», і відомі обидві дати. Якщо дати другої людини немає — спершу м'яко спитай її."));
        }

        var options = tools.Count > 0
            ? new ChatOptions { Tools = tools, ToolMode = ChatToolMode.Auto }
            : new ChatOptions();

        var matrixToolsNote = matrixToolsOn
            ? "\n\n# МАТРИЦЯ ДОЛІ В ЧАТІ\n" +
              "Тобі доступні CalculateDestinyMatrix і CalculateCompatibility. Можна поєднувати з Таро в одній відповіді: " +
              "розклад — ситуація зараз, матриця — глибинні схильності. Якщо для матриці бракує дати — спитай її."
            : "\n\n# МАТРИЦЯ ДОЛІ\n" +
              "Рахувати Матрицю Долі й сумісність у чаті на тарифі користувача не можна. Якщо про це питають, скажи саме так: " +
              "«Матрицю й сумісність пари можна безкоштовно розрахувати на сторінці «Матриця», а прочитання від Lunaris " +
              "і поєднання з Таро в чаті — у пакеті VIP». Не вигадуй аркани й не рахуй матрицю сам.";

        var limitNote = allowance.CanDraw
            ? string.Empty
            : "\n\n# ЛІМІТ РОЗКЛАДІВ ВИЧЕРПАНО\n" +
              "Користувач вичерпав денний ліміт розкладів свого тарифу. НЕ роби новий розклад. " +
              "Якщо він просить ворожіння — м'яко поясни, що ліміт на сьогодні вичерпано, і запропонуй " +
              "повернутися завтра або оновити тариф. Вести діалог про вже зроблені розклади можна вільно.";

        var matrixContext = matrix is null
            ? string.Empty
            : "\n\n# МАТРИЦЯ ДОЛІ КОРИСТУВАЧА\n" + matrix.ToPromptText() +
              "Це постійна структура особистості (не випадкові карти). Якщо користувач питає про себе чи свою матрицю — " +
              "спирайся на ці аркани. Якщо робиш розклад Таро — поєднуй його з матрицею: розклад описує ситуацію зараз, " +
              "матриця — глибинні схильності.\n" + MatrixReadingRules;

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, SystemPrompt + limitNote + matrixContext + matrixToolsNote +
                "\n\n# КОЛИ ВИКЛИКАТИ DrawTarotCards (СУВОРО)\n" +
                "Виклик DrawTarotCards ДОЗВОЛЕНО лише тоді, коли користувач у своєму ОСТАННЬОМУ повідомленні ЯВНО просить ворожіння або розклад.\n" +
                "• НЕ викликай інструмент (просто відповідай текстом) на: привітання, подяки, світську бесіду, емоції, запитання про вже зроблений розклад. Приклади: «привіт», «як справи», «дякую», «розкажи більше про другу карту».\n" +
                "• Викликай інструмент лише на явні прохання: «зроби розклад», «поворожи», «витягни карти», «що на мене чекає…», «подивись моє майбутнє».\n" +
                "Якщо сумніваєшся — НЕ викликай, а уточни запит звичайним текстом.\n" +
                "• Виняток (див. УТОЧНЕННЯ): перше питання про невідому «його/її» — спершу одне коротке уточнення без карт. " +
                "Приклад: «Чи думає він про мене?» → «Розкажи, як його звати і ким він тобі доводиться — так карти відповідатимуть точніше. " +
                "Якщо не хочеш — просто напиши «роби», і я витягну карти». Після будь-якої відповіді — роби розклад.\n\n" +
                "# ФОРМАТУВАННЯ ВІДПОВІДІ\n" +
                "Виділяй назви карт та ключові фрази зірочками: *ось так* (це робить їх курсивом у застосунку). " +
                "Пиши короткими абзацами по 2–3 речення й розділяй абзаци порожнім рядком. " + NoMarkdown),
        };

        if (history != null && history.Any())
        {
            messages.AddRange(history);
        }

        messages.Add(new(ChatRole.User, userMessage));

        var response = await _chatClient.GetResponseAsync(messages, options, ct);
        LogUsage("chat", response.Usage, drawnCards.Count, history?.Count ?? 0, matrix is not null || matrixUsed);

        // Текст + карти, що встиг зібрати інструмент під час function calling.
        return new ChatResultDto
        {
            Reply = response.Text ?? string.Empty,
            Cards = drawnCards,
            MatrixUsed = matrixUsed
        };
    }

    public async Task<string> InterpretMatrixAsync(DestinyMatrixDto matrix, string? question, CancellationToken ct)
    {
        var userText = "Моя Матриця Долі:\n" + matrix.ToPromptText() +
                       (string.IsNullOrWhiteSpace(question)
                           ? "\nПрочитай мою матрицю цілісно."
                           : $"\nМоє питання: {question.Trim()}");

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, MatrixPrompt),
            new(ChatRole.User, userText)
        };

        var response = await _chatClient.GetResponseAsync(messages, new ChatOptions(), ct);
        LogUsage("matrix", response.Usage, cards: 0, historyCount: 0, withMatrix: true);
        return response.Text ?? string.Empty;
    }

    public async Task<string> InterpretCompatibilityAsync(CompatibilityDto compatibility, string? question,
        CancellationToken ct)
    {
        var userText = "Наша Матриця сумісності:\n" + compatibility.ToPromptText() +
                       (string.IsNullOrWhiteSpace(question)
                           ? "\nПрочитай нашу сумісність цілісно."
                           : $"\nМоє питання: {question.Trim()}");

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, CompatibilityPrompt),
            new(ChatRole.User, userText)
        };

        var response = await _chatClient.GetResponseAsync(messages, new ChatOptions(), ct);
        LogUsage("compatibility", response.Usage, cards: 0, historyCount: 0, withMatrix: true);
        return response.Text ?? string.Empty;
    }

    /// <summary>Модель передає дату як YYYY-MM-DD; запасний варіант — дд.мм.рррр, як пишуть люди.</summary>
    private static bool TryParseDate(string? value, out DateOnly date) =>
        DateOnly.TryParseExact(value?.Trim(), ["yyyy-MM-dd", "dd.MM.yyyy", "d.M.yyyy"],
            System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out date);

    // Скільки «з'їв» запит. FunctionInvokingChatClient сумує usage усіх раундів
    // (виклик інструмента + фінальна відповідь), тож це повна вартість одного повідомлення.
    private void LogUsage(string kind, UsageDetails? usage, int cards, int historyCount, bool withMatrix)
    {
        _logger.LogInformation(
            "AI usage [{Kind}]: input={Input} output={Output} total={Total} cards={Cards} history={History} matrix={Matrix}",
            kind, usage?.InputTokenCount, usage?.OutputTokenCount, usage?.TotalTokenCount, cards, historyCount, withMatrix);
    }
}
