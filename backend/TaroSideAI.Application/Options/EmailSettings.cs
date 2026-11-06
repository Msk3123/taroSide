namespace TaroSideAI.Application.Options;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Lunaris";
    public bool EnableSsl { get; set; } = true;

    /// <summary>Адреса сайту для посилань у листах. Береться лише з конфігурації, не із запиту,
    /// щоб підроблений заголовок Host не міг підмінити посилання.</summary>
    public string PublicSiteUrl { get; set; } = string.Empty;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(SmtpHost) &&
        !string.IsNullOrWhiteSpace(User) &&
        !string.IsNullOrWhiteSpace(Password) &&
        !string.IsNullOrWhiteSpace(PublicSiteUrl);
}
