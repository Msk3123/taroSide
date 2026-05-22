namespace TaroSideAI.Application.DTOs;

public class CreateReadingDto
{
   public int SpreadId { get; set; }
   public string UserQuestion { get; set; }
}

public class ReadingResponseDto
{
    public int SpreadId { get; set; }
    public Guid UserId { get; set; }
    public Guid Id { get; set; }
    public string AiResponse { get; set; }
    public string UserQuestion { get; set; }
    public DateTime CreatedAt { get; set; }
    public string SpreadName { get; set; }
    public int SpreadCardCount { get; set; }
    public List<ReadingCardDto> Cards { get; set; }

}

public class ReadingHistoryDto
{
    public Guid Id { get; set; }
    public String UserQuestion { get; set; }
    public DateTime CreatedAt { get; set; }
    
}

public class ReadingCardDto
{
    public string CardName { get; set; }
    public string CardNameUkr { get; set; }
    public string Arcana { get; set; }
    public string? Suit { get; set; }
    public string UprightMeaning { get; set; }
    public string ReversedMeaning { get; set; }
    public string? ImageUrl { get; set; }
    public int Position { get; set; }
    public bool IsRevealed { get; set; }
    
}