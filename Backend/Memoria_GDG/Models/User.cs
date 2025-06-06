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

        public ICollection<Post> Posts { get; set; }
        public ICollection<Comment> Comments { get; set; }
        public ICollection<Reaction> Reactions { get; set; }
        public ICollection<TimeCapsule> TimeCapsules { get; set; }
        public ICollection<TimeCapsuleViewer> TimeCapsuleViewers { get; set; }
        public ICollection<GroupMembership> GroupMemberships { get; set; }
        public ICollection<Group> OwnedGroups { get; set; }
        public ICollection<GroupMessage> GroupMessages { get; set; }
    }
}
