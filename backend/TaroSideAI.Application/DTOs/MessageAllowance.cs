using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.DTOs;

/// <summary>
/// Результат перевірки денних лімітів перед обробкою повідомлення.
/// CanDraw — чи дозволено новий розклад (ліміт розкладів ще не вичерпано).
/// MaxCards — максимум карт, який дозволяє тариф користувача (для захисту від
/// вибору завеликого розкладу на безкоштовному тарифі).
/// Role — роль користувача (для перевірки Spread.RequiredRole).
/// FreeMode / DestinyMatrix — чи відкриті тарифом вільний розклад і Матриця Долі.
/// </summary>
public record MessageAllowance(bool CanDraw, int MaxCards, UserRole Role, bool FreeMode, bool DestinyMatrix);
