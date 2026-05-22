using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaroSideAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedCardsAndSpreads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Keywords",
                table: "TarotCards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Symbol",
                table: "TarotCards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsFreeMode",
                table: "Spreads",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DailyChatMessagesUsed",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReadingId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Spreads",
                columns: new[] { "Id", "CardCount", "Description", "IsFreeMode", "Name", "RequiredRole" },
                values: new object[,]
                {
                    { 1, 3, "Три карти шикуються зліва направо. Перша — що призвело до ситуації, друга — поточний стан, третя — ймовірний наслідок, якщо нічого не змінювати. Швидкий і ясний погляд на потік часу навколо питання.", false, "Минуле · Теперішнє · Майбутнє", 1 },
                    { 2, 5, "Розклад у формі хреста. Центр — суть питання. Зліва — причини, справа — що допомагає, зверху — ідеал/мета, знизу — що заважає. Показує ситуацію з усіх боків.", false, "П'ятикутник", 2 },
                    { 3, 7, "Сім карт утворюють дугу підкови. Минуле, теперішнє, приховані впливи, поради, зовнішнє середовище, очікування, підсумок. Один із найінформативніших класичних розкладів.", false, "Підкова долі", 2 },
                    { 4, 12, "Дванадцять карт — по одній на кожен місяць уперед. Ви отримуєте символічну прикмету для кожного місяця: що може статися, до чого бути готовим, на що звернути увагу.", false, "Колесо року", 3 },
                    { 5, 0, "Ви самі задаєте кількість карт та значення кожної позиції. Повна свобода для досвідчених таролога, які володіють власними методиками або адаптують класичні системи.", true, "Вільний розклад", 3 }
                });

            migrationBuilder.InsertData(
                table: "TarotCards",
                columns: new[] { "Id", "Arcana", "ImageUrl", "Keywords", "Name", "NameUkr", "ReversedMeaning", "Suit", "Symbol", "UprightMeaning" },
                values: new object[,]
                {
                    { 1, 0, null, "Початок · Невинність · Стрибок", "The Fool", "Дурень", "Безвідповідальність, наївність, необдумані рішення, страх почати.", null, "✦", "Новий початок, свобода, пригода, спонтанність, віра у Всесвіт. Час зробити крок у невідоме." },
                    { 2, 0, null, "Воля · Створення · Сила", "The Magician", "Маг", "Маніпуляції, обман, нерозкритий потенціал, розгубленість.", null, "⚚", "Усі ресурси у ваших руках. Концентрація волі, майстерність, матеріалізація задумів." },
                    { 3, 0, null, "Інтуїція · Таємниця · Внутрішнє знання", "The High Priestess", "Верховна Жриця", "Блок інтуїції, поверховість, секрети, які шкодять.", null, "☾", "Довіряйте інтуїції, час слухати, а не діяти. Приховане знання, жіноча мудрість." },
                    { 4, 0, null, "Достаток · Природа · Турбота", "The Empress", "Імператриця", "Залежність, гіперопіка, творчий ступор, проблеми в родині.", null, "♀", "Родючість, творчість, материнство, комфорт, земні радощі." },
                    { 5, 0, null, "Влада · Структура · Батько", "The Emperor", "Імператор", "Тиранія, жорсткість, зловживання владою, впертість.", null, "♂", "Лідерство, стабільність, дисципліна, захист. Порядок переможе хаос." },
                    { 6, 0, null, "Традиція · Віра · Вчитель", "The Hierophant", "Ієрофант", "Догматизм, повстання проти системи, нетрадиційність.", null, "☥", "Духовна настанова, традиції, шлюб, освіта, ритуали." },
                    { 7, 0, null, "Вибір · Любов · Союз", "The Lovers", "Закохані", "Розлад, неправильний вибір, дисгармонія у стосунках.", null, "♥", "Глибокий союз, гармонія, важливий вибір серцем." },
                    { 8, 0, null, "Воля · Перемога · Рух", "The Chariot", "Колісниця", "Втрата контролю, агресія без напряму, поразка.", null, "⚔", "Рішучий рух вперед, перемога через самодисципліну, тріумф." },
                    { 9, 0, null, "М'яка сила · Мужність · Терпіння", "Strength", "Сила", "Сумнів у собі, безсилля, неконтрольовані емоції.", null, "∞", "Внутрішня сила, приборкання пристрастей любов'ю, а не насиллям." },
                    { 10, 0, null, "Усамітнення · Мудрість · Пошук", "The Hermit", "Самітник", "Ізоляція, самотність, страх повернутися до людей.", null, "⚝", "Самопізнання, пошук істини, внутрішнє світло, духовна подорож." },
                    { 11, 0, null, "Цикл · Доля · Зміна", "Wheel of Fortune", "Колесо Фортуни", "Невдача, застрягання в старому циклі, опір змінам.", null, "☸", "Поворотний момент, удача, зміна на краще, карма працює." },
                    { 12, 0, null, "Правда · Закон · Рівновага", "Justice", "Справедливість", "Несправедливість, упередженість, уникання відповідальності.", null, "⚖", "Чесний підсумок, правовий успіх, моральний вибір, ясність." },
                    { 13, 0, null, "Пауза · Жертва · Інший погляд", "The Hanged Man", "Повішеник", "Застрягання, марні жертви, небажання бачити іншу точку зору.", null, "☥", "Добровільна пауза, зміна перспективи, духовне дозрівання." },
                    { 14, 0, null, "Кінець · Трансформація · Відродження", "Death", "Смерть", "Опір змінам, застій, страх відпустити минуле.", null, "☠", "Завершення циклу для нового початку, глибока трансформація. Майже ніколи не означає буквальну смерть." },
                    { 15, 0, null, "Баланс · Гармонія · Алхімія", "Temperance", "Поміркованість", "Дисбаланс, надмір, нетерплячість, виснаження.", null, "⚱", "Золота середина, терпіння, поєднання протилежностей, зцілення." },
                    { 16, 0, null, "Залежність · Ілюзія · Тінь", "The Devil", "Диявол", "Звільнення від залежності, усвідомлення ілюзій, повернення свободи.", null, "⛧", "Матеріальні путы, залежності, токсичні зв'язки, тіньова сторона." },
                    { 17, 0, null, "Руйнація · Раптовість · Одкровення", "The Tower", "Вежа", "Уникнення неминучого, внутрішня криза, страх змін.", null, "🗲", "Раптовий крах старого, очищувальна криза, прорив." },
                    { 18, 0, null, "Надія · Натхнення · Зцілення", "The Star", "Зірка", "Зневіра, втрата надії, творчий блок, цинізм.", null, "✦", "Світло після темряви, надія, дар, натхнення, віра у майбутнє." },
                    { 19, 0, null, "Ілюзія · Страх · Підсвідомість", "The Moon", "Місяць", "Ясність після туману, викриття обману, вихід із страху.", null, "☾", "Туман, сумніви, підсвідомі страхи, інтуїтивні сигнали, таємниці." },
                    { 20, 0, null, "Радість · Ясність · Успіх", "The Sun", "Сонце", "Тимчасові тіні, завищені очікування, надмірний оптимізм.", null, "☉", "Сяюча радість, успіх, дитяча свобода, здоров'я, святкування." },
                    { 21, 0, null, "Пробудження · Поклик · Прощення", "Judgement", "Суд", "Самокритика, страх вироку, нездатність пробачити.", null, "♆", "Важливе усвідомлення, друга можливість, духовне відродження." },
                    { 22, 0, null, "Завершення · Цілісність · Успіх", "The World", "Світ", "Незавершеність, близько, але не дотягує, застряг у процесі.", null, "⊕", "Повне завершення циклу, досягнення, інтеграція, мандрівки." },
                    { 23, 1, null, "Іскра · Старт", "Ace of Wands", "Туз Жезлів", "Затримка старту, невистачає натхнення.", 0, "🜂", "Новий творчий імпульс, початок проекту, пристрасть." },
                    { 24, 1, null, "Планування · Вибір", "Two of Wands", "Двійка Жезлів", "Страх перед невідомим, нерішучість.", 0, "🜂", "Планування майбутнього, аналіз можливостей, партнерство." },
                    { 25, 1, null, "Розширення · Горизонти", "Three of Wands", "Трійка Жезлів", "Затримки, перешкоди у проекті.", 0, "🜂", "Плани реалізуються, чекайте на новини здалеку." },
                    { 26, 1, null, "Святкування · Дім", "Four of Wands", "Четвірка Жезлів", "Нестабільність дому, відкладене свято.", 0, "🜂", "Свято, весілля, стабільна гармонія в родині." },
                    { 27, 1, null, "Суперечка · Конкуренція", "Five of Wands", "П'ятірка Жезлів", "Уникнення конфлікту, внутрішній дискомфорт.", 0, "🜂", "Дрібні конфлікти, здорова конкуренція." },
                    { 28, 1, null, "Перемога · Визнання", "Six of Wands", "Шістка Жезлів", "Неоціненість, провал планів.", 0, "🜂", "Тріумф, визнання, успіх на виду." },
                    { 29, 1, null, "Оборона · Стійкість", "Seven of Wands", "Сімка Жезлів", "Здача позицій, перевантаженість.", 0, "🜂", "Захист позиції, стійкість у протистоянні." },
                    { 30, 1, null, "Швидкість · Новини", "Eight of Wands", "Вісімка Жезлів", "Затримки, непорозуміння.", 0, "🜂", "Стрімкий розвиток подій, новини, повідомлення." },
                    { 31, 1, null, "Витривалість · Пильність", "Nine of Wands", "Дев'ятка Жезлів", "Виснаження, параноя.", 0, "🜂", "Остання фаза боротьби, тримайтеся." },
                    { 32, 1, null, "Тягар · Відповідальність", "Ten of Wands", "Десятка Жезлів", "Відмова від обов'язків, звільнення.", 0, "🜂", "Ви взяли на себе забагато, час делегувати." },
                    { 33, 1, null, "Учень · Ентузіазм", "Page of Wands", "Паж Жезлів", "Погані вісті, капризи, нестабільність.", 0, "🜂", "Юний дух, нова ідея, новини про проект." },
                    { 34, 1, null, "Імпульс · Пригода", "Knight of Wands", "Лицар Жезлів", "Необдуманість, агресія, поспіх.", 0, "🜂", "Рішуча дія, подорож, пристрасть без розрахунку." },
                    { 35, 1, null, "Харизма · Впевненість", "Queen of Wands", "Королева Жезлів", "Ревнощі, егоцентризм.", 0, "🜂", "Впевнена, незалежна жінка, лідерство з теплом." },
                    { 36, 1, null, "Візіонер · Лідер", "King of Wands", "Король Жезлів", "Тиранія, нетерпимість.", 0, "🜂", "Зрілий лідер, візія, успішне підприємництво." },
                    { 37, 1, null, "Кохання · Початок", "Ace of Cups", "Туз Кубків", "Емоційна блокада, порожнеча.", 1, "🜄", "Нове кохання, емоційне відкриття, духовний дар." },
                    { 38, 1, null, "Союз · Гармонія", "Two of Cups", "Двійка Кубків", "Розлад, непорозуміння в парі.", 1, "🜄", "Взаємність, партнерство, дружба." },
                    { 39, 1, null, "Свято · Дружба", "Three of Cups", "Трійка Кубків", "Надмір, трикутник, плітки.", 1, "🜄", "Компанія друзів, святкування, радість разом." },
                    { 40, 1, null, "Нудьга · Апатія", "Four of Cups", "Четвірка Кубків", "Повернення інтересу до життя.", 1, "🜄", "Перенасичення, втрата смаку, депресія." },
                    { 41, 1, null, "Розчарування · Жаль", "Five of Cups", "П'ятірка Кубків", "Прощення, рух далі.", 1, "🜄", "Сум за втраченим, але не все втрачено." },
                    { 42, 1, null, "Ностальгія · Дитинство", "Six of Cups", "Шістка Кубків", "Застряг у минулому.", 1, "🜄", "Спогади, зустріч із минулим, невинна радість." },
                    { 43, 1, null, "Ілюзії · Вибір", "Seven of Cups", "Сімка Кубків", "Ясність, реалістичний вибір.", 1, "🜄", "Багато опцій, мрії, небезпека ілюзій." },
                    { 44, 1, null, "Відхід · Пошук", "Eight of Cups", "Вісімка Кубків", "Страх відпустити, повернення.", 1, "🜄", "Залишити те, що більше не годує душу." },
                    { 45, 1, null, "Бажання · Задоволення", "Nine of Cups", "Дев'ятка Кубків", "Поверхневе щастя, самовдоволення.", 1, "🜄", "Здійснення бажань, карта загадування." },
                    { 46, 1, null, "Щастя · Родина", "Ten of Cups", "Десятка Кубків", "Розлад у родині, розчарування.", 1, "🜄", "Гармонія родини, емоційне збуття." },
                    { 47, 1, null, "Мрійник · Новина", "Page of Cups", "Паж Кубків", "Надмірна чутливість, ілюзії.", 1, "🜄", "Творчий імпульс, несподівана пропозиція серця." },
                    { 48, 1, null, "Романтик · Пропозиція", "Knight of Cups", "Лицар Кубків", "Непостійність, розчарування у коханні.", 1, "🜄", "Романтика, пропозиція, ідеалізм." },
                    { 49, 1, null, "Емпатія · Інтуїція", "Queen of Cups", "Королева Кубків", "Емоційна залежність, меланхолія.", 1, "🜄", "Чутлива, мудра жінка, сильна інтуїція." },
                    { 50, 1, null, "Врівноваженість · Опора", "King of Cups", "Король Кубків", "Маніпуляції почуттями, холодність.", 1, "🜄", "Зрілий емоційний спокій, дипломат." },
                    { 51, 1, null, "Ясність · Прорив", "Ace of Swords", "Туз Мечів", "Сплутаність, погане рішення.", 2, "🜁", "Пробиття крізь туман, чітка ідея, правда." },
                    { 52, 1, null, "Глухий кут · Вибір", "Two of Swords", "Двійка Мечів", "Ясність, вихід із патової ситуації.", 2, "🜁", "Вимушений вибір, пат, закриті очі." },
                    { 53, 1, null, "Біль · Зрада", "Three of Swords", "Трійка Мечів", "Зцілення, прощення.", 2, "🜁", "Серцевий біль, розчарування, правда болить." },
                    { 54, 1, null, "Відпочинок · Тиша", "Four of Swords", "Четвірка Мечів", "Виснаження, вимушений простій.", 2, "🜁", "Перерва, відновлення, медитація." },
                    { 55, 1, null, "Конфлікт · Перемога будь-якою ціною", "Five of Swords", "П'ятірка Мечів", "Примирення, каяття.", 2, "🜁", "Пірр. Перемога, але втрати більші." },
                    { 56, 1, null, "Перехід · Подорож", "Six of Swords", "Шістка Мечів", "Застряг у старому болю.", 2, "🜁", "Вихід зі складної ситуації, тихіші води." },
                    { 57, 1, null, "Хитрість · Таємниця", "Seven of Swords", "Сімка Мечів", "Викриття правди, зізнання.", 2, "🜁", "Обережність, стратегія, зрідка — обман." },
                    { 58, 1, null, "Пастка · Обмеження", "Eight of Swords", "Вісімка Мечів", "Звільнення, зняття пов'язки.", 2, "🜁", "Відчуття пастки, але вихід поруч." },
                    { 59, 1, null, "Тривога · Безсоння", "Nine of Swords", "Дев'ятка Мечів", "Пробудження, відпускання думок.", 2, "🜁", "Нічні страхи, провина, тривога." },
                    { 60, 1, null, "Дно · Кінець", "Ten of Swords", "Десятка Мечів", "Повільне відновлення.", 2, "🜁", "Гірке завершення, але вже нижче неможливо. Світанок близько." },
                    { 61, 1, null, "Цікавість · Шпигунство", "Page of Swords", "Паж Мечів", "Плітки, цинізм.", 2, "🜁", "Допитливий розум, новини, пильність." },
                    { 62, 1, null, "Стрімкість · Дія", "Knight of Swords", "Лицар Мечів", "Агресія, імпульсивність.", 2, "🜁", "Рішучий наступ, амбіції, поспіх." },
                    { 63, 1, null, "Розум · Незалежність", "Queen of Swords", "Королева Мечів", "Холодність, цинічність.", 2, "🜁", "Гострий розум, чесна, самодостатня жінка." },
                    { 64, 1, null, "Авторитет · Істина", "King of Swords", "Король Мечів", "Тиранія розуму, жорстокість.", 2, "🜁", "Зрілий інтелект, справедливий суддя, стратег." },
                    { 65, 1, null, "Можливість · Дар", "Ace of Pentacles", "Туз Пентаклів", "Втрата можливості, жадність.", 3, "🜃", "Новий матеріальний старт, робота, гроші." },
                    { 66, 1, null, "Баланс · Жонглювання", "Two of Pentacles", "Двійка Пентаклів", "Перевантаження, дисбаланс.", 3, "🜃", "Гнучкість, керування кількома справами." },
                    { 67, 1, null, "Майстерність · Команда", "Three of Pentacles", "Трійка Пентаклів", "Брак співпраці, погана якість.", 3, "🜃", "Співпраця, визнання вміння, ремесло." },
                    { 68, 1, null, "Стабільність · Стиснення", "Four of Pentacles", "Четвірка Пентаклів", "Втрата, щедрість, відпускання.", 3, "🜃", "Фінансова безпека, контроль, але скнарість." },
                    { 69, 1, null, "Нестача · Ізоляція", "Five of Pentacles", "П'ятірка Пентаклів", "Відновлення, допомога приходить.", 3, "🜃", "Фінансова скрута, хвороба, відчуття вигнанства." },
                    { 70, 1, null, "Щедрість · Обмін", "Six of Pentacles", "Шістка Пентаклів", "Борги, нерівність в обміні.", 3, "🜃", "Дати і отримати, справедливий обмін." },
                    { 71, 1, null, "Терпіння · Оцінка", "Seven of Pentacles", "Сімка Пентаклів", "Марна праця, поспіх.", 3, "🜃", "Пауза для оцінки плодів праці, інвестиції." },
                    { 72, 1, null, "Ремесло · Навчання", "Eight of Pentacles", "Вісімка Пентаклів", "Перфекціонізм, халтура.", 3, "🜃", "Робота над майстерністю, відточення навичок." },
                    { 73, 1, null, "Незалежність · Розкіш", "Nine of Pentacles", "Дев'ятка Пентаклів", "Самотність, залежність від інших.", 3, "🜃", "Плоди власної праці, самодостатність." },
                    { 74, 1, null, "Родина · Спадок", "Ten of Pentacles", "Десятка Пентаклів", "Родинні конфлікти через гроші.", 3, "🜃", "Родинне багатство, спадщина, традиції." },
                    { 75, 1, null, "Учень · Новий шлях", "Page of Pentacles", "Паж Пентаклів", "Лінь, відкладання.", 3, "🜃", "Навчання, прагматичний початок." },
                    { 76, 1, null, "Наполегливість · Рутина", "Knight of Pentacles", "Лицар Пентаклів", "Застій, нудьга.", 3, "🜃", "Стабільний прогрес, надійність." },
                    { 77, 1, null, "Турбота · Достаток", "Queen of Pentacles", "Королева Пентаклів", "Матеріалізм, самозанедбання.", 3, "🜃", "Практична турботлива жінка, господарність." },
                    { 78, 1, null, "Успіх · Майстер", "King of Pentacles", "Король Пентаклів", "Жадібність, корупція.", 3, "🜃", "Успішний лідер у справах, надійний захисник." }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages",
                column: "ConversationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DeleteData(
                table: "Spreads",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Spreads",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Spreads",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Spreads",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Spreads",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 67);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 68);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 69);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 70);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 71);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 72);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 73);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 74);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 75);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 76);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 77);

            migrationBuilder.DeleteData(
                table: "TarotCards",
                keyColumn: "Id",
                keyValue: 78);

            migrationBuilder.DropColumn(
                name: "Keywords",
                table: "TarotCards");

            migrationBuilder.DropColumn(
                name: "Symbol",
                table: "TarotCards");

            migrationBuilder.DropColumn(
                name: "IsFreeMode",
                table: "Spreads");

            migrationBuilder.DropColumn(
                name: "DailyChatMessagesUsed",
                table: "AspNetUsers");
        }
    }
}
