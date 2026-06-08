namespace TaroSideAI.Application.Exceptions;

/// <summary>
/// Кидається, коли користувач перевищив денний ліміт свого тарифу
/// (повідомлення або розклади). Контролер мапить це у HTTP 429.
/// </summary>
public class LimitExceededException : Exception
{
    public LimitExceededException(string message) : base(message) { }
}
