import {api} from '@/utils/request'
import type {MemberRequest, MemberResponse} from '@/types/member'

/**
 * 获取成员列表
 * @returns 成员列表
 */
export const getMembers = (): Promise<MemberResponse[]> => {
  return api.get('/members')
}

/**
 * 获取成员详情
 * @param userId 成员ID
 * @returns 成员详情
 */
export const getMember = (userId: string): Promise<MemberResponse> => {
  return api.get(`/members/${userId}`)
}

/**
 * 创建成员
 * @param data 成员信息
 * @returns 创建的成员信息
 */
export const createMember = (data: MemberRequest): Promise<MemberResponse> => {
  return api.post('/members', data)
}

/**
 * 更新成员信息
 * @param userId 成员ID
 * @param data 成员信息
 * @returns 更新后的成员信息
 */
export const updateMember = (userId: string, data: MemberRequest): Promise<MemberResponse> => {
  return api.put(`/members/${userId}`, data)
}

/**
 * 删除成员
 * @param userId 成员ID
 */
export const deleteMember = (userId: string): Promise<void> => {
  return api.delete(`/members/${userId}`)
}
