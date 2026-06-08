namespace TaroSideAI.Application.Options;

public class AiSettings
{
    public string OpenAiApiKey { get; set; } = null!;
    public string OpenAiApiUrl { get; set; } = "http://localhost:11434";
    public string OpenAiModel { get; set; } = "llama3.1:8b";
}