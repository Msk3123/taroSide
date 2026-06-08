using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface ISpreadService
{
    public Task<List<SpreadResponseDto>> GetAllSpreadsAsync();
    public Task<SpreadResponseDto?> GetSpreadByIdAsync(int id);
    public Task<SpreadResponseDto> CreateSpreadAsync(SpreadCreateDto dto);
    public Task<SpreadResponseDto?> UpdateSpreadAsync(int id, SpreadUpdateDto dto);
    public Task<bool> DeleteSpreadAsync(int id);
}
