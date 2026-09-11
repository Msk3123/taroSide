using TaroSideAI.Application.DTOs;
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
}

