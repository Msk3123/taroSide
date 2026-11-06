using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface ICardService
{
    public Task<TarotCard?> GetCardAsync(int id);
    public Task<List<TarotCard>> GetAllCardsAsync();
    public Task<List<ReadingCard>> DrawRandomCardsAsync(int count);

    Task<DailyCardDto> GetDailyCardAsync(Guid userId);

}