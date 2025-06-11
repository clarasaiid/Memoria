using Memoria_GDG.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Memoria_GDG.Models
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<TimeCapsule> TimeCapsules { get; set; }
        public DbSet<TimeCapsuleViewer> TimeCapsuleViewers { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<GroupChat> GroupChats { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<PendingRegistration> PendingRegistrations { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<Block> Blocks { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
    }
}
