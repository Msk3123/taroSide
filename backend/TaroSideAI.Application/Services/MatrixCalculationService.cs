using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain;

namespace TaroSideAI.Application.Services;

public class MatrixCalculationService : IMatrixCalculationService
{
    private readonly ICardService _cardService;

    private record PointDef(string Key, string Group, string Title, string Hint, Func<DestinyMatrix, int> Pick);

    // Порядок = порядок, у якому їх читає оракул і показує сторінка.
    // Hint пояснює саму ПОЗИЦІЮ: що означає будь-який аркан, якщо він став сюди.
    private static readonly PointDef[] PersonalPoints =
    [
        new("center", "personality", "Зона комфорту",
            "Головна енергія: стан, у якому вам природно й легко. Хто ви без масок.", m => m.Center),
        new("left", "personality", "Особистість",
            "Як вас сприймають люди, перше враження, характер, який видно одразу.", m => m.Left),
        new("top", "personality", "Таланти",
            "Вроджені здібності й духовна підтримка, з якою ви прийшли.", m => m.Top),
        new("right", "personality", "Матеріальна сфера",
            "Як ви взаємодієте з грошима, роботою й матеріальним світом, що тут треба опрацювати.", m => m.Right),

        new("bottom", "karma", "Кармічний хвіст · вхід",
            "Старий сценарій, що тягнеться з минулого. Перша з трьох точок хвоста.", m => m.Bottom),
        new("tailMid", "karma", "Кармічний хвіст · урок",
            "Суть повторюваного уроку: що саме життя раз у раз підкидає.", m => m.BottomMid),
        new("tailInner", "karma", "Кармічний хвіст · вихід",
            "Як цей урок пройти: якість, яку треба виростити в собі.", m => m.BottomInner),

        new("fatherTop", "family", "Рід батька · сила",
            "Що передалося по батьківській лінії як ресурс.", m => m.TopLeft),
        new("fatherBottom", "family", "Рід батька · завдання",
            "Що по батьківській лінії лишилося незавершеним і просить відпрацювання.", m => m.BottomRight),
        new("motherTop", "family", "Рід матері · сила",
            "Що передалося по материнській лінії як ресурс.", m => m.TopRight),
        new("motherBottom", "family", "Рід матері · завдання",
            "Що по материнській лінії лишилося незавершеним і просить відпрацювання.", m => m.BottomLeft),

        new("money", "money_love", "Канал грошей",
            "Через яку енергію до вас найлегше приходять гроші, яка діяльність «ваша».", m => m.Money),
        new("love", "money_love", "Канал любові",
            "Який партнер і які стосунки вам підходять, що ви шукаєте в любові.", m => m.Love),

        new("purposePersonal", "purpose", "Особисте призначення",
            "Задача приблизно до 40 років: знайти себе, навчитися балансу духовного й земного.", m => m.Personal),
        new("purposeSocial", "purpose", "Соціальне призначення",
            "Задача приблизно 40–60 років: роль серед людей, у роду й суспільстві.", m => m.Social),
        new("purposeSpiritual", "purpose", "Духовне призначення",
            "Задача після 60: головний урок душі, що об'єднує особисте й соціальне.", m => m.Spiritual),
    ];

    // Ті самі формули, але сенс позицій інший: це енергія СОЮЗУ, а не людини.
    private static readonly PointDef[] PairPoints =
    [
        new("center", "personality", "Енергія пари",
            "Головна енергія союзу: заради чого ці двоє зійшлися і що їх тримає.", m => m.Center),
        new("left", "personality", "Пара очима інших",
            "Як вас сприймають разом, яке враження ви справляєте як пара.", m => m.Left),
        new("top", "personality", "Що надихає разом",
            "Спільні таланти й те, що наповнює обох.", m => m.Top),
        new("right", "personality", "Матеріальне в парі",
            "Побут, спільні гроші, робота разом — де тут сила, а де пастка.", m => m.Right),

        new("bottom", "karma", "Карма пари · вхід",
            "Сценарій, який пара може повторювати, якщо його не помітити.", m => m.Bottom),
        new("tailMid", "karma", "Карма пари · урок",
            "Що в цих стосунках постійно перевіряється на міцність.", m => m.BottomMid),
        new("tailInner", "karma", "Карма пари · вихід",
            "Як пара проходить свій урок і стає сильнішою.", m => m.BottomInner),

        new("money", "money_love", "Гроші пари",
            "Через що пара найкраще заробляє й будує спільний добробут.", m => m.Money),
        new("love", "money_love", "Любов у парі",
            "Яка любов між цими людьми можлива, на чому тримається близькість.", m => m.Love),

        new("purposePersonal", "purpose", "Для чого ви одне одному",
            "Що кожен дає іншому для особистого росту.", m => m.Personal),
        new("purposeSocial", "purpose", "Пара у світі",
            "Що ця пара разом дає людям: родині, друзям, суспільству.", m => m.Social),
        new("purposeSpiritual", "purpose", "Духовна мета пари",
            "Найглибший сенс союзу.", m => m.Spiritual),
    ];

    public MatrixCalculationService(ICardService cardService)
    {
        _cardService = cardService;
    }

    /// <summary>
    /// Аркан матриці (1..22) → Id карти в БД.
    /// Старші аркани в БД лежать за порядком Райдера–Вейта: Id = номер + 1 (Дурень 0 → Id 1).
    /// Матриця Долі рахує за марсельською нумерацією: 8 = Справедливість, 11 = Сила
    /// (у Райдера–Вейта навпаки), а 22 — це Дурень.
    /// </summary>
    public static int CardIdForArcana(int arcana) => arcana switch
    {
        < 1 or > 22 => throw new ArgumentOutOfRangeException(nameof(arcana)),
        22 => 1,   // Дурень
        8  => 12,  // Справедливість (RW №11)
        11 => 9,   // Сила (RW №8)
        _  => arcana + 1
    };

    public static void ValidateBirthDate(DateOnly birthDate)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (birthDate < new DateOnly(1900, 1, 1) || birthDate > today)
            throw new ValidationException("Дата народження має бути між 01.01.1900 і сьогоднішнім днем");
    }

    public async Task<DestinyMatrixDto> CalculateAsync(DateOnly birthDate)
    {
        ValidateBirthDate(birthDate);
        var cards = await LoadCardsAsync();
        return new DestinyMatrixDto
        {
            BirthDate = birthDate,
            Points = BuildPoints(MatrixCalculator.Calculate(birthDate), PersonalPoints, cards)
        };
    }

    public async Task<CompatibilityDto> CompatibilityAsync(DateOnly first, DateOnly second)
    {
        ValidateBirthDate(first);
        ValidateBirthDate(second);
        var cards = await LoadCardsAsync();

        var m1 = MatrixCalculator.Calculate(first);
        var m2 = MatrixCalculator.Calculate(second);
        return new CompatibilityDto
        {
            First = new DestinyMatrixDto { BirthDate = first, Points = BuildPoints(m1, PersonalPoints, cards) },
            Second = new DestinyMatrixDto { BirthDate = second, Points = BuildPoints(m2, PersonalPoints, cards) },
            Points = BuildPoints(MatrixCalculator.Compatibility(m1, m2), PairPoints, cards)
        };
    }

    private async Task<Dictionary<int, Domain.Entities.TarotCard>> LoadCardsAsync() =>
        (await _cardService.GetAllCardsAsync()).ToDictionary(c => c.Id);

    private static List<MatrixPointDto> BuildPoints(DestinyMatrix matrix, PointDef[] defs,
        Dictionary<int, Domain.Entities.TarotCard> cards)
    {
        var list = new List<MatrixPointDto>(defs.Length);
        foreach (var def in defs)
        {
            var arcana = def.Pick(matrix);
            var card = cards[CardIdForArcana(arcana)];
            list.Add(new MatrixPointDto
            {
                Key = def.Key,
                Group = def.Group,
                Title = def.Title,
                Hint = def.Hint,
                Arcana = arcana,
                CardId = card.Id,
                NameUkr = card.NameUkr,
                Symbol = card.Symbol,
                Keywords = card.Keywords,
                Meaning = card.UprightMeaning
            });
        }
        return list;
    }
}
