using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class SpreadService 
{
    private readonly ISpreadRepository _spreadRepository;
    public SpreadService(ISpreadRepository spreadRepository)
    {
        _spreadRepository = spreadRepository;
    }

    public async Task<List<SpreadResponseDto>>GetAllSpreadsAsync()
    {
        
        var spreads = await _spreadRepository.GetAllSpreadsAsync();
        return spreads.Select(s => MapToDto(s)).ToList();

    }
    private SpreadResponseDto MapToDto(Spread spread)
    {
        return new SpreadResponseDto
        {
            Id = spread.Id,
            Name = spread.Name,
            Description = spread.Description,
            CardCount = spread.CardCount,
            RequiredRole = spread.RequiredRole,
            IsFreeMode = spread.IsFreeMode
        };
    }
    public async Task<SpreadResponseDto?> GetSpreadByIdAsync(int id)
    {
        var spread = await _spreadRepository.GetSpreadByIdAsync(id);
        if (spread == null)
        {
            return null;
        }
        return MapToDto(spread);    
    }
    public async Task<SpreadResponseDto> CreateSpreadAsync(SpreadCreateDto dto)
    {
        var spread = new Spread
        {
            Name = dto.Name,
            Description = dto.Description,
            CardCount = dto.CardCount,
            RequiredRole = dto.RequiredRole
        };
        var created = await _spreadRepository.CreateSpreadAsync(spread);
        return MapToDto(created);
    }
    public async Task<SpreadResponseDto?>UpdateSpreadAsync(int id, SpreadUpdateDto dto)
    {
        var spread = await _spreadRepository.GetSpreadByIdAsync(id);
        if (spread == null)
            return null;
        spread.Name = dto.Name ?? spread.Name;
        spread.Description = dto.Description ?? spread.Description;
        spread.CardCount = dto.CardCount ?? spread.CardCount;
        var update = await _spreadRepository.UpdateSpreadAsync(spread);
        if (update == null)
            return null;        
        return MapToDto(update);
    }
    public async Task<bool> DeleteSpreadAsync(int id)
    {
        var result = await _spreadRepository.DeleteSpreadAsync(id);
        if (!result)
        {
            throw new Exception("Failed to delete spread");
        }
        return true;
    }
    
    
}