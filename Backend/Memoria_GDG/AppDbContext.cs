using Memoria_GDG;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

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
}
