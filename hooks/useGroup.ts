import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
  createGroup as createGroupService,
  joinGroup as joinGroupService,
  leaveGroup as leaveGroupService,
  deleteGroup as deleteGroupService,
  GroupData,
} from '@/services/groupService';
import { useGroupStore } from '@/store/groupStore';

export function useGroup() {
  const { user, userData, updateCurrentGroup } = useAuth();

  const groupId = useGroupStore((s) => s.groupId);
  const groupCode = useGroupStore((s) => s.groupCode);
  const leaderUid = useGroupStore((s) => s.leaderUid);
  const members = useGroupStore((s) => s.members);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const group = useMemo<GroupData | null>(() => {
    if (!groupId || !groupCode || !leaderUid) return null;
    return { id: groupId, code: groupCode, leaderUid, members, createdAt: 0 };
  }, [groupId, groupCode, leaderUid, members]);

  const isInGroup = !!group;
  const isLeader = isInGroup && leaderUid === user?.uid;

  const createGroup = useCallback(async () => {
    if (!user || !userData) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      const newGroup = await createGroupService({
        leaderUid: user.uid,
        leaderUsername: userData.username,
        leaderAvatarBase64: userData.avatarBase64,
      });
      await updateCurrentGroup(newGroup.id);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [user, userData, updateCurrentGroup]);

  const joinGroup = useCallback(
    async (code: string) => {
      if (!user || !userData) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const joinedGroup = await joinGroupService(code, {
          uid: user.uid,
          username: userData.username,
          avatarBase64: userData.avatarBase64,
        });
        await updateCurrentGroup(joinedGroup.id);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [user, userData, updateCurrentGroup]
  );

  const leaveGroup = useCallback(async () => {
    if (!group || !user) throw new Error('Not in a group');
    setLoading(true);
    setError(null);
    try {
      await leaveGroupService(group.id, user.uid);
      await updateCurrentGroup(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [group, user, updateCurrentGroup]);

  const deleteGroup = useCallback(async () => {
    if (!group || !user) throw new Error('Not in a group');
    if (group.leaderUid !== user.uid) throw new Error('Only the leader can delete the group');
    setLoading(true);
    setError(null);
    try {
      await deleteGroupService(group.id, user.uid);
      await updateCurrentGroup(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [group, user, updateCurrentGroup]);

  return {
    group,
    isInGroup,
    isLeader,
    loading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
  };
}
