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

    private const string SystemPrompt =
        "# РОЛЬ ТА ІДЕНТИЧНІСТЬ\nТи — Lunaris, езотеричний провідник, стародавній мудрець та майстер Таро. " +
        "Ти існуєш у просторі між зірками та тінню, а твоє кредо — \"Шепіт карту темряві ночі\". " +
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
        "Майбутнє завжди багатоваріантне.";

    // Окремий короткий промпт для Матриці: без інструментів і без правил ворожіння —
    // менше вхідних токенів, ніж тягнути весь SystemPrompt.
    private const string MatrixPrompt =
        "Ти — Lunaris, езотеричний провідник і знавець Матриці Долі. Тон: таємничий, теплий, чесний, без фаталізму. " +
        "Тобі дано п'ять точок матриці, обчислених із дати народження. Прочитай їх як єдиний портрет особистості: " +
        "зона комфорту (базова енергія), призначення, чоловіча й жіноча лінії роду, кармічний хвіст (що відпрацювати). " +
        "Шукай зв'язки між арканами, а не перелічуй значення окремо. Не став медичних діагнозів і не давай фінансових порад. " +
        "Виділяй назви арканів зірочками: *ось так*. Пиши короткими абзацами по 2–3 речення, розділяй їх порожнім рядком. " +
        "Заверши конкретною порадою або запитанням для роздумів. Обсяг — до 350 слів.";

    private readonly ILogger<ChatAiService> _logger;

    public ChatAiService(IChatClient chatClient, ICardService cardService, ISpreadService spreadService,
        ILogger<ChatAiService> logger)
    {
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
            description: "Витягує карти Таро для обраного користувачем розкладу. ОБОВ'ЯЗКОВО викликай цю функцію, коли користувач просить ворожіння або розклад.");

        // Якщо денний ліміт розкладів вичерпано — взагалі не підключаємо інструмент,
        // тож модель фізично не може витягнути карти (ліміт неможливо обійти промптом).
        var options = allowance.CanDraw
            ? new ChatOptions { Tools = [drawCardsTool], ToolMode = ChatToolMode.Auto }
            : new ChatOptions();

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
              "матриця — глибинні схильності.";

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, SystemPrompt + limitNote + matrixContext +
                "\n\n# КОЛИ ВИКЛИКАТИ DrawTarotCards (СУВОРО)\n" +
                "Виклик DrawTarotCards ДОЗВОЛЕНО лише тоді, коли користувач у своєму ОСТАННЬОМУ повідомленні ЯВНО просить ворожіння або розклад.\n" +
                "• НЕ викликай інструмент (просто відповідай текстом) на: привітання, подяки, світську бесіду, емоції, запитання про вже зроблений розклад. Приклади: «привіт», «як справи», «дякую», «розкажи більше про другу карту».\n" +
                "• Викликай інструмент лише на явні прохання: «зроби розклад», «поворожи», «витягни карти», «що на мене чекає…», «подивись моє майбутнє».\n" +
                "Якщо сумніваєшся — НЕ викликай, а уточни запит звичайним текстом.\n\n" +
                "# ФОРМАТУВАННЯ ВІДПОВІДІ\n" +
                "Виділяй назви карт та ключові фрази зірочками: *ось так* (це робить їх курсивом у застосунку). " +
                "Пиши короткими абзацами по 2–3 речення й розділяй абзаци порожнім рядком."),
        };

        if (history != null && history.Any())
        {
            messages.AddRange(history);
        }

        messages.Add(new(ChatRole.User, userMessage));

        var response = await _chatClient.GetResponseAsync(messages, options, ct);
        LogUsage("chat", response.Usage, drawnCards.Count, history?.Count ?? 0, matrix is not null);

        // Текст + карти, що встиг зібрати інструмент під час function calling.
        return new ChatResultDto
        {
            Reply = response.Text ?? string.Empty,
            Cards = drawnCards
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

    // Скільки «з'їв» запит. FunctionInvokingChatClient сумує usage усіх раундів
    // (виклик інструмента + фінальна відповідь), тож це повна вартість одного повідомлення.
    private void LogUsage(string kind, UsageDetails? usage, int cards, int historyCount, bool withMatrix)
    {
        _logger.LogInformation(
            "AI usage [{Kind}]: input={Input} output={Output} total={Total} cards={Cards} history={History} matrix={Matrix}",
            kind, usage?.InputTokenCount, usage?.OutputTokenCount, usage?.TotalTokenCount, cards, historyCount, withMatrix);
    }
}
