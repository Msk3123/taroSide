namespace TaroSideAI.Application.DTOs;

/// <summary>
/// Результат перевірки денних лімітів перед обробкою повідомлення.
/// CanDraw — чи дозволено новий розклад (ліміт розкладів ще не вичерпано).
/// MaxCards — максимум карт, який дозволяє тариф користувача (для захисту від
/// вибору завеликого розкладу на безкоштовному тарифі).
/// </summary>
public record MessageAllowance(bool CanDraw, int MaxCards);
