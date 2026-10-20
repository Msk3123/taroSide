using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

/// <summary>
/// Чиста математика Матриці Долі + підстановка карт з БД. Без AI і без лімітів.
/// Окремо від IMatrixService, щоб ChatAiService міг рахувати матрицю у function calling
/// без циклічної залежності (MatrixService сам залежить від IChatAiService).
/// </summary>
public interface IMatrixCalculationService
{
    Task<DestinyMatrixDto> CalculateAsync(DateOnly birthDate);
    Task<CompatibilityDto> CompatibilityAsync(DateOnly first, DateOnly second);
}
