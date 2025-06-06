using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Collections.Specialized.BitVector32;

namespace Memoria_GDG
{
 
        public class Post
        {
            public int Id { get; set; }
            public string Content { get; set; }
            public string ImageUrl { get; set; }
            public DateTime CreatedAt { get; set; }

            public int UserId { get; set; }
            public User User { get; set; }

            public ICollection<Comment> Comments { get; set; }
            public ICollection<Reaction> Reactions { get; set; }
        }

    
}
