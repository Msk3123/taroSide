using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface IUserService
{
    public Task<AppUser> CreateUserAsync(CreateUsersDto createUsersDto);
    public Task<AppUser> UpdateUserAsync(AppUser user);
    public Task<AppUser> DeleteUserAsync(AppUser user);
    public Task<AppUser?> GetUserByIdAsync(Guid id);

    /// <summary>Поточне використання лімітів + межі тарифу (із денним обнуленням).</summary>
    public Task<UserUsageDto> GetUsageAsync(Guid userId);

    /// <summary>
    /// Перевіряє денний ліміт повідомлень (кидає LimitExceededException, якщо вичерпано)
    /// та повертає дозвіл на розклад: чи можна тягнути карти + макс. кількість карт за тарифом.
    /// </summary>
    public Task<MessageAllowance> CheckMessageAllowanceAsync(Guid userId);

    /// <summary>Фіксує використане повідомлення (+ розклад, якщо випали карти).</summary>
    public Task RegisterMessageAsync(Guid userId, bool readingHappened);
}
