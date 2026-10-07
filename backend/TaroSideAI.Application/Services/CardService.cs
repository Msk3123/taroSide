using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class CardService : ICardService
{
    private readonly ICardRepository _cardRepository;

    public CardService(ICardRepository cardRepository)
    {
        _cardRepository = cardRepository;
    }

    public async Task<TarotCard> CreateCardAsync(CreateTarotCardDto dto)
    {
        var card = new TarotCard
        {
            Name = dto.Name,
            NameUkr = dto.NameUkr,
            Arcana = dto.Arcana,
            Suit = dto.Suit,
            UprightMeaning = dto.UprightMeaning,
            ReversedMeaning = dto.ReversedMeaning,
            Keywords = dto.Keywords,
            Symbol = dto.Symbol,
            ImageUrl = dto.ImageUrl
        };

        return await _cardRepository.CreateAsync(card);
    }

    public async Task<TarotCard?> GetCardAsync(int id)
    {
        return await _cardRepository.GetByIdAsync(id);
    }

    public async Task<List<TarotCard>> GetAllCardsAsync()
    {
        return await _cardRepository.GetAllCardAsync();
    }
    public async Task<List<ReadingCard>> DrawRandomCardsAsync(int count)
    {
        if (count <= 0)
            throw new ArgumentException("Кількість карт має бути більше 0", nameof(count));

        var allCards = await _cardRepository.GetAllCardAsync();

        if (count > allCards.Count)
            throw new InvalidOperationException(
                $"Запитано {count} карт, але в колоді лише {allCards.Count}");

        var random = Random.Shared;
        var drawn = allCards
            .OrderBy(_ => random.Next())
            .Take(count)
            .ToList();

        var result = new List<ReadingCard>();
        for (int i = 0; i < drawn.Count; i++)
        {
            result.Add(new ReadingCard
            {
                Card = drawn[i],
                CardId = drawn[i].Id,
                Position = i + 1,                 
                IsReversed = random.Next(2) == 1  
            });
        }

        return result;
    } 
    
    public async Task<DailyCardDto> GetDailyCardAsync(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Вже тягнув сьогодні — віддаємо ту саму карту
        var dailyCard = await _cardRepository.GetDailyCardAsync(userId, today);

        if (dailyCard == null)
        {
            var drawn = await _cardRepository.GetRandomCardAsync(1);
            if (drawn.Count == 0)
                throw new NotFoundException("Карти в колоді");

            dailyCard = await _cardRepository.AddDailyCardAsync(new DailyCard
            {
                UserId = userId,
                Date = today,
                CardId = drawn[0].Id,
                Card = drawn[0],
                IsReversed = Random.Shared.Next(2) == 1
            });
        }

        return new DailyCardDto
        {
            Date = dailyCard.Date,
            CardId = dailyCard.CardId,
            NameUkr = dailyCard.Card.NameUkr,
            Symbol = dailyCard.Card.Symbol,
            Keywords = dailyCard.Card.Keywords,
            IsReversed = dailyCard.IsReversed,
            Meaning = dailyCard.IsReversed ? dailyCard.Card.ReversedMeaning : dailyCard.Card.UprightMeaning
        };
    }
}
