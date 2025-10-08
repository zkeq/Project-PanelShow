'use client'

import { Briefcase, Globe, Star } from 'lucide-react'

interface UserProfileCardProps {
  username: string
  displayName: string
  bio: string
  followers: number
  following: number
  company?: string
  website?: string
  stars?: number
  avatar?: string
}

export default function UserProfileCard({
  username,
  displayName,
  bio,
  followers,
  following,
  company,
  website,
  stars,
  avatar
}: UserProfileCardProps) {
  return (
    <div className="w-full bg-background border border-border/40 rounded-lg">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* 头像 */}
          <div className="flex-shrink-0">
            <img
              src={avatar || "https://avatars.githubusercontent.com/u/62864752"}
              alt={displayName}
              className="w-16 h-16 rounded-full border-2 border-border/60"
            />
          </div>
          
          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
              <span className="text-muted-foreground text-base">{username}</span>
            </div>
            
            <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
              {bio}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
              <span>{followers} followers</span>
              <span>·</span>
              <span>{following} following</span>
            </div>
            
            {company && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
                <Briefcase className="w-4 h-4" />
                <span>{company}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-muted-foreground">Aspire to be a pure thinker.</span>
              {website && (
                <a 
                  href={website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <span>{website.replace('https://', '').replace('http://', '')}</span>
                </a>
              )}
              {stars && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <span>{stars}</span>
                  <Star className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}