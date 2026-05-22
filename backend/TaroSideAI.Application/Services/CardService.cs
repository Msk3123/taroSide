using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class CardService
{
    private readonly ICardRepository _cardRepository;

    // Залежність приходить через конструктор — це і є Dependency Injection.
    // Ми не пишемо new CardRepository() — .NET сам підставить потрібну реалізацію.
    public CardService(ICardRepository cardRepository)
    {
        _cardRepository = cardRepository;
    }

    public async Task<TarotCard> CreateCardAsync(CreateTarotCardDto dto)
    {
        // Перетворюємо DTO → Entity.
        // Тут можна додати бізнес-правила: валідацію, перевірки, тощо.
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

        // Передаємо в репозиторій — він вже знає як зберегти в БД
        return await _cardRepository.CreateAsync(card);
    }

    public async Task<TarotCard?> GetCardAsync(int id)
    {
        return await _cardRepository.GetByIdAsync(id);
    }

    public async Task<List<TarotCard>> GetAllCardsAsync()
    {
        return await _cardRepository.GetAllAsync();
    }

    
}
