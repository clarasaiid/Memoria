namespace Memoria_GDG.Dtos
{
    public class CreateFriendshipDto
    {
        public int UserId { get; set; }
        public int FriendId { get; set; }
        public bool Accepted { get; set; }
    }
} 