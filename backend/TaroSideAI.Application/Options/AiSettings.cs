namespace TaroSideAI.Application.Options;

public class AiSettings
{
    public string OpenAiApiKey { get; set; } = string.Empty;
    public string OpenAiApiUrl { get; set; } = "https://api.openai.com/v1";
    public string OpenAiModel { get; set; } = "gpt-4o-mini";
}