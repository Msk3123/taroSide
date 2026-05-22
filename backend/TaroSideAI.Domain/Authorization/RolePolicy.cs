using TaroSideAI.Domain.Enums;

  namespace TaroSideAI.Domain.Authorization;

  public record RolePolicy
  {
      public int  MaxReadingsPerDay     { get; init; }
      public int  MaxChatMessagesPerDay { get; init; }
      public int  MaxCards              { get; init; }
      public int  HistoryDays        { get; init; }
      public bool PartyMode          { get; init; }
      public bool ViralSharing       { get; init; }
      public bool BetterAiPrompt     { get; init; }
      public bool PdfExport          { get; init; }
      public bool FreeMode           { get; init; }
      public bool DestinyMatrix      { get; init; }
      public bool AiTrainer          { get; init; }
      public bool PriorityProcessing { get; init; }
  }

  public static class RolePolicies
  {
      public static RolePolicy For(UserRole role) => role switch
      {
          UserRole.Guest => new RolePolicy
          {
              MaxReadingsPerDay = 0,
              MaxChatMessagesPerDay = 5,
              MaxCards = 0,
              HistoryDays = 0
              // решта bool за замовчуванням false
          },

          UserRole.Free => new RolePolicy
          {
              MaxReadingsPerDay = 2,
              MaxChatMessagesPerDay = 20,
              MaxCards = 3,
              HistoryDays = 3,
              PartyMode = true,
              ViralSharing = true
          },

          UserRole.Premium => new RolePolicy
          {
              MaxReadingsPerDay = 7,
              MaxChatMessagesPerDay = 100,
              MaxCards = 7,
              HistoryDays = int.MaxValue,
              PartyMode = true,
              ViralSharing = true,
              BetterAiPrompt = true,
              PdfExport = true
          },

          UserRole.Vip => new RolePolicy
          {
              MaxReadingsPerDay = 20,
              MaxChatMessagesPerDay = int.MaxValue,
              MaxCards = 12,
              HistoryDays = int.MaxValue,
              PartyMode = true,
              ViralSharing = true,
              BetterAiPrompt = true,
              PdfExport = true,
              FreeMode = true,
              DestinyMatrix = true,
              AiTrainer = true,
              PriorityProcessing = true
          },

          UserRole.Admin => new RolePolicy
          {
              MaxReadingsPerDay = int.MaxValue,
              MaxChatMessagesPerDay = int.MaxValue,
              MaxCards = 78,
              HistoryDays = int.MaxValue,
              PartyMode = true,
              ViralSharing = true,
              BetterAiPrompt = true,
              PdfExport = true,
              FreeMode = true,
              DestinyMatrix = true,
              AiTrainer = true,
              PriorityProcessing = true
          },

          _ => throw new ArgumentOutOfRangeException(nameof(role))
      };
  }