using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Infrastructure.Persistence.Configurations;

// Засіюємо 5 типів розкладів (дані з tarotData.ts).
// RequiredRole підібрано під прайс: 3 карти — Free, 5/7 — Premium, 12/вільний — Vip.
// Вільний розклад: CardCount = 0 + IsFreeMode = true (кількість обирає користувач).
public class SpreadConfiguration : IEntityTypeConfiguration<Spread>
{
    public void Configure(EntityTypeBuilder<Spread> builder)
    {
        builder.HasData(
            new Spread
            {
                Id = 1,
                Name = "Минуле · Теперішнє · Майбутнє",
                Description = "Три карти шикуються зліва направо. Перша — що призвело до ситуації, друга — поточний стан, третя — ймовірний наслідок, якщо нічого не змінювати. Швидкий і ясний погляд на потік часу навколо питання.",
                CardCount = 3,
                RequiredRole = UserRole.Free,
                IsFreeMode = false
            },
            new Spread
            {
                Id = 2,
                Name = "П'ятикутник",
                Description = "Розклад у формі хреста. Центр — суть питання. Зліва — причини, справа — що допомагає, зверху — ідеал/мета, знизу — що заважає. Показує ситуацію з усіх боків.",
                CardCount = 5,
                RequiredRole = UserRole.Premium,
                IsFreeMode = false
            },
            new Spread
            {
                Id = 3,
                Name = "Підкова долі",
                Description = "Сім карт утворюють дугу підкови. Минуле, теперішнє, приховані впливи, поради, зовнішнє середовище, очікування, підсумок. Один із найінформативніших класичних розкладів.",
                CardCount = 7,
                RequiredRole = UserRole.Premium,
                IsFreeMode = false
            },
            new Spread
            {
                Id = 4,
                Name = "Колесо року",
                Description = "Дванадцять карт — по одній на кожен місяць уперед. Ви отримуєте символічну прикмету для кожного місяця: що може статися, до чого бути готовим, на що звернути увагу.",
                CardCount = 12,
                RequiredRole = UserRole.Vip,
                IsFreeMode = false
            },
            new Spread
            {
                Id = 5,
                Name = "Вільний розклад",
                Description = "Ви самі задаєте кількість карт та значення кожної позиції. Повна свобода для досвідчених таролога, які володіють власними методиками або адаптують класичні системи.",
                CardCount = 0,
                RequiredRole = UserRole.Vip,
                IsFreeMode = true
            }
        );
    }
}
