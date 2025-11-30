import { supabase } from '../supabaseClient';
import agent from '../agent';

// Merge existing Google and email accounts
export const mergeExistingAccounts = async (email) => {
  try {
    // Check if both Google and email accounts exist for this email
    const existingAccounts = await agent.Auth.getAccountsByEmail(email);
    
    if (!existingAccounts || existingAccounts.length < 2) {
      return { success: false, message: 'No duplicate accounts found to merge' };
    }
    
    const emailAccount = existingAccounts.find(acc => acc.authMethods.includes('email'));
    const googleAccount = existingAccounts.find(acc => acc.authMethods.includes('google'));
    
    if (!emailAccount || !googleAccount) {
      return { success: false, message: 'Both email and Google accounts not found' };
    }
    
    // Merge data from both accounts
    const mergedData = {
      id: emailAccount.id, // Keep email account as primary
      email: email,
      username: emailAccount.username || googleAccount.username,
      bio: emailAccount.bio || googleAccount.bio,
      image: emailAccount.image || googleAccount.image,
      location: emailAccount.location || googleAccount.location,
      website: emailAccount.website || googleAccount.website,
      authMethods: ['email', 'google'],
      
      // Merge statistics
      totalArticlesCount: (emailAccount.totalArticlesCount || 0) + (googleAccount.totalArticlesCount || 0),
      totalCommentsCount: (emailAccount.totalCommentsCount || 0) + (googleAccount.totalCommentsCount || 0),
      totalLikesReceived: (emailAccount.totalLikesReceived || 0) + (googleAccount.totalLikesReceived || 0),
      followersCount: Math.max(emailAccount.followersCount || 0, googleAccount.followersCount || 0),
      followingCount: Math.max(emailAccount.followingCount || 0, googleAccount.followingCount || 0),
      
      // Keep earliest creation date
      createdAt: new Date(Math.min(
        new Date(emailAccount.createdAt || Date.now()),
        new Date(googleAccount.createdAt || Date.now())
      )).toISOString(),
      
      mergedAt: new Date().toISOString(),
      mergedFrom: googleAccount.id
    };
    
    // Update primary account with merged data
    const updateResult = await agent.Auth.updateUser(mergedData);
    
    if (updateResult.success) {
      // Transfer articles, comments, and other content from Google account to email account
      await transferUserContent(googleAccount.id, emailAccount.id);
      
      // Delete the duplicate Google account
      await agent.Auth.deleteUser(googleAccount.id);
      
      return {
        success: true,
        message: 'Accounts successfully merged',
        mergedAccount: mergedData
      };
    } else {
      throw new Error('Failed to update merged account data');
    }
    
  } catch (error) {
    console.error('Account merging error:', error);
    return {
      success: false,
      message: error.message || 'Failed to merge accounts'
    };
  }
};

// Transfer content from one account to another
const transferUserContent = async (fromUserId, toUserId) => {
  try {
    // Transfer articles
    await agent.Articles.transferOwnership(fromUserId, toUserId);
    
    // Transfer comments
    await agent.Comments.transferOwnership(fromUserId, toUserId);
    
    // Transfer bookmarks
    await agent.Bookmarks.transferOwnership(fromUserId, toUserId);
    
    // Transfer followers/following relationships
    await agent.Profile.transferRelationships(fromUserId, toUserId);
    
    return { success: true };
  } catch (error) {
    console.error('Content transfer error:', error);
    throw error;
  }
};

// Check for duplicate accounts on login
export const checkForDuplicateAccounts = async (email, currentAuthMethod) => {
  try {
    const accounts = await agent.Auth.getAccountsByEmail(email);
    
    if (accounts && accounts.length > 1) {
      return {
        hasDuplicates: true,
        accounts: accounts,
        canMerge: true,
        message: `Found ${accounts.length} accounts with this email. Would you like to merge them?`
      };
    }
    
    return { hasDuplicates: false };
  } catch (error) {
    console.error('Duplicate check error:', error);
    return { hasDuplicates: false };
  }
};

// Auto-merge accounts during login if user consents
export const autoMergeOnLogin = async (email, password = null) => {
  try {
    const duplicateCheck = await checkForDuplicateAccounts(email);
    
    if (!duplicateCheck.hasDuplicates) {
      return { needsMerge: false };
    }
    
    // If password provided, verify it belongs to email account
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error('Invalid password for email account');
      }
    }
    
    // Perform merge
    const mergeResult = await mergeExistingAccounts(email);
    
    if (mergeResult.success) {
      return {
        needsMerge: false,
        merged: true,
        account: mergeResult.mergedAccount,
        message: 'Accounts successfully merged during login'
      };
    } else {
      return {
        needsMerge: true,
        error: mergeResult.message
      };
    }
    
  } catch (error) {
    return {
      needsMerge: true,
      error: error.message || 'Failed to merge accounts'
    };
  }
};