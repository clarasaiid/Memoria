using System.Collections.Generic;
using System.Threading.Tasks;
using Memoria_GDG.Models;

namespace Memoria_GDG.Services
{
    public interface IGroupService
    {
        Task<Group> CreateGroup(string name, string description, int createdById);
        Task<IEnumerable<Group>> GetUserGroups(int userId);
        Task<Group> GetGroup(int groupId);
        Task<bool> AddMember(int groupId, int userId, GroupRole role);
        Task<bool> RemoveMember(int groupId, int memberId);
        Task<bool> UpdateMemberRole(int groupId, int memberId, GroupRole newRole);
        Task<bool> DeleteGroup(int groupId);
        Task<bool> IsUserGroupMember(int userId, int groupId);
        Task<bool> IsUserGroupAdmin(int userId, int groupId);
    }
} 