using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Authorization;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class ReadingService
{
    private readonly IReadingRepository _readingRepository;
    private readonly ISpreadRepository _spreadRepository;
    private readonly ICardRepository _cardRepository;

    public ReadingService(IReadingRepository readingRepository, ISpreadRepository spreadRepository, ICardRepository cardRepository)
    {
        _spreadRepository = spreadRepository;
        _cardRepository = cardRepository;
        _readingRepository = readingRepository;
    }

    public async Task<int> CountTodayReadingsByUserAsync(Guid userId)
    {
        var result = await _readingRepository.CountTodayByUserAsync(userId);
        if (result < 0)
        {
            throw new Exception("Помилка при підрахунку сьогоднішніх розкладів для користувача.");
        }
        return result;
    }

    public async Task<List<ReadingHistoryDto>> GetAllReadingsByUserAsync(Guid userId)
    {
        var result = await _readingRepository.GetAllReadingsAsync(userId);
        if (result == null)
        {
            throw new Exception("Помилка при отриманні розкладів для користувача.");
        }

        return result
            .Select(r => new ReadingHistoryDto
            {
                Id = r.Id,
                UserQuestion = r.UserQuestion,
                CreatedAt = r.CreatedAt
            })
            .ToList();
    }

    public async Task<Reading> GetReadingByIdAsync(Guid id)
    {
        var result = await _readingRepository.GetReadingByIdAsync(id);
        if (result == null)
        {
            throw new Exception("Розклад не знайдено.");
        }
        return result;
    }

    public async Task<ReadingResponseDto> CreateReadingAsync(CreateReadingDto dto, UserResponseDto userDto)
    {
        var policy = RolePolicies.For(userDto.Role);

        var count = await CountTodayReadingsByUserAsync(userDto.Id);
        if (count >= policy.MaxReadingsPerDay)
        {
            throw new Exception($"Ви досягли денного ліміту ({policy.MaxReadingsPerDay}) розкладів.");
        }

        var spread = await _spreadRepository.GetSpreadByIdAsync(dto.SpreadId);
        if (spread == null)
        {
            throw new Exception("Розклад не знайдено.");
        }

        if (userDto.Role < spread.RequiredRole)
        {
            throw new Exception("Недостатньо прав для використання цього розкладу.");
        }

        if (spread.CardCount > policy.MaxCards)
        {
            throw new Exception($"Цей розклад ({spread.CardCount} карт) перевищує ліміт вашого тарифу ({policy.MaxCards}).");
        }

        // TODO (free mode): якщо spread.IsFreeMode — кількість карт брати з запиту користувача
        var randomCards = await _cardRepository.GetRandomCardAsync(spread.CardCount);

        var reading = new Reading
        {
            UserId = userDto.Id,
            SpreadId = spread.Id,
            UserQuestion = dto.UserQuestion,
            AiResponse = "TODO: тут буде відповідь AI", // TODO: підключити генерацію AI
            CreatedAt = DateTime.UtcNow,
            ReadingCards = randomCards
                .Select((card, index) => new ReadingCard
                {
                    CardId = card.Id,
                    Card = card,
                    Position = index + 1,
                    IsReversed = Random.Shared.Next(2) == 0
                })
                .ToList()
        };

        await _readingRepository.CreateReadingAsync(reading);

        return MapToResponse(reading, spread);
    }

    private static ReadingResponseDto MapToResponse(Reading reading, Spread spread) => new()
    {
        Id = reading.Id,
        UserId = reading.UserId ?? Guid.Empty,
        SpreadId = spread.Id,
        SpreadName = spread.Name,
        SpreadCardCount = spread.CardCount,
        UserQuestion = reading.UserQuestion,
        AiResponse = reading.AiResponse,
        CreatedAt = reading.CreatedAt,
        Cards = reading.ReadingCards
            .Select(rc => new ReadingCardDto
            {
                CardName = rc.Card.Name,
                CardNameUkr = rc.Card.NameUkr,
                Arcana = rc.Card.Arcana.ToString(),
                Suit = rc.Card.Suit?.ToString(),
                UprightMeaning = rc.Card.UprightMeaning,
                ReversedMeaning = rc.Card.ReversedMeaning,
                ImageUrl = rc.Card.ImageUrl,
                Position = rc.Position,
                IsRevealed = rc.IsReversed
            })
            .ToList()
    };
}
