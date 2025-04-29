import React from 'react';
import { FaDiscord, FaTwitter, FaTwitch, FaInstagram } from 'react-icons/fa';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  position: string;
  avatar: string | null;
  bio: string | null;
  displayOrder: number | null;
  socialLinks: {
    discord?: string;
    twitter?: string;
    instagram?: string;
    twitch?: string;
  } | null;
}

interface StaffCardProps {
  member: StaffMember;
}

export function StaffCard({ member }: StaffCardProps) {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'border-red-500 bg-red-500/10';
      case 'admin':
        return 'border-[#00E5FF] bg-[#00E5FF]/10';
      case 'moderador':
        return 'border-violet-500 bg-violet-500/10';
      case 'desenvolvedor':
        return 'border-green-500 bg-green-500/10';
      case 'construtor':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'suporte':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className={`glassmorphism p-5 rounded-lg border-l-4 ${getRoleColor(member.role)} transition-all duration-300 hover:scale-105`}>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <img 
            src={member.avatar || 'https://i.imgur.com/tdi3NGa.png'} 
            alt={member.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-white/20" 
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-white">{member.name}</h3>
          <p className="text-[#00E5FF] font-medium">{member.position}</p>
          <p className="text-gray-300 mt-2 text-sm">{member.bio}</p>
          
          {member.socialLinks && (
            <div className="flex mt-3 gap-3 justify-center md:justify-start">
              {member.socialLinks.discord && (
                <a href={`https://discord.com/users/${member.socialLinks.discord}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#5865F2]">
                  <FaDiscord size={20} />
                </a>
              )}
              {member.socialLinks.twitter && (
                <a href={`https://twitter.com/${member.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2]">
                  <FaTwitter size={20} />
                </a>
              )}
              {member.socialLinks.instagram && (
                <a href={`https://instagram.com/${member.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C]">
                  <FaInstagram size={20} />
                </a>
              )}
              {member.socialLinks.twitch && (
                <a href={`https://twitch.tv/${member.socialLinks.twitch}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#6441A4]">
                  <FaTwitch size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}