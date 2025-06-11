using System.Collections.Generic;
using System.Threading.Tasks;
using Memoria_GDG.Models;

namespace Memoria_GDG.Services
{
    public interface IMessageService
    {
        Task<GroupMessage> CreateGroupMessage(int groupId, int senderId, string content);
        Task<GroupMessage> EditGroupMessage(int messageId, int userId, string newContent);
        Task<GroupMessage> DeleteGroupMessage(int messageId, int userId);
        Task<IEnumerable<GroupMessage>> GetGroupMessages(int groupId, int skip = 0, int take = 50);
    }
} 