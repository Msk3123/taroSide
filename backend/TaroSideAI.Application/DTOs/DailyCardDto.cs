namespace TaroSideAI.Application.DTOs;

public class DailyCardDto
{
    public DateOnly Date { get; set; } //зберігає дату, для якої витягнута карта
    public int CardId { get; set; } //зберігає ідентифікатор карти, яка була витягнута
    public string NameUkr { get; set; } = string.Empty; //зберігає українську назву карти
    public string Symbol { get; set; } = string.Empty; //зберігає символ карти (наприклад, "The Fool", "The Magician" тощо)
    public string Keywords { get; set; } = string.Empty; //зберігає ключові слова карти, які описують її значення
    public bool IsReversed { get; set; } //зберігає інформацію про те, чи була карта витягнута у перевернутому положенні
    public string Meaning { get; set; } = string.Empty; //  зберігає значення карти, яке може бути використане для інтерпретації її впливу на день користувача
}

//Щоб сука не забув)