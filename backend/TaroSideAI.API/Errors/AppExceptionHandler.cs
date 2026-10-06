using Microsoft.AspNetCore.Diagnostics;
using TaroSideAI.Application.Exceptions;

namespace TaroSideAI.API.Errors;

public sealed class AppExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<AppExceptionHandler> log) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            NotFoundException           => (404, "Не знайдено"),
            ForbiddenException          => (403, "Немає доступу"),
            ValidationException         => (400, "Некоректні дані"),
            InvalidCredentialsException => (401, "Не авторизовано"),
            LimitExceededException      => (429, "Денний ліміт вичерпано"),
            _                           => (0, "")
        };

        if (status == 0) return false;

        log.LogWarning("Очікувана помилка {Status}: {Message}", status, ex.Message);

        ctx.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            ProblemDetails = { Title = title, Detail = ex.Message, Status = status }
        });
    }
}