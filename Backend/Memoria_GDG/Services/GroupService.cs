using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG.Models;

namespace Memoria_GDG.Services
{
    public class GroupService : IGroupService
    {
        private readonly AppDbContext _context;

        public GroupService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Group> CreateGroup(string name, string description, int createdById)
        {
            var group = new Group
            {
                Name = name,
                Description = description,
                CreatedById = createdById,
                CreatedAt = DateTime.UtcNow
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            // Add creator as admin
            var member = new GroupMember
            {
                GroupId = group.Id,
                UserId = createdById,
                Role = GroupRole.Admin,
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(member);
            await _context.SaveChangesAsync();

            return group;
        }

        public async Task<Group> GetGroup(int groupId)
        {
            return await _context.Groups
                .Include(g => g.Members)
                    .ThenInclude(m => m.User)
                .Include(g => g.GroupMessages)
                    .ThenInclude(m => m.Sender)
                .FirstOrDefaultAsync(g => g.Id == groupId);
        }

        public async Task<IEnumerable<Group>> GetUserGroups(int userId)
        {
            return await _context.GroupMembers
                .Where(gm => gm.UserId == userId)
                .Select(gm => gm.Group)
                .ToListAsync();
        }

        public async Task<bool> AddMember(int groupId, int userId, GroupRole role)
        {
            if (await _context.GroupMembers.AnyAsync(gm => gm.GroupId == groupId && gm.UserId == userId))
                return false;

            var member = new GroupMember
            {
                GroupId = groupId,
                UserId = userId,
                Role = role,
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(member);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveMember(int groupId, int memberId)
        {
            var member = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == groupId && gm.UserId == memberId);

            if (member == null) return false;

            _context.GroupMembers.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMemberRole(int groupId, int memberId, GroupRole newRole)
        {
            var member = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == groupId && gm.UserId == memberId);

            if (member == null) return false;

            member.Role = newRole;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteGroup(int groupId)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null) return false;

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsUserGroupMember(int userId, int groupId)
        {
            return await _context.GroupMembers
                .AnyAsync(gm => gm.UserId == userId && gm.GroupId == groupId);
        }

        public async Task<bool> IsUserGroupAdmin(int userId, int groupId)
        {
            return await _context.GroupMembers
                .AnyAsync(gm => gm.UserId == userId && gm.GroupId == groupId && gm.Role == GroupRole.Admin);
        }
    }
} 