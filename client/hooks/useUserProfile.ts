"use client";

import { gql, useQuery, useMutation } from "@apollo/client";

// Example GraphQL Query to fetch user profile data
const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      displayName
      email
      avatarUrl
      createdAt
    }
  }
`;

// Example GraphQL Mutation to update user profile
const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: uuid!, $displayName: String!, $avatarUrl: String) {
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: { displayName: $displayName, avatarUrl: $avatarUrl }
    ) {
      id
      displayName
      avatarUrl
    }
  }
`;

/**
 * Example hook demonstrating Nhost GraphQL data fetching & caching.
 * Uses Apollo Client which automatically caches responses.
 */
export function useUserProfile(userId: string | undefined) {
  const { data, loading, error, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { userId },
    skip: !userId, // Skip query if no userId is provided
  });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_USER_PROFILE, {
    // Apollo Client automatically updates the cache if we return the modified fields + ID
  });

  const handleUpdateProfile = async (displayName: string, avatarUrl?: string) => {
    if (!userId) return;
    
    await updateProfile({
      variables: {
        userId,
        displayName,
        avatarUrl,
      },
    });
  };

  return {
    userProfile: data?.users_by_pk,
    isLoading: loading,
    isUpdating: updating,
    error,
    updateProfile: handleUpdateProfile,
    refetch,
  };
}
