namespace TaroSideAI.Domain.Entities;

// Факт активації: одна людина може використати той самий код лише раз.
public class PromoRedemption
{
    public Guid Id { get; set; }
    public Guid PromoCodeId { get; set; }
    public PromoCode? PromoCode { get; set; }
    public Guid UserId { get; set; }
    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;

    // Коли знижку вже враховано: адмін видав платний тариф. null — ще діє.
    public DateTime? ConsumedAt { get; set; }
}
