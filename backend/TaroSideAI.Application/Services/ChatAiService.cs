using System.ComponentModel;
using Microsoft.Extensions.AI;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class ChatAiService : IChatAiService
{
    private readonly IChatClient _chatClient;
    private readonly CardService _cardService;
    private readonly SpreadService _spreadService;

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
        "ю і чекай, поки система передасть тобі реальні витягнуті карти.\n\n# ПРАВИЛА ІНТЕРПРЕТАЦІЇ КАРТ (ПІСЛЯ" +
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

    public ChatAiService(IChatClient chatClient, CardService cardService, SpreadService spreadService)
    {
        _spreadService = spreadService;
        _chatClient = chatClient;
        _cardService = cardService;
    }

    // ← ДОДАНО async
    public async Task<string> ChatAsync(string userMessage, int currentSpreadId, List<ChatMessage> history, CancellationToken ct)
    {
        var drawCardsTool = AIFunctionFactory.Create(
            DrawTarotCardsAsync,
            name: "DrawTarotCards",
            description: "Витягує карти Таро для розкладу. ОБОВ'ЯЗКОВО викликай цю функцію, коли користувач просить ворожіння або розклад.");

        var options = new ChatOptions
        {
            Tools = [drawCardsTool],
            ToolMode = ChatToolMode.Auto
        };

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, SystemPrompt + $"\n\nПоточний контекст системи: Користувач обрав розклад з ID={currentSpreadId}. Якщо потрібен розклад, викликай DrawTarotCards з spreadId={currentSpreadId}."),
        };
        
        if (history != null && history.Any()) 
        {
            messages.AddRange(history);
        }
        
        messages.Add(new(ChatRole.User, userMessage));

        var response = await _chatClient.GetResponseAsync(messages, options, ct);
        return response.Text ?? string.Empty;
    }

    [Description("Витягує необхідну кількість карт з колоди Таро для заданого розкладу.")]
    private async Task<string> DrawTarotCardsAsync(
        [Description("Ідентифікатор розкладу, який обрав користувач")] int spreadId)
    {
        if (spreadId <= 0)
        {
            return "СИСТЕМНА ПОМИЛКА: Невірний ID розкладу. Попроси користувача перевірити налаштування розкладу.";
        }

        var spread = await _spreadService.GetSpreadByIdAsync(spreadId);
        if (spread == null)
        {
            return $"СИСТЕМНА ПОМИЛКА: Розклад з ID {spreadId} не знайдено в базі даних.";
        }
        
        var count = spread.CardCount;
        var descriptionSpread = $"Розклад: \"{spread.Name}\" ({count} карт). Опис: {spread.Description}";

        var drawn = await _cardService.DrawRandomCardsAsync(count);

        var lines = drawn.Select(rc =>
        {
            var orient = rc.IsReversed ? "перевернута" : "пряма";
            var meaning = rc.IsReversed ? rc.Card.ReversedMeaning : rc.Card.UprightMeaning;
            return $"- Позиція {rc.Position}: {rc.Card.NameUkr} ({orient}). Класичне значення: {meaning}";
        });

        // Повертаємо LLM тільки фактичні дані (карти та опис розкладу)
        return $"{descriptionSpread}\n\nВитягнуті карти:\n{string.Join("\n", lines)}\n\nТвоя задача: Інтерпретуй ці карти як єдину історію у контексті проблеми користувача.";
    }
}