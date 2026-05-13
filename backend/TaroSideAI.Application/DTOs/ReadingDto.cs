namespace TaroSideAI.Application.DTOs;

public class CreateReadingDto
{
    Guid spreadId { get; set; }
    string userQuestion { get; set; }
}

public class ReadingResponseDto
{
        Guid Id { get; set; }
        string aiResponse { get; set; }
        string userQuestion { get; set; }
        DateTime createdAt { get; set; }
        
    
}

public class ReadingHistoryDto
{
    Guid Id { get; set; }
    String userQuestion { get; set; }
    DateTime createdAt { get; set; }
    
}