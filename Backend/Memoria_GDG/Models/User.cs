using Memoria_GDG;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace Memoria_GDG
{
    public class User : IdentityUser<int>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Birthday { get; set; } 
        public string Gender { get; set; }
        public string ProfilePictureUrl { get; set; }
        public string CoverPhotoUrl { get; set; } 
        public string Bio { get; set; }
        public bool IsPrivate { get; set; }

        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
        public ICollection<TimeCapsule> TimeCapsules { get; set; } = new List<TimeCapsule>();
        public ICollection<TimeCapsuleViewer> TimeCapsuleViewers { get; set; } = new List<TimeCapsuleViewer>();
        public ICollection<GroupMembership> GroupMemberships { get; set; } = new List<GroupMembership>();
        public ICollection<Group> OwnedGroups { get; set; } = new List<Group>();
        public ICollection<GroupMessage> GroupMessages { get; set; } = new List<GroupMessage>();
    }
}
