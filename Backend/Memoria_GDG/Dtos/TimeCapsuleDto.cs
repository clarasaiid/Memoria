public class TimeCapsuleDto
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required DateTime OpenAt { get; set; }
    public List<int>? ViewerIds { get; set; }
} 