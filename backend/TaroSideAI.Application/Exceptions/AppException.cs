namespace TaroSideAI.Application.Exceptions;

public abstract class AppException(string message) : Exception(message);

public sealed class NotFoundException(string what) : AppException($"{what} не знайдено");

public sealed class ForbiddenException(string message) : AppException(message);

public sealed class ValidationException(string message) : AppException(message);

public sealed class InvalidCredentialsException() : AppException("Невірний логін або пароль");