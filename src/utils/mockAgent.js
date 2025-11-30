// Mock agent methods for account linking functionality
// This extends the existing agent with account linking capabilities

const mockAccountLinking = {
  // Check if user exists with given email
  checkUserExists: async (email) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real app this would be an API call
    const mockUsers = {
      'test@gmail.com': {
        id: 1,
        email: 'test@gmail.com',
        username: 'testuser',
        authMethods: ['google'],
        createdAt: '2024-01-01'
      },
      'user@example.com': {
        id: 2,
        email: 'user@example.com',
        username: 'user',
        authMethods: ['email'],
        createdAt: '2024-01-01'
      }
    };
    
    return mockUsers[email.toLowerCase()] || null;
  },

  // Link social account to existing account
  linkAccounts: async (email, authMethod, userData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate successful linking
    return {
      success: true,
      user: {
        id: 1,
        email,
        username: userData.username || email.split('@')[0],
        authMethods: ['email', authMethod],
        linkedAt: new Date().toISOString()
      }
    };
  },

  // Convert social account to email/password
  convertAccount: async (socialUser, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      user: {
        ...socialUser,
        authMethods: ['email', socialUser.provider],
        convertedAt: new Date().toISOString()
      }
    };
  },

  // Get accounts by email for merging
  getAccountsByEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock duplicate accounts
    if (email.toLowerCase() === 'test@gmail.com') {
      return [
        {
          id: 1,
          email: 'test@gmail.com',
          username: 'testuser',
          authMethods: ['email'],
          totalArticlesCount: 5,
          totalCommentsCount: 12,
          followersCount: 25,
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          email: 'test@gmail.com',
          username: 'testuser_google',
          authMethods: ['google'],
          totalArticlesCount: 3,
          totalCommentsCount: 8,
          followersCount: 18,
          createdAt: '2024-02-10'
        }
      ];
    }
    
    return [];
  },

  // Update user for merging
  updateUser: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, user: userData };
  },

  // Delete duplicate user
  deleteUser: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

// Mock content transfer methods
const mockContentTransfer = {
  transferOwnership: async (fromUserId, toUserId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
};

// Extend existing agent if it exists
if (typeof window !== 'undefined' && window.agent) {
  window.agent.Auth = {
    ...window.agent.Auth,
    ...mockAccountLinking
  };
  
  window.agent.Articles = {
    ...window.agent.Articles,
    ...mockContentTransfer
  };
  
  window.agent.Comments = {
    ...window.agent.Comments,
    ...mockContentTransfer
  };
  
  window.agent.Bookmarks = {
    ...mockContentTransfer
  };
  
  window.agent.Profile = {
    ...window.agent.Profile,
    transferRelationships: mockContentTransfer.transferOwnership
  };
}

export default mockAccountLinking;